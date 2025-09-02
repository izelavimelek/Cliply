import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined;

export function getSupabaseServiceClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase service env vars are missing");
  }
  return createClient(supabaseUrl, serviceRoleKey);
}
