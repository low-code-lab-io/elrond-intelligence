"use client";

import { useMemo, useState } from "react";
import type { Entity, EntityType } from "@/lib/types";
import { ENTITY_TYPE_LABELS } from "@/lib/types";

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
    <button
      type="button"
      className="pill"
      aria-pressed={active}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values)).sort();
}

export default function Directory({ entities }: { entities: Entity[] }) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<EntityType | null>(null);
  const [topics, setTopics] = useState<Set<string>>(new Set());
  const [sectors, setSectors] = useState<Set<string>>(new Set());

  const allTypes = useMemo(
    () => uniqueSorted(entities.map((e) => e.entity_type)) as EntityType[],
    [entities]
  );
  const allTopics = useMemo(
    () => uniqueSorted(entities.flatMap((e) => e.topics)),
    [entities]
  );
  const allSectors = useMemo(
    () => uniqueSorted(entities.flatMap((e) => e.sectors)),
    [entities]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entities.filter((e) => {
      if (type && e.entity_type !== type) return false;
      if (topics.size > 0 && !e.topics.some((t) => topics.has(t))) return false;
      if (sectors.size > 0 && !e.sectors.some((s) => sectors.has(s))) return false;
      if (q && !(e.name + " " + e.description).toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [entities, search, type, topics, sectors]);

  function toggle(set: Set<string>, value: string, setter: (s: Set<string>) => void) {
    const next = new Set(set);
    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }
    setter(next);
  }

  const anyFilter = Boolean(search) || type !== null || topics.size > 0 || sectors.size > 0;

  function clearAll() {
    setSearch("");
    setType(null);
    setTopics(new Set());
    setSectors(new Set());
  }

  return (
    <>
      <p className="count">
        <strong>{filtered.length}</strong> of {entities.length} entries shown
      </p>

      <div className="controls">
        <div className="search-row">
          <label htmlFor="search">Search</label>
          <input
            id="search"
            type="text"
            placeholder="name or description…"
            autoComplete="off"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="facet">
          <div className="facet-label">Type</div>
          <div className="pills">
            <Pill label="All" active={type === null} onClick={() => setType(null)} />
            {allTypes.map((t) => (
              <Pill
                key={t}
                label={ENTITY_TYPE_LABELS[t] ?? t}
                active={type === t}
                onClick={() => setType(type === t ? null : t)}
              />
            ))}
          </div>
        </div>

        <div className="facet">
          <div className="facet-label">Topic</div>
          <div className="pills">
            {allTopics.map((t) => (
              <Pill
                key={t}
                label={t}
                active={topics.has(t)}
                onClick={() => toggle(topics, t, setTopics)}
              />
            ))}
          </div>
        </div>

        <div className="facet">
          <div className="facet-label">Sector</div>
          <div className="pills">
            {allSectors.map((s) => (
              <Pill
                key={s}
                label={s}
                active={sectors.has(s)}
                onClick={() => toggle(sectors, s, setSectors)}
              />
            ))}
          </div>
        </div>

        {anyFilter && (
          <div className="clear-row">
            <button type="button" className="clear-btn" onClick={clearAll}>
              Clear all filters
            </button>
          </div>
        )}
      </div>

      <div className="list">
        {filtered.map((e) => (
          <div className="entry" key={e.id}>
            <div className="entry-head">
              <span className="entry-type">
                [{(ENTITY_TYPE_LABELS[e.entity_type] ?? e.entity_type).toUpperCase()}]
              </span>
            </div>
            <p className="entry-name">
              <a href={e.url} target="_blank" rel="noopener noreferrer">
                {e.name}
              </a>
            </p>
            <p className="entry-desc">{e.description}</p>
            <div className="tag-row">
              {e.topics.map((t) => (
                <span className="tag" key={t}>
                  {t}
                </span>
              ))}
              {e.sectors.map((s) => (
                <span className="tag sector" key={s}>
                  {s}
                </span>
              ))}
            </div>
            {(e.attributes.access_method || e.attributes.license) && (
              <div className="meta-line">
                {[e.attributes.access_method, e.attributes.license]
                  .filter(Boolean)
                  .join(" · ")}
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty">No entries match those filters.</div>
      )}
    </>
  );
}
