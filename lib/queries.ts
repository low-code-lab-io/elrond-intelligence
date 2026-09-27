import { supabase } from "./supabase";
import type { Entity } from "./types";

// Raw shape returned by the nested Supabase select below.
interface RawEntity {
  id: string;
  entity_type: Entity["entity_type"];
  name: string;
  url: string;
  description: string;
  last_verified_at: string | null;
  attributes: Record<string, string> | null;
  entity_topics: { topics: { label: string } | null }[] | null;
  entity_sectors: { sectors: { label: string } | null }[] | null;
}

export async function getPublishedEntities(): Promise<Entity[]> {
  const { data, error } = await supabase
    .from("entities")
    .select(
      `id, entity_type, name, url, description, last_verified_at, attributes,
       entity_topics ( topics ( label ) ),
       entity_sectors ( sectors ( label ) )`
    )
    .eq("status", "published")
    .order("name", { ascending: true });

  if (error) {
    console.error("Failed to load entities:", error.message);
    return [];
  }

  return ((data ?? []) as unknown as RawEntity[]).map((row) => ({
    id: row.id,
    entity_type: row.entity_type,
    name: row.name,
    url: row.url,
    description: row.description,
    last_verified_at: row.last_verified_at,
    attributes: row.attributes ?? {},
    topics: (row.entity_topics ?? [])
      .map((t) => t.topics?.label)
      .filter((label): label is string => Boolean(label)),
    sectors: (row.entity_sectors ?? [])
      .map((s) => s.sectors?.label)
      .filter((label): label is string => Boolean(label)),
  }));
}
