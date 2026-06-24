// ─── UTM / fbclid / Attribution Capture ─────────────────────────────────────
// Reads URL params on first load, persists to sessionStorage + localStorage,
// and provides a getter for attaching to lead submissions.

const STORAGE_KEY = 'ul_utm_data'

export interface AttributionData {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  fbclid?: string
  gclid?: string
  landing_source?: string    // referrer on first landing
  first_page_seen?: string   // first page path
  last_page_seen?: string    // most recent page path — updated on each navigation
}

/** Read stored attribution data */
export function getAttributionData(): AttributionData {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AttributionData) : {}
  } catch {
    return {}
  }
}

/** Capture URL params on first visit — call once at app boot */
export function captureAttribution(): AttributionData {
  // Already captured this session?
  const existing = getAttributionData()
  if (existing.landing_source) return existing

  const params = new URLSearchParams(window.location.search)
  const data: AttributionData = {
    utm_source: params.get('utm_source') ?? undefined,
    utm_medium: params.get('utm_medium') ?? undefined,
    utm_campaign: params.get('utm_campaign') ?? undefined,
    utm_content: params.get('utm_content') ?? undefined,
    utm_term: params.get('utm_term') ?? undefined,
    fbclid: params.get('fbclid') ?? undefined,
    gclid: params.get('gclid') ?? undefined,
    landing_source: document.referrer || 'direct',
    first_page_seen: window.location.pathname,
    last_page_seen: window.location.pathname,
  }

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))

  // Also persist in localStorage for cross-session attribution
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // ignore quota errors
  }

  return data
}

/** Update last_page_seen on route change */
export function updateLastPageSeen(path: string): void {
  const data = getAttributionData()
  if (!data.last_page_seen) return // not captured yet
  data.last_page_seen = path
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // ignore
  }
}