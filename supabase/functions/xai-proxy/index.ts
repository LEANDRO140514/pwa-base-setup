// ─── xAI (Grok) Voice Agent — Supabase Edge Function Proxy ─────────────────
//
// Accepts both text (message) and audio (base64 PCM) input from the browser
// and forwards it to the xAI Realtime API via WebSocket with proper auth.
//
// Deploy via Supabase dashboard:
//   1. Create a new Edge Function named "xai-proxy"
//   2. Paste this code
//   3. Add secret: XAI_API_KEY = your xAI API key
//   4. Deploy

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import WebSocket from 'npm:ws@8'

const XAI_API_KEY = Deno.env.get('XAI_API_KEY')
const AGENT_ID = 'agent_NTEp6jVGAxR36e4X'
const WS_URL = `wss://api.x.ai/v1/realtime?agent_id=${AGENT_ID}`

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (!XAI_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'XAI_API_KEY not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  let body: { message?: string; audio?: string }
  try { body = await req.json() } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  // Determine content type: audio or text
  const useAudio = !!body.audio && typeof body.audio === 'string'
  if (!useAudio && (!body.message || typeof body.message !== 'string')) {
    return new Response(JSON.stringify({ error: 'Provide either "message" (text) or "audio" (base64 PCM)' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  try {
    const ws = new WebSocket(WS_URL, {
      headers: { Authorization: `Bearer ${XAI_API_KEY}` },
    })

    const result = await new Promise<{ transcript: string; audioBase64: string[] }>((resolve, reject) => {
      let transcript = ''
      const audioChunks: string[] = []
      let timeout: number | null = null

      const resetTimeout = () => {
        if (timeout) clearTimeout(timeout)
        timeout = setTimeout(() => {
          ws.close()
          resolve({ transcript, audioBase64: audioChunks })
        }, 60000)
      }

      ws.on('open', () => {
        // Send user message — audio or text
        const content = useAudio
          ? [{ type: 'input_audio', data: body.audio, format: 'pcm16' }]
          : [{ type: 'input_text', text: body.message! }]

        ws.send(JSON.stringify({
          type: 'conversation.item.create',
          item: { type: 'message', role: 'user', content },
        }))
        ws.send(JSON.stringify({ type: 'response.create' }))
        resetTimeout()
      })

      ws.on('message', (raw: Buffer) => {
        resetTimeout()
        try {
          const data = JSON.parse(raw.toString())
          switch (data.type) {
            case 'response.output_audio_transcript.delta':
              transcript += data.delta || ''
              break
            case 'response.output_audio.delta':
              if (data.delta) audioChunks.push(data.delta)
              break
            case 'response.done':
              ws.close()
              resolve({ transcript, audioBase64: audioChunks })
              break
            case 'error':
              ws.close()
              reject(new Error(data.message || 'xAI API error'))
              break
          }
        } catch { /* ignore */ }
      })

      ws.on('error', (err: Error) => reject(new Error(err.message || 'WebSocket connection failed')))
      ws.on('close', () => {
        if (timeout) clearTimeout(timeout)
        resolve({ transcript, audioBase64: audioChunks })
      })
    })

    return new Response(
      JSON.stringify({ transcript: result.transcript, audioBase64: result.audioBase64 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})