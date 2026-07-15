import { createClient } from "@supabase/supabase-js";

export function createAuthClient() {
  return createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_PUBLISHABLE_KEY as string,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
