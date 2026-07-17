import { useEffect, useRef, useState, useCallback } from 'react'
import { createXAIClient, playPcmAudio, stopAudio, type ChatMessage, type ConnectionStatus } from '@/lib/xai'
import { trackContact } from '@/lib/tracking'

// ── SpeechRecognition type declarations ────────────────────────────────────
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

interface SpeechRecognition extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onend: (() => void) | null
  onerror: ((event: { error: string }) => void) | null
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  length: number
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
  length: number
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface Props {
  onClose: () => void
}

export default function VoiceAgentPanel({ onClose }: Props) {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transcriptBuffer, setTranscriptBuffer] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const clientRef = useRef<ReturnType<typeof createXAIClient>>()
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, transcriptBuffer])

  // Initialize xAI client
  useEffect(() => {
    const client = createXAIClient({
      onStatusChange: setStatus,
      onMessage: (msg) => {
        setMessages((prev) => [...prev, msg])
        setTranscriptBuffer('')
      },
      onAudioDelta: (base64Pcm) => {
        playPcmAudio(base64Pcm)
      },
      onTranscriptDelta: (text) => {
        setTranscriptBuffer((prev) => prev + text)
      },
      onError: (err) => setError(err),
    })

    clientRef.current = client

    // Track the interaction
    trackContact({ origen: 'voice-agent-panel', canal: 'xai-grok' })

    return () => {
      client.disconnect()
      stopAudio()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-connect when panel opens
  useEffect(() => {
    if (status === 'disconnected' && clientRef.current) {
      clientRef.current.connect()
    }
  }, [status])

  // Speech recognition setup
  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError('Tu navegador no soporta reconocimiento de voz')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'es-MX'
    recognition.continuous = false
    recognition.interimResults = true

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const results = event.results
      const transcript = []
      for (let i = 0; i < results.length; i++) {
        transcript.push(results[i][0].transcript)
      }
      setInput(transcript.join(''))
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.onerror = () => {
      setIsListening(false)
      setError('Error al reconocer voz. Intenta de nuevo.')
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }, [])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsListening(false)
  }, [])

  // Send message
  const handleSend = useCallback(() => {
    const text = input.trim()
    if (!text || !clientRef.current) return

    clientRef.current.sendText(text)
    setInput('')
    setError(null)
  }, [input])

  // Handle Enter key
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  // Handle microphone toggle
  const handleMicToggle = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [isListening, startListening, stopListening])

  return (
    <div className="fixed inset-0 z-[9998] flex items-end justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-md bg-white rounded-t-2xl shadow-2xl flex flex-col max-h-[80vh] min-h-[60vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#8B0000] flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v1a7 7 0 0 1-14 0v-1H3v1a9 9 0 0 0 8 8.94V21h-3v2h8v-2h-3v-1.06A9 9 0 0 0 21 11v-1Z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Eva por Voz</h2>
              <p className="text-xs text-gray-500">
                {status === 'connected' && 'Conectado'}
                {status === 'connecting' && 'Conectando...'}
                {status === 'disconnected' && 'Desconectado'}
                {status === 'error' && 'Error de conexión'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
            aria-label="Cerrar"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 text-gray-500">
              <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {messages.length === 0 && !transcriptBuffer && (
            <div className="text-center text-gray-400 text-sm mt-8">
              <p className="font-medium text-gray-500 mb-1">Habla con Eva por voz</p>
              <p>Escribe un mensaje o usa el micrófono para comenzar</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#1B3070] text-white rounded-br-md'
                    : 'bg-gray-100 text-gray-800 rounded-bl-md'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Streaming transcript */}
          {transcriptBuffer && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl rounded-bl-md px-4 py-2.5 text-sm leading-relaxed bg-gray-100 text-gray-500 italic">
                {transcriptBuffer}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex justify-center">
              <div className="bg-red-50 text-red-600 text-xs rounded-lg px-3 py-2">
                {error}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleMicToggle}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              aria-label={isListening ? 'Detener micrófono' : 'Activar micrófono'}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v1a7 7 0 0 1-14 0v-1H3v1a9 9 0 0 0 8 8.94V21h-3v2h8v-2h-3v-1.06A9 9 0 0 0 21 11v-1Z" />
              </svg>
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu mensaje..."
              className="flex-1 bg-gray-50 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#1B3070]/20 focus:bg-white transition-all"
              disabled={status !== 'connected'}
            />

            <button
              onClick={handleSend}
              disabled={!input.trim() || status !== 'connected'}
              className="w-10 h-10 rounded-full bg-[#1B3070] text-white flex items-center justify-center shrink-0 disabled:opacity-40 hover:bg-[#1B3070]/90 transition-all"
              aria-label="Enviar"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}