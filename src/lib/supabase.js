import { createClient } from '@supabase/supabase-js'
import { env } from './env'
const url = env('VITE_SUPABASE_URL')
const key = env('VITE_SUPABASE_ANON_KEY')
export const supabaseReady = Boolean(url && key)
export const supabase = supabaseReady ? createClient(url, key) : null
