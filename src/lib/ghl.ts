// ─── GoHighLevel (GHL) Webhook Integration ─────────────────────────────────
// Sends prospect data to a GHL workflow via webhook

const GHL_WEBHOOK_URL = import.meta.env.VITE_GHL_WEBHOOK_URL as string

export interface ProspectPayload {
  firstName: string
  lastName?: string
  email: string
  phone?: string
  career?: string
  source: string
  tags?: string[]
  customFields?: Record<string, string>
}

/**
 * Sends a prospect/lead to GHL via webhook
 */
export async function sendToGHL(payload: ProspectPayload): Promise<boolean> {
  if (!GHL_WEBHOOK_URL) {
    console.warn('[GHL] VITE_GHL_WEBHOOK_URL not set – skipping webhook.')
    return false
  }

  try {
    const response = await fetch(GHL_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        source: payload.source || 'universidad-latino-pwa',
        timestamp: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      console.error('[GHL] Webhook failed:', response.status, response.statusText)
      return false
    }

    return true
  } catch (err) {
    console.error('[GHL] Webhook error:', err)
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
