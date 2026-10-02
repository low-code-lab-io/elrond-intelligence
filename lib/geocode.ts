// Address -> coordinates via OpenStreetMap Nominatim (server-side only).
// Usage policy: identify the app via User-Agent, max ~1 req/s, show attribution.

export interface Geocoded {
  lat: number;
  lon: number;
  label: string;
}

export async function geocodeAddress(address: string): Promise<Geocoded | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", address);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");

  const res = await fetch(url, {
    headers: {
      "User-Agent": "elrond-intelligence-directory/1.0 (location data search)",
      Accept: "application/json",
    },
    next: { revalidate: 60 * 60 * 24 },
  });
  if (!res.ok) throw new Error(`Geocoder returned ${res.status}`);
  const rows = (await res.json()) as { lat: string; lon: string; display_name: string }[];
  if (!rows.length) return null;
  return { lat: parseFloat(rows[0].lat), lon: parseFloat(rows[0].lon), label: rows[0].display_name };
}
