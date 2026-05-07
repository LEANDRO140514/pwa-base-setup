import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Missing environment variables. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
  )
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

// ─── Types matching the leads table (columns in Spanish as stored in Supabase)
export interface Lead {
  id: string
  created_at: string
  nombre: string
  email: string
  telefono?: string
  career?: string
  source?: string
  tags?: string[]
}

// ─── Helpers ───────────────────────────────────────────────────────────────

export async function getLeads() {
  const { data, error } = await supabase
    .from('leads')
    .select('id,created_at,nombre,email,telefono,tags')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Lead[]
}

export async function insertLead(lead: Omit<Lead, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('leads')
    .insert([lead])
    .select('id,created_at,nombre,email,telefono')
    .single()

  if (error) throw error
  return data as Lead
}
