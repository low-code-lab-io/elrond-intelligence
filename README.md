# Elrond Intelligence

A free, public directory of climate, impact and sustainability data sources,
organizations, tools, initiatives and solutions — built for companies and
entrepreneurs to get inspired, learn about options, and access data.

Separate project/repo from Elrond (the property-risk-report app), sharing
the same infra pattern: Next.js on Vercel, Postgres on Supabase.

## Data model

One shared `entities` table for every kind of catalog entry (`entity_type`:
`data_source` / `organization` / `tool` / `initiative` / `solution`), with
shared `topics` and `sectors` taxonomies that apply across all types. See
`supabase/migrations/` for the schema, and the project doc
"scoping-and-mvp-plan.md" for the reasoning.

## Local setup

1. Create a Supabase project (separate from Elrond's).
2. Run the migrations in `supabase/migrations/` against it, in order
   (via the Supabase CLI, or paste each file into the SQL editor).
3. Copy `.env.local.example` to `.env.local` and fill in your project's
   URL and anon key.
4. `npm install`
5. `npm run dev`

## Adding a new entry (manual review workflow)

Add rows directly in the Supabase dashboard's table editor: insert into
`entities` with `status = 'draft'` while you're still filling it in, link
it to the relevant rows in `topics` / `sectors` via `entity_topics` /
`entity_sectors`, then flip `status` to `'published'` once verified. The
site re-reads published entities every few minutes (ISR), no redeploy
needed.

## Deploy

Push to GitHub, import into a new Vercel project, and set
`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` as environment
variables there too.
