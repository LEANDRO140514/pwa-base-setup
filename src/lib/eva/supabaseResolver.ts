// ─── Eva Engine — Supabase data resolver with caching ────────────────────────

import { supabase } from '@/lib/supabase'
import type { Career, FAQ } from './types'

// ── Default careers fallback (when Supabase careers table is empty/fails) ────

const DEFAULT_CAREERS: Career[] = [
  { id: '1',  name: 'Nutrición',                              area: 'Salud',       modality: 'Presencial', monthly_price: 4650, enrollment_price: 8000, duration: '4 años + S.S.' },
  { id: '2',  name: 'Enfermería',                             area: 'Salud',       modality: 'Presencial', monthly_price: 4650, enrollment_price: 8000, duration: '4 años + S.S.' },
  { id: '3',  name: 'Psicología',                             area: 'Salud',       modality: 'Presencial', monthly_price: 4650, enrollment_price: 8000, duration: '4 años + S.S.' },
  { id: '4',  name: 'Derecho',                                 area: 'Derecho',     modality: 'Presencial', monthly_price: 4650, enrollment_price: 8000, duration: '4 años' },
  { id: '5',  name: 'Derecho Online',                          area: 'Derecho',     modality: 'en-linea',  monthly_price: 1980, enrollment_price: 3600, duration: '3 años' },
  { id: '6',  name: 'Negocios Internacionales',                area: 'Negocios',    modality: 'Presencial', monthly_price: 4650, enrollment_price: 8000, duration: '3 años 4 meses' },
  { id: '7',  name: 'Ventas y Mercadotecnia',                  area: 'Negocios',    modality: 'Presencial', monthly_price: 4650, enrollment_price: 8000, duration: '3 años 4 meses' },
  { id: '8',  name: 'Ventas y Mercadotecnia Online',           area: 'Negocios',    modality: 'en-linea',  monthly_price: 1980, enrollment_price: 3600, duration: '3 años' },
  { id: '9',  name: 'Gastronomía',                             area: 'Gastronomía', modality: 'Presencial', monthly_price: 4650, enrollment_price: 8000, duration: '4 años' },
  { id: '10', name: 'Ingeniería en Sistemas Computacionales',  area: 'Tecnología',  modality: 'Presencial', monthly_price: 4650, enrollment_price: 8000, duration: '3 años 8 meses' },
  { id: '11', name: 'Administración Sabatina',                 area: 'Negocios',    modality: 'Sabatina',  monthly_price: 3960, enrollment_price: 3600, duration: '3 años' },
  { id: '12', name: 'Administración y Desarrollo Empresarial Online', area: 'Negocios', modality: 'en-linea', monthly_price: 1980, enrollment_price: 3600, duration: '3 años' },
]

function makeCache<T>() {
  let data: T[] | null = null
  let promise: Promise<T[]> | null = null
  return {
    get:        () => data,
    set:        (v: T[]) => { data = v },
    getPromise: () => promise,
    setPromise: (p: Promise<T[]> | null) => { promise = p },
    clear:      () => { data = null; promise = null },
  }
}

const careerCache = makeCache<Career>()
const faqCache    = makeCache<FAQ>()

async function fetchTable<T>(
  table: string,
  cache: ReturnType<typeof makeCache<T>>,
  timeoutMs = 2000,
): Promise<T[]> {
  const cached = cache.get()
  if (cached && cached.length > 0) return cached

  const existing = cache.getPromise()
  if (existing) return existing

  const p = (async () => {
    try {
      const timeout = new Promise<T[]>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), timeoutMs),
      )
      const query = Promise.resolve(
        supabase.from(table).select('*').then(({ data, error }) => {
          if (error) throw error
          return (data as T[]) ?? []
        }),
      )
      const result = await Promise.race([query, timeout])
      cache.set(result)
      return result
    } catch {
      return []
    } finally {
      cache.setPromise(null)
    }
  })()

  cache.setPromise(p)
  return p
}

export async function fetchCareers(): Promise<Career[]> {
  // Always use hardcoded DEFAULT_CAREERS instead of fetching from Supabase.
  // Rationale: the modality column format in Supabase may not match what
  // Eva's filter expects (e.g. 'online' vs 'en-linea'). The Carreras page
  // consumes AdminContext data independently so there is no duplication.
  careerCache.set(DEFAULT_CAREERS)
  return DEFAULT_CAREERS
}

export async function fetchFAQs(): Promise<FAQ[]> {
  return fetchTable<FAQ>('faqs', faqCache)
}

export async function fetchAllData(): Promise<{ careers: Career[]; faqs: FAQ[] }> {
  const [careers, faqs] = await Promise.all([fetchCareers(), fetchFAQs()])
  return { careers, faqs }
}
