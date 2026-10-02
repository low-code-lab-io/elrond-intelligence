// Shared by the browser (instant validation) and the server (authoritative check).

export interface LatLon {
  lat: number;
  lon: number;
}

/**
 * Parses "55.6761, 12.5683", "55.6761 12.5683" or "55.6761° N, 12.5683° E".
 * Dot decimals only; comma/space separate the two values.
 */
export function parseCoordinates(input: string): LatLon | null {
  const re = /(-?\d+(?:\.\d+)?)\s*°?\s*([NSEW])?/gi;
  const found: { value: number; hemi: string | null }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(input)) !== null && found.length < 3) {
    found.push({ value: parseFloat(m[1]), hemi: m[2] ? m[2].toUpperCase() : null });
  }
  if (found.length !== 2) return null;

  let [a, b] = found;
  // "12.5 E, 55.6 N" -> swap so latitude comes first.
  if ((a.hemi === "E" || a.hemi === "W") && (b.hemi === "N" || b.hemi === "S")) {
    [a, b] = [b, a];
  }
  const lat = a.hemi === "S" ? -Math.abs(a.value) : a.value;
  const lon = b.hemi === "W" ? -Math.abs(b.value) : b.value;
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
  return { lat, lon };
}

export function distanceKm(a: LatLon, b: LatLon): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
