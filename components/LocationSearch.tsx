"use client";

import { useMemo, useState } from "react";
import { parseCoordinates } from "@/lib/geo";
import type {
  AirStation,
  LocationSearchResponse,
  SourceResult,
  OpenAqPayload,
  JrcPayload,
} from "@/lib/location-types";

type SourceId = "openaq" | "jrc";
type LocMode = "address" | "coords";

const SOURCES: { id: SourceId; label: string; hint: string }[] = [
  { id: "openaq", label: "OpenAQ air quality", hint: "stations near a place" },
  { id: "jrc", label: "JRC Data Catalogue", hint: "EU research datasets" },
];

function Pill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className="pill" aria-pressed={active} onClick={onClick}>
      {label}
    </button>
  );
}

function fmtDate(iso: string | null): string {
  if (!iso) return "unknown";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "unknown"
    : d.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
}

function fmtValue(v: number): string {
  return Math.abs(v) >= 100 ? v.toFixed(0) : v.toFixed(1);
}

function Station({ s }: { s: AirStation }) {
  const withValues = s.parameters.filter((p) => p.value !== null);
  const noValues = s.parameters.filter((p) => p.value === null);
  return (
    <div className="entry">
      <div className="entry-head">
        <span className="entry-type">
          [{s.isMonitor ? "REFERENCE MONITOR" : "SENSOR"}]
        </span>
        <span className={s.active ? "status ok" : "status stale"}>
          {s.active ? "reporting" : "no recent data"}
        </span>
      </div>
      <p className="entry-name">
        <a href={s.url} target="_blank" rel="noopener noreferrer">
          {s.name}
        </a>
      </p>
      <p className="entry-desc">
        {s.distanceKm.toFixed(1)} km away
        {s.locality ? ` · ${s.locality}` : ""}
        {s.country ? `, ${s.country}` : ""}
        {s.instruments.length ? ` · ${s.instruments.join(", ")}` : ""}
      </p>

      {withValues.length > 0 && (
        <div className="tag-row">
          {withValues.map((p) => (
            <span className="tag" key={p.name} title={`Observed ${fmtDate(p.observedAt)}`}>
              {p.label} {fmtValue(p.value as number)} {p.units}
            </span>
          ))}
        </div>
      )}
      {noValues.length > 0 && (
        <div className="tag-row">
          {noValues.map((p) => (
            <span className="tag sector" key={p.name}>
              {p.label}
            </span>
          ))}
        </div>
      )}

      <div className="meta-line">
        Last reported {fmtDate(s.lastReported)}
        {s.provider ? ` · Provider: ${s.provider}` : ""}
        {s.license ? ` · Licence: ${s.license}` : " · Licence: see station page"}
        {" · "}
        <a href={s.url} target="_blank" rel="noopener noreferrer">
          View on OpenAQ Explorer ↗
        </a>
      </div>
    </div>
  );
}

function OpenAqSection({ r, label }: { r: SourceResult<OpenAqPayload>; label: string }) {
  return (
    <section className="result-section">
      <h2 className="result-title">Air quality stations</h2>
      <p className="source-credit">
        Source:{" "}
        <a href="https://openaq.org" target="_blank" rel="noopener noreferrer">
          OpenAQ
        </a>{" "}
        — open air-quality data aggregated from government and community
        providers (named per station). Licences are set per provider.{" "}
        <a href="https://explore.openaq.org" target="_blank" rel="noopener noreferrer">
          Explore more on OpenAQ ↗
        </a>
      </p>
      {!r.ok ? (
        <div className="error" role="alert">{r.error}</div>
      ) : r.data.stations.length === 0 ? (
        <div className="empty">
          No stations within {r.data.radiusKm} km of {label}. Try a larger radius.
        </div>
      ) : (
        <>
          <p className="count">
            Showing <strong>{r.data.stations.length}</strong> of {r.data.totalFound}{" "}
            stations within {r.data.radiusKm} km — reporting stations first, then
            nearest.
          </p>
          <div className="list">
            {r.data.stations.map((s) => (
              <Station key={s.id} s={s} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function JrcSection({ r }: { r: SourceResult<JrcPayload> }) {
  return (
    <section className="result-section">
      <h2 className="result-title">Research datasets</h2>
      <p className="source-credit">
        Source:{" "}
        <a href="https://data.jrc.ec.europa.eu" target="_blank" rel="noopener noreferrer">
          JRC Data Catalogue
        </a>
        , European Commission Joint Research Centre. Licence and terms of use are
        set per dataset — see each dataset page and the{" "}
        <a
          href="https://commission.europa.eu/legal-notice_en"
          target="_blank"
          rel="noopener noreferrer"
        >
          legal notice
        </a>
        .
      </p>
      {!r.ok ? (
        <div className="error" role="alert">{r.error}</div>
      ) : r.data.datasets.length === 0 ? (
        <div className="empty">
          No datasets matched “{r.data.query}”. The catalogue matches keywords
          in titles and descriptions, so try a broader or different term.
        </div>
      ) : (
        <>
          <p className="count">
            Showing <strong>{r.data.datasets.length}</strong> of {r.data.total} datasets
            matching “{r.data.query}”.{" "}
            <a href="https://data.jrc.ec.europa.eu" target="_blank" rel="noopener noreferrer">
              Browse the full catalogue ↗
            </a>
          </p>
          <div className="list">
            {r.data.datasets.map((d) => (
              <div className="entry" key={d.id}>
                <div className="entry-head">
                  <span className="entry-type">[DATASET]</span>
                </div>
                <p className="entry-name">
                  <a href={d.url} target="_blank" rel="noopener noreferrer">
                    {d.title}
                  </a>
                </p>
                {d.description && (
                  <p className="entry-desc">
                    {d.description.length > 320
                      ? d.description.slice(0, 320).trimEnd() + "…"
                      : d.description}
                  </p>
                )}
                <div className="meta-line">
                  Modified {fmtDate(d.modified)} ·{" "}
                  <a href={d.url} target="_blank" rel="noopener noreferrer">
                    View in JRC Data Catalogue ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export default function LocationSearch() {
  const [sources, setSources] = useState<Set<SourceId>>(new Set());
  const [locMode, setLocMode] = useState<LocMode>("address");
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState("");
  const [radius, setRadius] = useState("10");
  const [term, setTerm] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LocationSearchResponse | null>(null);

  const useOpenAq = sources.has("openaq");
  const useJrc = sources.has("jrc");
  const both = useOpenAq && useJrc;

  function toggleSource(id: SourceId) {
    const next = new Set(sources);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSources(next);
  }

  // What is still missing, given the selected sources.
  const missing = useMemo(() => {
    const m: string[] = [];
    if (sources.size === 0) return ["a data source"];
    if (useOpenAq) {
      if (locMode === "address" && !address.trim()) m.push("an address");
      if (locMode === "coords") {
        if (!coords.trim()) m.push("coordinates");
        else if (!parseCoordinates(coords)) m.push("valid coordinates (e.g. 55.6761, 12.5683)");
      }
    }
    if (useJrc && !term.trim()) m.push("a search term");
    return m;
  }, [sources, useOpenAq, useJrc, locMode, address, coords, term]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (missing.length > 0) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const qs = new URLSearchParams({ sources: Array.from(sources).join(",") });
    if (useOpenAq) {
      if (locMode === "address") qs.set("address", address.trim());
      else qs.set("coords", coords.trim());
      qs.set("radius", radius);
    }
    if (useJrc) qs.set("q", term.trim());

    try {
      const res = await fetch(`/api/location-data?${qs.toString()}`);
      const body = await res.json();
      if (!res.ok) setError(body.error ?? "Something went wrong.");
      else setResult(body as LocationSearchResponse);
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form className="controls" onSubmit={submit} noValidate>
        <div className="facet">
          <div className="facet-label">Search in</div>
          <div className="pills">
            {SOURCES.map((s) => (
              <Pill
                key={s.id}
                label={s.label}
                active={sources.has(s.id)}
                onClick={() => toggleSource(s.id)}
              />
            ))}
          </div>
          <p className="field-note">
            Choose one or both.{" "}
            {both && "With both selected, a location and a search term are both required."}
          </p>
        </div>

        {useOpenAq && (
          <div className="facet">
            <div className="facet-label">
              Location <span className="req">required</span> — for OpenAQ
            </div>
            <div className="pills">
              <Pill label="Address" active={locMode === "address"} onClick={() => setLocMode("address")} />
              <Pill label="Coordinates" active={locMode === "coords"} onClick={() => setLocMode("coords")} />
            </div>
            <div className="search-row">
              {locMode === "address" ? (
                <>
                  <label htmlFor="address">Address</label>
                  <input
                    id="address"
                    type="text"
                    placeholder="e.g. Rådhuspladsen 1, Copenhagen"
                    autoComplete="off"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </>
              ) : (
                <>
                  <label htmlFor="coords">Lat, Lon</label>
                  <input
                    id="coords"
                    type="text"
                    placeholder="55.6761, 12.5683 or 55.6761° N, 12.5683° E"
                    autoComplete="off"
                    value={coords}
                    onChange={(e) => setCoords(e.target.value)}
                  />
                </>
              )}
            </div>
            <div className="search-row narrow">
              <label htmlFor="radius">Radius</label>
              <input
                id="radius"
                type="number"
                min={1}
                max={25}
                step={1}
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
              />
              <span className="unit">km (1–25)</span>
            </div>
          </div>
        )}

        {useJrc && (
          <div className="facet">
            <div className="facet-label">
              Search term <span className="req">required</span> — for JRC Data Catalogue
            </div>
            <div className="search-row">
              <label htmlFor="term">Term</label>
              <input
                id="term"
                type="text"
                placeholder="a place or topic, e.g. Dresden or flood"
                autoComplete="off"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
              />
            </div>
            <p className="field-note">
              The catalogue matches keywords in dataset titles and descriptions; it
              can&apos;t search by map coordinates.
            </p>
          </div>
        )}

        {sources.size > 0 && (
          <div className="clear-row">
            <button type="submit" className="submit" disabled={loading || missing.length > 0}>
              {loading ? "Searching…" : "Search"}
            </button>
            {missing.length > 0 && (
              <span className="field-note inline">Still needed: {missing.join(", ")}.</span>
            )}
          </div>
        )}
      </form>

      {error && <div className="error" role="alert">{error}</div>}

      {result && (
        <div aria-live="polite">
          {result.location && (
            <p className="count">
              Location:{" "}
              <strong>{result.location.label}</strong> ({result.location.lat.toFixed(4)},{" "}
              {result.location.lon.toFixed(4)})
              {result.location.geocoded && (
                <>
                  {" "}
                  — address lookup ©{" "}
                  <a
                    href="https://www.openstreetmap.org/copyright"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    OpenStreetMap contributors
                  </a>
                </>
              )}
            </p>
          )}
          {result.openaq && result.location && (
            <OpenAqSection r={result.openaq} label={result.location.label} />
          )}
          {result.jrc && <JrcSection r={result.jrc} />}
        </div>
      )}

      {sources.size === 0 && !result && (
        <div className="empty">Choose a data source above to get started.</div>
      )}
    </>
  );
}
