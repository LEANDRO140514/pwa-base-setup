// ─── xAI (Grok) Voice Agent — Client via Supabase Edge Function Proxy ──────

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string
const PROXY_URL = `${SUPABASE_URL}/functions/v1/xai-proxy`

export type MessageRole = 'user' | 'assistant'
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export interface ChatMessage {
  role: MessageRole
  text: string
}

export interface XAIClientCallbacks {
  onStatusChange: (status: ConnectionStatus) => void
  onMessage: (msg: ChatMessage) => void
  onAudioData: (base64Pcm: string) => void
  onError: (error: string) => void
}

export function createXAIClient(callbacks: XAIClientCallbacks) {
  let isConnected = false

  function connect() {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      callbacks.onError('Supabase no configurado correctamente')
      callbacks.onStatusChange('error')
      return
    }

    callbacks.onStatusChange('connected')
    isConnected = true
  }

  async function sendText(text: string) {
    if (!isConnected) {
      callbacks.onError('No hay conexión activa')
      return
    }

    callbacks.onMessage({ role: 'user', text })

    try {
      const response = await fetch(PROXY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ message: text }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Error desconocido' }))
        callbacks.onError(err.error || `Error HTTP ${response.status}`)
        return
      }

      const data = await response.json()

      // Play audio chunks sequentially
      if (data.audioBase64 && Array.isArray(data.audioBase64)) {
        for (const chunk of data.audioBase64) {
          callbacks.onAudioData(chunk)
        }
      }

      // Show transcript
      if (data.transcript) {
        callbacks.onMessage({ role: 'assistant', text: data.transcript })
      }
    } catch (error) {
      callbacks.onError(
        error instanceof Error ? error.message : 'Error de conexión con el agente de voz'
      )
    }
  }

  function disconnect() {
    isConnected = false
    callbacks.onStatusChange('disconnected')
  }

  return { connect, sendText, disconnect }
}

// ── Audio playback helper ──────────────────────────────────────────────────

let audioCtx: AudioContext | null = null
let scheduledTime = 0

export function playPcmAudio(base64Pcm: string) {
  if (!audioCtx) {
    audioCtx = new AudioContext()
    scheduledTime = audioCtx.currentTime
  }

  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }

  // Decode base64 → PCM bytes
  const binaryStr = atob(base64Pcm)
  const bytes = new Uint8Array(binaryStr.length)
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i)
  }

  // Convert 16-bit PCM → Float32
  const float32 = new Float32Array(bytes.length / 2)
  for (let i = 0; i < float32.length; i++) {
    const low = bytes[i * 2]
    const high = bytes[i * 2 + 1]
    const sample = (high << 8) | low
    float32[i] = (sample >> 0) / 32768.0
  }

  const buffer = audioCtx.createBuffer(1, float32.length, 24000)
  buffer.getChannelData(0).set(float32)

  const source = audioCtx.createBufferSource()
  source.buffer = buffer
  source.connect(audioCtx.destination)

  // Schedule playback to avoid gaps between chunks
  const now = audioCtx.currentTime
  if (scheduledTime < now) {
    scheduledTime = now
  }
  source.start(scheduledTime)
  scheduledTime += buffer.duration
}

export function stopAudio() {
  if (audioCtx) {
    audioCtx.close()
    audioCtx = null
    scheduledTime = 0
  }
}