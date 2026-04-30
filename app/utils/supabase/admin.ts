import { createClient } from "@supabase/supabase-js"

/**
 * Admin client using service_role key — bypasses ALL RLS policies.
 * Only use server-side (API routes / server actions). Never expose to the browser.
 */
export const createAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
