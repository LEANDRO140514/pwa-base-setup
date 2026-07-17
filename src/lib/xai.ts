// ─── xAI (Grok) Realtime Voice Agent — WebSocket client ─────────────────────

const XAI_API_KEY = import.meta.env.VITE_XAI_API_KEY as string | undefined
const AGENT_ID = 'agent_NTEp6jVGAxR36e4X'

export type MessageRole = 'user' | 'assistant'
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export interface ChatMessage {
  role: MessageRole
  text: string
}

export interface XAIClientCallbacks {
  onStatusChange: (status: ConnectionStatus) => void
  onMessage: (msg: ChatMessage) => void
  onAudioDelta: (base64Pcm: string) => void
  onTranscriptDelta: (text: string) => void
  onError: (error: string) => void
}

export function createXAIClient(callbacks: XAIClientCallbacks) {
  let ws: WebSocket | null = null
  let currentAssistantMessage = ''

  function connect() {
    if (!XAI_API_KEY) {
      callbacks.onError('XAI_API_KEY no configurada. Agrega VITE_XAI_API_KEY en .env')
      callbacks.onStatusChange('error')
      return
    }

    callbacks.onStatusChange('connecting')

    try {
      // Browser WebSocket doesn't support custom headers, so we pass
      // the API key as a query parameter for auth
      const url = `wss://api.x.ai/v1/realtime?agent_id=${AGENT_ID}&api_key=${XAI_API_KEY}`
      ws = new WebSocket(url)
    } catch {
      callbacks.onError('Error al crear conexión WebSocket')
      callbacks.onStatusChange('error')
      return
    }

    ws.onopen = () => {
      callbacks.onStatusChange('connected')
    }

    ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data as string)
        handleEvent(data)
      } catch {
        // ignore parse errors
      }
    }

    ws.onerror = () => {
      callbacks.onError('Error de conexión con el agente de voz')
      callbacks.onStatusChange('error')
    }

    ws.onclose = () => {
      callbacks.onStatusChange('disconnected')
    }
  }

  function handleEvent(event: Record<string, unknown>) {
    switch (event.type) {
      case 'response.output_audio_transcript.delta':
        currentAssistantMessage += (event.delta as string) || ''
        callbacks.onTranscriptDelta(event.delta as string)
        break

      case 'response.output_audio.delta':
        callbacks.onAudioDelta(event.delta as string)
        break

      case 'response.output_audio_transcript.done':
        if (currentAssistantMessage.trim()) {
          callbacks.onMessage({ role: 'assistant', text: currentAssistantMessage.trim() })
        }
        currentAssistantMessage = ''
        break

      case 'response.done':
        if (currentAssistantMessage.trim()) {
          callbacks.onMessage({ role: 'assistant', text: currentAssistantMessage.trim() })
        }
        currentAssistantMessage = ''
        break

      case 'error':
        callbacks.onError((event.message as string) || 'Error del agente')
        break
    }
  }

  function sendText(text: string) {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      callbacks.onError('No hay conexión activa')
      return
    }

    // Add user message
    ws.send(JSON.stringify({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{ type: 'input_text', text }],
      },
    }))

    // Trigger response
    ws.send(JSON.stringify({ type: 'response.create' }))

    callbacks.onMessage({ role: 'user', text })
  }

  function disconnect() {
    if (ws) {
      ws.close()
      ws = null
    }
    currentAssistantMessage = ''
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