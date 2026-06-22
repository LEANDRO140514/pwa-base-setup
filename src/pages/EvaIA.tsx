import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '@/components/layout/TopBar'
import { useAdmin } from '@/context/AdminContext'
import { resolveEvaMessage, EMPTY_STATE, type ConversationState } from '@/lib/eva'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const WELCOME_MESSAGES: Message[] = [
  {
    id: 'welcome',
    role: 'assistant',
    content:
      '¡Hola! Soy **Eva**, tu asesora académica de Universidad Latino. 🎓\n\nPuedo ayudarte con:\n• Información sobre carreras y programas\n• Proceso de admisión\n• Becas disponibles\n• Requisitos de ingreso\n\n¿En qué puedo ayudarte hoy?',
    timestamp: new Date(),
  },
]

function getInitialMessages(): Message[] {
  try {
    const ctx = localStorage.getItem('evaCareerContext')
    if (ctx) {
      localStorage.removeItem('evaCareerContext') // consume once
      const { name } = JSON.parse(ctx) as { name: string; area: string }
      return [{
        id: 'welcome',
        role: 'assistant',
        content: `Veo que te interesa **${name}**.\n\nPuedo contarte todo sobre esta carrera:\n• Precios y becas disponibles\n• Modalidad y horarios\n• Campo laboral\n• Proceso de admisión\n\n¿Qué quieres saber?`,
        timestamp: new Date(),
      }]
    }
  } catch {/* ignore */}
  return WELCOME_MESSAGES
}

export default function EvaIA() {
  const { values } = useAdmin()
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Message[]>(getInitialMessages)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isFading, setIsFading] = useState(false)
  const [evaState, setEvaState] = useState<ConversationState>(EMPTY_STATE)
  const bottomRef = useRef<HTMLDivElement>(null)

  const resetConversation = () => {
    setIsFading(true)
    setTimeout(() => {
      setMessages([{
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Comenzamos de nuevo. ¿En qué puedo ayudarte?',
        timestamp: new Date(),
      }])
      setInput('')
      setIsLoading(false)
      setIsFading(false)
      setEvaState(EMPTY_STATE)
    }, 400)
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const result = await resolveEvaMessage(userMsg.content, evaState)
      setEvaState(result.state)

      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.response,
        timestamp: new Date(),
      }])
    } catch (err) {
      console.error('Eva error:', err)
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Tuve un problema procesando tu mensaje. ¿Puedes intentarlo de nuevo?',
        timestamp: new Date(),
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="md:flex md:items-center md:justify-center md:bg-[#e8edf5] md:pt-16 md:h-screen">
    <div className="flex flex-col h-dvh md:h-[min(680px,calc(100vh-6rem))] md:w-[390px] md:rounded-[2.5rem] md:overflow-hidden md:shadow-[0_32px_80px_rgba(0,0,0,0.22),0_0_0_1px_rgba(0,0,0,0.07)]" style={{ background: 'linear-gradient(180deg, #f1f5f9 0%, #ffffff 100%)' }}>
      {/* TopBar */}
      <TopBar
        showBack
        onBack={() => navigate(-1)}
        action={
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-gray-500 font-medium">Eva activa</span>
          </div>
        }
      />

      {/* Eva identity header */}
      <div className="bg-gradient-to-r from-[#1B3070] to-[#1a4a8a] px-5 py-5 flex items-center gap-4 shadow-md">
        <button
          onClick={() => navigate(-1)}
          className="hidden md:flex w-8 h-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all flex-shrink-0"
          title="Volver"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white">
            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
          </svg>
        </button>
        <div className="w-14 h-14 rounded-2xl bg-[#E6B400]/20 border-2 border-[#E6B400]/50 flex items-center justify-center flex-shrink-0" style={{ boxShadow: '0 0 14px rgba(234,179,8,0.45)', animation: 'evaAvatarPulse 3.5s ease-in-out infinite' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#E6B400" className="w-7 h-7">
            <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-white font-black text-base">Eva IA</p>
          <p className="text-white/60 text-xs mt-0.5">Asesora Académica · {values.appName}</p>
        </div>
        <button
          onClick={resetConversation}
          disabled={isLoading}
          title="Empezar de nuevo"
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/8 hover:bg-white/15 active:scale-95 transition-all disabled:opacity-30"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-white/60">
            <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clipRule="evenodd" />
          </svg>
          <span className="text-white/60 text-[11px] font-medium">Empezar de nuevo</span>
        </button>
      </div>

      {/* Messages area */}
      <div
        className="flex-1 overflow-y-auto px-4 py-5 space-y-4 pb-4"
        style={{ transition: 'opacity 0.28s ease', opacity: isFading ? 0 : 1 }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            style={{ animation: 'msgFadeIn 0.35s ease both' }}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-[#1B3070] flex items-center justify-center mr-2.5 flex-shrink-0 mt-1 shadow-sm">
                <span className="text-[#E6B400] text-[10px] font-black">E</span>
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3.5 text-sm shadow-sm ${
                msg.role === 'user'
                  ? 'bg-[#1B3070] text-white rounded-tr-sm leading-relaxed'
                  : 'bg-white text-gray-900 rounded-tl-sm border border-gray-100 leading-[1.7]'
              }`}
            >
              {msg.content.split('\n').map((line, i) => {
                // Render bold **text** markers
                const parts = line.split(/(\*\*[^*]+\*\*)/g)
                return (
                  <p key={i} className={i > 0 ? 'mt-2' : ''}>
                    {parts.map((part, j) =>
                      /^\*\*/.test(part)
                        ? <strong key={j}>{part.slice(2, -2)}</strong>
                        : part
                    )}
                  </p>
                )
              })}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start" style={{ animation: 'msgFadeIn 0.3s ease both' }}>
            <div className="w-8 h-8 rounded-full bg-[#1B3070] flex items-center justify-center mr-2.5 flex-shrink-0 shadow-sm">
              <span className="text-[#E6B400] text-[10px] font-black">E</span>
            </div>
            <div className="bg-[#f8fafc] border border-gray-100 rounded-2xl rounded-tl-sm px-5 py-3.5 shadow-sm">
              <div className="flex gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div
        className="bg-white border-t border-gray-100 px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Escribe tu pregunta..."
            className="flex-1 bg-transparent text-sm focus:outline-none text-gray-900 placeholder:text-gray-400 min-h-[1.5rem]"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="w-9 h-9 rounded-full bg-[#1B3070] disabled:bg-gray-200 flex items-center justify-center transition-all active:scale-95 hover:bg-[#1a4a8a] shadow-[0_4px_12px_rgba(27,48,112,0.4)] disabled:shadow-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white">
              <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
            </svg>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes msgFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes evaAvatarPulse {
          0%, 100% { box-shadow: 0 0 10px rgba(234,179,8,0.3); }
          50%       { box-shadow: 0 0 22px rgba(234,179,8,0.65); }
        }
      `}</style>
    </div>
    </div>
  )
}
