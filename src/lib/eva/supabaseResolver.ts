// ─── Eva Engine — Supabase data resolver with caching ────────────────────────

import { supabase } from '@/lib/supabase'
import type { Career, FAQ } from './types'

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
  return fetchTable<Career>('careers', careerCache)
}

export async function fetchFAQs(): Promise<FAQ[]> {
  return fetchTable<FAQ>('faqs', faqCache)
}

export async function fetchAllData(): Promise<{ careers: Career[]; faqs: FAQ[] }> {
  const [careers, faqs] = await Promise.all([fetchCareers(), fetchFAQs()])
  return { careers, faqs }
}
