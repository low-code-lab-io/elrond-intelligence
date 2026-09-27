export type EntityType =
  | "data_source"
  | "organization"
  | "tool"
  | "initiative"
  | "solution";

export const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  data_source: "Data source",
  organization: "Organization",
  tool: "Tool",
  initiative: "Initiative",
  solution: "Solution",
};

export interface Entity {
  id: string;
  entity_type: EntityType;
  name: string;
  url: string;
  description: string;
  last_verified_at: string | null;
  attributes: Record<string, string>;
  topics: string[];
  sectors: string[];
}
