// ─── GHL Proxy — Supabase Edge Function ──────────────────────────────────────
// Receives prospect data from the client and forwards it to GHL webhook.
// This avoids CORS issues since the client cannot call GHL directly.
//
// Requires secret: GHL_WEBHOOK_URL
// Set at: Supabase Dashboard → Edge Functions → Secrets
//
// Deploy via CLI: supabase functions deploy ghl-proxy --no-verify-jwt
// (--no-verify-jwt so the client can call it without auth)

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const GHL_WEBHOOK_URL = Deno.env.get('GHL_WEBHOOK_URL') ?? ''

serve(async (req) => {
  // ── CORS headers (allow all origins for client calls) ────────────────
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if (!GHL_WEBHOOK_URL) {
    return new Response(JSON.stringify({ error: 'GHL_WEBHOOK_URL secret not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const payload = await req.json()

    const response = await fetch(GHL_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        source: payload.source || 'universidad-latino-pwa',
        timestamp: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      const body = await response.text().catch(() => '')
      console.error('[ghl-proxy] GHL returned', response.status, body)
      return new Response(
        JSON.stringify({ error: `GHL webhook failed: ${response.status}`, detail: body }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[ghl-proxy] Error:', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})