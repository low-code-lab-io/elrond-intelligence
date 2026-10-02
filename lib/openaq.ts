// OpenAQ v3 client. SERVER-ONLY: reads OPENAQ_API_KEY, which must never be
// prefixed NEXT_PUBLIC_ and is never sent to the browser.
import "server-only";
import { distanceKm, type LatLon } from "./geo";
import type { AirParameter, AirStation, OpenAqPayload } from "./location-types";

const BASE = "https://api.openaq.org/v3";
const ACTIVE_WITHIN_MS = 7 * 24 * 3600 * 1000;
const MAX_STATIONS = 10;
const VALUE_FRESH_MS = 3 * 24 * 3600 * 1000; // older "latest" values are not shown as current
const LATEST_FOR = 6; // nearest active stations get latest values (rate-limit friendly)

const LABELS: Record<string, string> = {
  pm1: "PM1",
  pm25: "PM2.5",
  pm10: "PM10",
  no2: "NO₂",
  no: "NO",
  nox: "NOx",
  o3: "O₃",
  co: "CO",
  so2: "SO₂",
  bc: "BC",
  co2: "CO₂",
  ch4: "CH₄",
  temperature: "Temperature",
  relativehumidity: "Humidity",
  um003: "PM0.3 count",
};

export class UpstreamError extends Error {}

async function oaq<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const key = process.env.OPENAQ_API_KEY;
  if (!key) throw new UpstreamError("OpenAQ is not configured on this server.");

  const url = new URL(BASE + path);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(url, {
    headers: { "X-API-Key": key, Accept: "application/json" },
    next: { revalidate: 600 }, // 10 min cache keeps us far below the 60 req/min limit
  }).catch(() => {
    throw new UpstreamError("OpenAQ can't be reached right now. Please try again later.");
  });
  if (res.status === 429) {
    throw new UpstreamError("OpenAQ is busy right now (rate limit). Please try again in a minute.");
  }
  if (!res.ok) throw new UpstreamError(`OpenAQ returned an error (${res.status}).`);
  return (await res.json()) as T;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function toStation(l: any, origin: LatLon): AirStation {
  const lastReported: string | null = l.datetimeLast?.utc ?? null;
  const active = lastReported ? Date.now() - Date.parse(lastReported) < ACTIVE_WITHIN_MS : false;
  const rawName = typeof l.name === "string" ? l.name.replace(/^"+|"+$/g, "").trim() : "";
  const parameters: AirParameter[] = (l.sensors ?? []).map((s: any) => ({
    name: s.parameter?.name ?? "",
    label: LABELS[s.parameter?.name] ?? s.parameter?.displayName ?? s.parameter?.name ?? "?",
    units: s.parameter?.units === "c" ? "°C" : (s.parameter?.units ?? ""),
    value: null,
    observedAt: null,
  }));
  return {
    id: l.id,
    name: rawName || "Unnamed station",
    locality: l.locality ?? null,
    country: l.country?.name ?? null,
    lat: l.coordinates.latitude,
    lon: l.coordinates.longitude,
    distanceKm: distanceKm(origin, { lat: l.coordinates.latitude, lon: l.coordinates.longitude }),
    provider: l.provider?.name ?? null,
    owner: l.owner?.name ?? null,
    instruments: (l.instruments ?? []).map((i: any) => i.name).filter(Boolean),
    isMonitor: Boolean(l.isMonitor),
    firstReported: l.datetimeFirst?.utc ?? null,
    lastReported,
    active,
    license: l.licenses?.[0]?.name ?? null,
    parameters,
    url: `https://explore.openaq.org/locations/${l.id}`,
  };
}

async function attachLatest(station: AirStation, sensorIdToParam: Map<number, number>) {
  const j = await oaq<{ results: any[] }>(`/locations/${station.id}/latest`);
  for (const r of j.results ?? []) {
    const idx = sensorIdToParam.get(r.sensorsId);
    if (idx === undefined) continue;
    const observed = r.datetime?.utc ? Date.parse(r.datetime.utc) : NaN;
    if (!Number.isFinite(observed) || Date.now() - observed > VALUE_FRESH_MS) continue;
    station.parameters[idx].value = typeof r.value === "number" ? r.value : null;
    station.parameters[idx].observedAt = r.datetime?.utc ?? null;
  }
}

export async function searchOpenAQ(origin: LatLon, radiusKm: number): Promise<OpenAqPayload> {
  const j = await oaq<{ meta: { found: number | string }; results: any[] }>("/locations", {
    coordinates: `${origin.lat},${origin.lon}`,
    radius: String(Math.round(radiusKm * 1000)),
    limit: "100",
  });

  const raw = j.results ?? [];
  const sensorMaps = new Map<number, Map<number, number>>();
  const stations = raw.map((l) => {
    const st = toStation(l, origin);
    sensorMaps.set(
      st.id,
      new Map((l.sensors ?? []).map((s: any, i: number) => [s.id as number, i] as [number, number]))
    );
    return st;
  });

  // Active stations first, then nearest.
  stations.sort((a, b) => Number(b.active) - Number(a.active) || a.distanceKm - b.distanceKm);
  const shown = stations.slice(0, MAX_STATIONS);

  await Promise.allSettled(
    shown
      .filter((s) => s.active)
      .slice(0, LATEST_FOR)
      .map((s) => attachLatest(s, sensorMaps.get(s.id)!))
  );

  return { stations: shown, totalFound: raw.length, radiusKm };
}
