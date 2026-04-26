// Barrel client-safe: importa solo il browser client.
// Per Server Components/Actions usa direttamente:
//   import { createClient } from '@/lib/supabase/server'
//   import { createAdminClient } from '@/lib/supabase/admin'
// Importarli da qui causerebbe bundling di `next/headers` lato client.
export { createClient as createBrowserSupabaseClient } from './client'
