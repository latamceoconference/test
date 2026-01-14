import { createClient } from "@supabase/supabase-js";

let _client: ReturnType<typeof createClient> | null | undefined;

export function createBrowserSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  if (_client) return _client;
  _client = createClient(url, anonKey);
  return _client;
}




