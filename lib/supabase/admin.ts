import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Client con service_role — NON usare mai client-side
// Bypass RLS — usare solo in Server Actions/API routes dove necessario
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
