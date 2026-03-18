import { createClient } from '@supabase/supabase-js'

// This file creates ONE Supabase client we can reuse everywhere.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

function requireEnv(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(
      `${name} is missing. Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (see .env.example).`,
    )
  }
}

requireEnv('VITE_SUPABASE_URL', supabaseUrl)
requireEnv('VITE_SUPABASE_ANON_KEY', supabaseAnonKey)

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!)

