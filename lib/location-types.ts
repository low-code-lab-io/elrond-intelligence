// Types shared between the /api/location-data route and the page.

export interface AirParameter {
  name: string; // e.g. "pm25"
  label: string; // e.g. "PM2.5"
  units: string;
  value: number | null; // latest value, if we fetched it
  observedAt: string | null; // ISO UTC
}

export interface AirStation {
  id: number;
  name: string;
  locality: string | null;
  country: string | null;
  lat: number;
  lon: number;
  distanceKm: number;
  provider: string | null;
  owner: string | null;
  instruments: string[];
  isMonitor: boolean;
  firstReported: string | null;
  lastReported: string | null;
  active: boolean; // reported within the last 7 days
  license: string | null;
  parameters: AirParameter[];
  url: string; // station page on OpenAQ Explorer
}

export interface JrcDataset {
  id: string;
  title: string;
  description: string;
  modified: string | null;
  url: string; // dataset page in the JRC Data Catalogue
}

export type SourceResult<T> = { ok: true; data: T } | { ok: false; error: string };

export interface OpenAqPayload {
  stations: AirStation[];
  totalFound: number;
  radiusKm: number;
}

export interface JrcPayload {
  datasets: JrcDataset[];
  total: number;
  query: string;
}

export interface LocationSearchResponse {
  location: { lat: number; lon: number; label: string; geocoded: boolean } | null;
  openaq?: SourceResult<OpenAqPayload>;
  jrc?: SourceResult<JrcPayload>;
}
