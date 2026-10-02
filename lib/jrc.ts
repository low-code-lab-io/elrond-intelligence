// JRC Data Catalogue public API v2 (no key required). Server-side only so we
// control caching and don't depend on browser CORS.
import "server-only";
import type { JrcDataset, JrcPayload } from "./location-types";

const BASE = "https://data.jrc.ec.europa.eu";
const PAGE_SIZE = 10;

interface Localized {
  lang: string;
  text: string;
}

function pick(list: Localized[] | undefined): string {
  if (!list?.length) return "";
  return (list.find((x) => x.lang === "en") ?? list[0]).text ?? "";
}

export async function searchJrc(query: string): Promise<JrcPayload> {
  const url = new URL(`${BASE}/api/2/datasets`);
  url.searchParams.set("query", query);
  url.searchParams.set("page", "1"); // required by the API
  url.searchParams.set("size", String(PAGE_SIZE));

  const res = await fetch(url, {
    method: "POST", // search is POST; the body is a (here empty) list of facet filters
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: "[]",
    next: { revalidate: 3600 },
  }).catch(() => {
    throw new Error("The JRC Data Catalogue can't be reached right now. Please try again later.");
  });
  if (!res.ok) throw new Error(`The JRC Data Catalogue returned an error (${res.status}).`);

  const j = (await res.json()) as {
    total: number;
    results: {
      id: string;
      titles?: Localized[];
      descriptions?: Localized[];
      page?: string;
      modified?: string;
    }[];
  };

  const datasets: JrcDataset[] = (j.results ?? []).map((r) => ({
    id: r.id,
    title: pick(r.titles) || "Untitled dataset",
    description: pick(r.descriptions),
    modified: r.modified ?? null,
    url: r.page ?? `${BASE}/dataset/${r.id}`,
  }));

  return { datasets, total: j.total ?? datasets.length, query };
}
