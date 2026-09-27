import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase env vars are not set. Add NEXT_PUBLIC_SUPABASE_URL and " +
      "NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local (see .env.local.example)."
  );
}

// Public, anon-key client only. RLS restricts it to published rows —
// see supabase/migrations/0001_init.sql. Never use a service-role key here.
export const supabase = createClient(
  supabaseUrl ?? "",
  supabaseAnonKey ?? ""
);
