import type { NextRequest } from "next/server";
import { parseCoordinates } from "@/lib/geo";
import { geocodeAddress } from "@/lib/geocode";
import { searchOpenAQ } from "@/lib/openaq";
import { searchJrc } from "@/lib/jrc";
import { allow } from "@/lib/ratelimit";
import type { LocationSearchResponse } from "@/lib/location-types";

// Always run per request (results depend on the query string).
export const dynamic = "force-dynamic";

function bad(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!allow(ip)) return bad("Too many searches — please wait a minute and try again.", 429);

  const p = req.nextUrl.searchParams;
  const sources = new Set((p.get("sources") ?? "").split(",").filter(Boolean));
  const wantOpenAq = sources.has("openaq");
  const wantJrc = sources.has("jrc");
  if (!wantOpenAq && !wantJrc) return bad("Choose at least one data source.");

  const address = (p.get("address") ?? "").trim().slice(0, 200);
  const coords = (p.get("coords") ?? "").trim().slice(0, 60);
  const term = (p.get("q") ?? "").trim().slice(0, 120);
  const radiusKm = Math.min(25, Math.max(1, Number(p.get("radius")) || 10));

  if (wantJrc && !term) return bad("Enter a search term for the JRC Data Catalogue.");
  if (wantOpenAq && !address && !coords) {
    return bad("Enter an address or coordinates for OpenAQ.");
  }

  const out: LocationSearchResponse = { location: null };

  // Resolve the location only when OpenAQ needs it.
  if (wantOpenAq) {
    if (coords) {
      const c = parseCoordinates(coords);
      if (!c) return bad("Couldn't read those coordinates. Try e.g. 55.6761, 12.5683.");
      out.location = { ...c, label: `${c.lat.toFixed(4)}, ${c.lon.toFixed(4)}`, geocoded: false };
    } else {
      try {
        const g = await geocodeAddress(address);
        if (!g) return bad("We couldn't find that address. Try adding the city or country.");
        out.location = { lat: g.lat, lon: g.lon, label: g.label, geocoded: true };
      } catch {
        return bad("The address lookup is unavailable right now. Try coordinates instead.", 502);
      }
    }
  }

  const loc = out.location;
  const [openaq, jrc] = await Promise.all([
    wantOpenAq && loc
      ? searchOpenAQ(loc, radiusKm).then(
          (data) => ({ ok: true as const, data }),
          (e: Error) => ({ ok: false as const, error: e.message })
        )
      : undefined,
    wantJrc
      ? searchJrc(term).then(
          (data) => ({ ok: true as const, data }),
          (e: Error) => ({ ok: false as const, error: e.message })
        )
      : undefined,
  ]);

  if (openaq) out.openaq = openaq;
  if (jrc) out.jrc = jrc;
  return Response.json(out);
}
