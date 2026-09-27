-- Elrond Intelligence: core schema
-- One shared "entities" table for everything in the catalog (data sources,
-- organizations, tools, initiatives, solutions), plus shared topic/sector
-- taxonomies that apply across all entity types. See project docs for the
-- reasoning: one database, filtered views per category, not one database
-- per category.

create extension if not exists pg_trgm;

create type entity_type as enum (
  'data_source',
  'organization',
  'tool',
  'initiative',
  'solution'
);

create type entity_status as enum ('draft', 'published');

create table entities (
  id uuid primary key default gen_random_uuid(),
  entity_type entity_type not null,
  name text not null,
  url text not null,
  description text not null,
  status entity_status not null default 'draft',
  last_verified_at date,
  attributes jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index entities_type_idx on entities (entity_type);
create index entities_status_idx on entities (status);
create index entities_search_idx on entities using gin (
  (name || ' ' || description) gin_trgm_ops
);

create table topics (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null
);

create table sectors (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null
);

create table entity_topics (
  entity_id uuid not null references entities (id) on delete cascade,
  topic_id uuid not null references topics (id) on delete cascade,
  primary key (entity_id, topic_id)
);

create table entity_sectors (
  entity_id uuid not null references entities (id) on delete cascade,
  sector_id uuid not null references sectors (id) on delete cascade,
  primary key (entity_id, sector_id)
);

-- keep updated_at current on edit
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger entities_set_updated_at
  before update on entities
  for each row execute function set_updated_at();

-- Row Level Security: the public (anon) role may only read published
-- entities and the taxonomy tables. No public write access anywhere —
-- entries are added through the Supabase dashboard by hand (manual
-- review workflow), never through the app.
alter table entities enable row level security;
alter table topics enable row level security;
alter table sectors enable row level security;
alter table entity_topics enable row level security;
alter table entity_sectors enable row level security;

create policy "public can read published entities"
  on entities for select
  using (status = 'published');

create policy "public can read topics"
  on topics for select
  using (true);

create policy "public can read sectors"
  on sectors for select
  using (true);

create policy "public can read entity_topics for published entities"
  on entity_topics for select
  using (
    exists (
      select 1 from entities
      where entities.id = entity_topics.entity_id
        and entities.status = 'published'
    )
  );

create policy "public can read entity_sectors for published entities"
  on entity_sectors for select
  using (
    exists (
      select 1 from entities
      where entities.id = entity_sectors.entity_id
        and entities.status = 'published'
    )
  );
