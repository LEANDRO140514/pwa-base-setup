// ─── GoHighLevel (GHL) Webhook Integration ─────────────────────────────────
// Sends prospect data to a GHL workflow via Supabase Edge Function (proxy).
// The edge function forwards to GHL server-to-server to avoid CORS.

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export interface ProspectPayload {
  // ── Core lead data ──────────────────────────────────────────────────────
  firstName: string
  lastName?: string
  email: string
  phone?: string
  career?: string
  source: string
  tags?: string[]
  customFields?: Record<string, string>

  // ── Flat fields for GHL segmentation (snake_case for easy GHL mapping) ─
  origen?: string              // "carreras-landing"
  lead_type?: string           // "beca_carreras"
  funnel?: string              // "admisiones_2026"
  interest?: string            // "beca"
  career_name?: string         // full career name
  career_id?: string           // career ID from DB
  modality?: string | null    // "En línea" / "Presencial" / null
  average_range?: string       // "9.60-10.00"
  scholarship_level?: string   // "Sobresaliente"
  scholarship_percent?: number // 50 | 40 | 30 | 0
  enrollment_discount_percent?: number // 50
  tuition_base?: number        // monthly tuition before discount
  enrollment_base?: number     // enrollment fee before discount
  tuition_final?: number       // monthly tuition after discount
  enrollment_final?: number    // enrollment fee after discount
  wa_stage?: string            // WhatsApp automation stage
  tags_string?: string         // tags as comma-separated string

  // ── UTM / attribution data ──────────────────────────────────────────────
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  utmTerm?: string
  fbclid?: string
  gclid?: string
  landingSource?: string
  firstPageSeen?: string
  lastPageSeen?: string
}

/**
 * Sends a prospect/lead to GHL via Supabase Edge Function proxy.
 * The edge function forwards to GHL server-to-server, avoiding CORS.
 */
export async function sendToGHL(payload: ProspectPayload): Promise<boolean> {
  const fnUrl = `${SUPABASE_URL}/functions/v1/ghl-proxy`

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('[GHL] Supabase credentials missing – skipping GHL proxy.')
    return false
  }

  try {
    const response = await fetch(fnUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        ...payload,
        source: payload.source || 'universidad-latino-pwa',
        timestamp: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      const body = await response.text().catch(() => '')
      console.error('[GHL] Proxy failed:', response.status, body)
      return false
    }

    return true
  } catch (err) {
    console.error('[GHL] Proxy error:', err)
    return false
  }
}

/**
 * Capture a prospect: saves to Supabase + sends to GHL in parallel
 */
export async function captureProspect(payload: ProspectPayload) {
  const { insertLead } = await import('./supabase')

  const [ghlResult, lead] = await Promise.allSettled([
    sendToGHL(payload),
    insertLead({
      nombre: `${payload.firstName}${payload.lastName ? ' ' + payload.lastName : ''}`,
      email: payload.email,
      telefono: payload.phone,
      career: payload.career,
      source: payload.source,
      tags: payload.tags,
    }),
  ])

  return {
    ghl: ghlResult.status === 'fulfilled' ? ghlResult.value : false,
    lead: lead.status === 'fulfilled' ? lead.value : null,
    error: lead.status === 'rejected' ? lead.reason : null,
  }
}
