import { useState, useRef, useEffect } from 'react'
import { useAdmin } from '@/context/AdminContext'

interface Career {
  id: string
  name: string
  area: string
  modality: string
  monthlyFee?: string
  enrollment?: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const QUICK_ACTIONS = [
  { id: 'campo',      label: 'Campo laboral',        emoji: '💼' },
  { id: 'becas',      label: 'Becas disponibles',    emoji: '🎓' },
  { id: 'plan',       label: 'Plan de estudios',     emoji: '📚' },
  { id: 'requisitos', label: 'Requisitos de ingreso',emoji: '📋' },
  { id: 'asesor',     label: 'Hablar con asesor',    emoji: '💬' },
]

const JOB_FIELDS: Record<string, string[]> = {
  Derecho:     ['Despachos jurídicos y notarías', 'Poder Judicial y Ministerio Público', 'Asesoría jurídica empresarial', 'Defensoría pública y derechos humanos', 'Docencia e investigación jurídica'],
  Salud:       ['Hospitales y clínicas públicas y privadas', 'Consultorios y práctica independiente', 'Programas de salud pública', 'Investigación biomédica y docencia', 'Organismos internacionales de salud'],
  Negocios:    ['Empresas nacionales e internacionales', 'Consultoras y despachos de negocios', 'Emprendimiento y startups', 'Sector bancario y financiero', 'Comercio exterior y logística'],
  Gastronomía: ['Restaurantes y hoteles de alta categoría', 'Industria alimentaria y manufactura', 'Catering, eventos y banquetes', 'Consultoría gastronómica', 'Emprendimiento y restaurantes propios'],
  Tecnología:  ['Empresas de software y telecomunicaciones', 'Sector bancario y fintech', 'Gobierno y sector público digital', 'Consultoras de tecnología e innovación', 'Emprendimiento tecnológico'],
}

const DURATIONS: Record<string, string> = {
  Derecho:     '4 años (presencial) · 3 años (en línea)',
  Salud:       '4 años + servicio social',
  Negocios:    '3 años 4 meses – 4 años',
  Gastronomía: '4 años',
  Tecnología:  '3 años 8 meses',
}

function getQuickResponse(action: string, career: Career, waNumber: string): string {
  const fields = JOB_FIELDS[career.area] ?? ['Sectores público y privado', 'Docencia e investigación', 'Emprendimiento']
  const dur = DURATIONS[career.area] ?? '4 años'
  const price = career.monthlyFee ?? '$4,650/mes'
  const enroll = career.enrollment ?? '$7,000'

  switch (action) {
    case 'campo':
      return `**Campo laboral — ${career.name}**\n\n${fields.map((f) => `• ${f}`).join('\n')}\n\n¿Quieres saber sobre becas o requisitos?`

    case 'becas':
      return `**Becas para ${career.name}**\n\nColegiatura: ${price}\nInscripción: ${enroll}\n\n🏆 Sobresaliente (9.5+): 50% colegiatura + 50% inscripción\n⭐ Muy alto (9.0–9.49): 40% colegiatura + 50% inscripción\n✅ Alto (8.5–8.99): 30% colegiatura + 50% inscripción\n📌 Base (7.0–8.49): 50% descuento en inscripción\n\nLa mayoría de alumnos recibe apoyo. ¿Quieres calcular la tuya?`

    case 'plan':
      return `**Plan de estudios — ${career.name}**\n\n• Duración: ${dur}\n• RVOE con validez SEP oficial\n• Prácticas desde el 1er semestre\n• Servicio social integrado\n• Titulación incluida\n\nPuedes ver la malla curricular completa más abajo en esta página 👇`

    case 'requisitos':
      return `**Requisitos de ingreso — ${career.name}**\n\n• Certificado de bachillerato\n• Identificación oficial (INE/pasaporte)\n• CURP\n• Acta de nacimiento\n• 2 fotografías tamaño título${career.area === 'Salud' ? '\n• Carta de no antecedentes penales' : ''}\n\n✅ Sin examen de admisión — proceso en 5 pasos.\n¿Quieres agendar tu entrevista?`

    case 'asesor':
      return `¡Con gusto te conecto! 🎓\n\nEscríbenos por WhatsApp y te atendemos de inmediato:\n\n👉 https://wa.me/${waNumber}?text=Hola%2C+quiero+información+sobre+${encodeURIComponent(career.name)}\n\nHorarios: Lun–Vie 8:00–18:00 · Sáb 8:00–13:00`

    default:
      return ''
  }
}

function buildFreeTextResponse(
  input: string,
  career: Career,
  waNumber: string,
): string {
  const n = input.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

  if (n.match(/^(hola|buenas|buenos|hi|hey|saludos)/)) {
    return `¡Hola! Soy Eva, tu asesora académica 😊\nEstoy aquí para responderte sobre **${career.name}**.\n\n¿Qué quieres saber? Usa los botones de arriba o escríbeme.`
  }
  if (n.includes('campo') || n.includes('trabaj') || n.includes('empleo') || n.includes('donde trabajo')) {
    return getQuickResponse('campo', career, waNumber)
  }
  if (n.includes('beca') || n.includes('descuento') || n.includes('precio') || n.includes('costo') || n.includes('cuanto') || n.includes('mensualidad') || n.includes('colegiatura')) {
    return getQuickResponse('becas', career, waNumber)
  }
  if (n.includes('plan') || n.includes('malla') || n.includes('materias') || n.includes('semestre') || n.includes('duracion') || n.includes('cuanto tiempo') || n.includes('anos')) {
    return getQuickResponse('plan', career, waNumber)
  }
  if (n.includes('requisito') || n.includes('documento') || n.includes('necesito') || n.includes('ingreso') || n.includes('inscribir') || n.includes('inscripcion')) {
    return getQuickResponse('requisitos', career, waNumber)
  }
  if (n.includes('asesor') || n.includes('hablar') || n.includes('llamar') || n.includes('contacto') || n.includes('whatsapp')) {
    return getQuickResponse('asesor', career, waNumber)
  }
  if (n.includes('modalidad') || n.includes('horario') || n.includes('presencial') || n.includes('linea') || n.includes('sabatina')) {
    const modLabels: Record<string, string> = { presencial: 'Presencial (lun–vie)', 'en-linea': 'En Línea (clases en vivo mar/jue 20–22 hrs)', sabatina: 'Sabatina (sábados 8–13 hrs)' }
    return `**${career.name}** se ofrece en modalidad:\n\n• ${modLabels[career.modality] ?? career.modality}\n\nTodas las modalidades tienen el mismo título con validez SEP.\n\n¿Algo más en lo que te pueda ayudar?`
  }
  if (n.includes('rvoe') || n.includes('sep') || n.includes('validez') || n.includes('oficial')) {
    return `Sí, **${career.name}** cuenta con RVOE otorgado por la SEP. Tu título tiene validez oficial en toda la República Mexicana.\n\n¿Quieres más información sobre el proceso de admisión?`
  }

  return `Entendido 😊\n\nPuedo ayudarte con información sobre **${career.name}**:\n\n• Campo laboral\n• Becas y precios\n• Plan de estudios\n• Requisitos de ingreso\n\n¿Sobre qué quieres saber más?`
}

// ─── Render message lines with bold support ──────────────────────────────────

function MessageContent({ content }: { content: string }) {
  return (
    <>
      {content.split('\n').map((line, i) => {
        const parts = line.split(/(\*\*.*?\*\*)/)
        return (
          <p key={i} className={i > 0 ? 'mt-1.5' : ''}>
            {parts.map((part, j) =>
              part.startsWith('**') && part.endsWith('**')
                ? <strong key={j}>{part.slice(2, -2)}</strong>
                : part.includes('https://') ? (
                  <a key={j} href={part.trim()} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 break-all">{part.trim()}</a>
                ) : part
            )}
          </p>
        )
      })}
    </>
  )
}

// ─── Widget ───────────────────────────────────────────────────────────────────

export default function EvaCareerWidget({ career }: { career: Career }) {
  const { values } = useAdmin()
  const [isOpen, setIsOpen] = useState(false)
  const [showBubble, setShowBubble] = useState(false)
  const [bubbleDismissed, setBubbleDismissed] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const quickActionsVisible = true
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const waNumber = (values.whatsappNumber || '+529996442662').replace(/\D/g, '')

  // Auto-bubble: 3–5 seconds after mount
  useEffect(() => {
    const delay = 3000 + Math.random() * 2000
    const timer = setTimeout(() => {
      if (!isOpen && !bubbleDismissed) setShowBubble(true)
    }, delay)
    return () => clearTimeout(timer)
  }, [])

  // Initialize messages when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `¡Hola! Soy **Eva**, tu asesora académica 🎓\n\nVeo que estás explorando **${career.name}**. Puedo resolver tus dudas al instante.\n\n¿Sobre qué quieres saber?`,
      }])
    }
  }, [isOpen])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  function openChat() {
    setShowBubble(false)
    setBubbleDismissed(true)
    setIsOpen(true)
    setTimeout(() => inputRef.current?.focus(), 350)
  }

  function dismissBubble(e: React.MouseEvent) {
    e.stopPropagation()
    setShowBubble(false)
    setBubbleDismissed(true)
  }

  function handleQuickAction(actionId: string) {
    const label = QUICK_ACTIONS.find((a) => a.id === actionId)?.label ?? actionId
    const response = getQuickResponse(actionId, career, waNumber)
    if (!response) return
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: 'user', content: label },
      { id: (Date.now() + 1).toString(), role: 'assistant', content: response },
    ])
    // Keep quick actions visible for continued exploration
  }

  async function sendMessage() {
    if (!input.trim() || isLoading) return
    const text = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'user', content: text }])
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 500 + Math.random() * 700))
    const response = buildFreeTextResponse(text, career, waNumber)
    setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: response }])
    setIsLoading(false)
  }

  const MODALITY_LABEL: Record<string, string> = {
    presencial: 'Presencial',
    'en-linea': 'En Línea',
    sabatina: 'Sabatina',
  }

  return (
    <>
      <style>{`
        @keyframes evaWidgetFabPulse {
          0%, 100% { opacity: 0; transform: scale(1); }
          50%       { opacity: 0.35; transform: scale(1.6); }
        }
        @keyframes evaWidgetBubbleIn {
          from { opacity: 0; transform: translateY(8px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes evaWidgetPanelIn {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes evaWidgetMsgIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Fixed container — grows upward from FAB anchor */}
      <div className="fixed right-4 bottom-[9.5rem] md:bottom-[5.5rem] z-[60] flex flex-col items-end gap-3">

        {/* ── Chat panel ─────────────────────────────────────────────────── */}
        {isOpen && (
          <div
            className="flex flex-col bg-white rounded-3xl overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.18),0_0_0_1px_rgba(0,0,0,0.06)]"
            style={{
              width: 'min(340px, calc(100vw - 2rem))',
              maxHeight: 'min(520px, calc(100dvh - 18rem))',
              animation: 'evaWidgetPanelIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both',
            }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1B3070] to-[#1a4a8a] px-4 py-3.5 flex items-center gap-3 flex-shrink-0">
              <div
                className="w-10 h-10 rounded-xl bg-[#E6B400]/20 border-2 border-[#E6B400]/50 flex items-center justify-center flex-shrink-0"
                style={{ animation: 'evaWidgetFabPulse 3.5s ease-in-out infinite', boxShadow: '0 0 12px rgba(230,180,0,0.4)' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#E6B400" className="w-5 h-5">
                  <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-black text-[13px] leading-tight">Eva IA – Asesora académica</p>
                <p className="text-white/60 text-[11px] mt-0.5 truncate">{career.name}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" style={{ animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' }} />
                <span className="text-white/50 text-[11px]">En línea</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="ml-1 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-white/70">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>

            {/* Career context badge */}
            <div className="px-4 py-3 bg-[#f7f8fc] border-b border-gray-100 flex-shrink-0">
              <p className="text-[#1B3070] text-[11px] font-black uppercase tracking-wide truncate mb-2">{career.name}</p>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#1B3070]/10 text-[#1B3070]">
                  📍 {career.area}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                  career.modality === 'presencial' ? 'bg-blue-100 text-blue-700' :
                  career.modality === 'en-linea'   ? 'bg-green-100 text-green-700' :
                                                     'bg-orange-100 text-orange-700'
                }`}>
                  {MODALITY_LABEL[career.modality] ?? career.modality}
                </span>
                {career.monthlyFee && (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#E6B400]/20 text-[#8B6800]">
                    💰 {career.monthlyFee}
                  </span>
                )}
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                  ⏱ {DURATIONS[career.area]?.split('·')[0].trim() ?? '4 años'}
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  style={{ animation: 'evaWidgetMsgIn 0.28s ease both' }}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-[#1B3070] flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                      <span className="text-[#E6B400] text-[9px] font-black">E</span>
                    </div>
                  )}
                  <div
                    className={`max-w-[82%] rounded-2xl px-3 py-2.5 text-[13px] shadow-sm leading-[1.6] ${
                      msg.role === 'user'
                        ? 'bg-[#1B3070] text-white rounded-tr-sm'
                        : 'bg-white text-gray-900 rounded-tl-sm border border-gray-100'
                    }`}
                  >
                    <MessageContent content={msg.content} />
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex gap-2 justify-start" style={{ animation: 'evaWidgetMsgIn 0.28s ease both' }}>
                  <div className="w-7 h-7 rounded-full bg-[#1B3070] flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                    <span className="text-[#E6B400] text-[9px] font-black">E</span>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:120ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:240ms]" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Quick action chips — fixed strip above input */}
            {quickActionsVisible && messages.length > 0 && (
              <div className="px-3 pt-2 pb-1.5 border-t border-gray-100 bg-white flex-shrink-0">
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => handleQuickAction(action.id)}
                      disabled={isLoading}
                      className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 bg-[#f0f3f9] hover:bg-[#e4e9f5] active:bg-[#d8e0f0] border border-[#1B3070]/12 hover:border-[#1B3070]/25 rounded-full text-[11px] font-semibold text-[#1B3070] transition-all duration-150 active:scale-[0.97] disabled:opacity-40 whitespace-nowrap"
                    >
                      <span className="text-sm leading-none">{action.emoji}</span>
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input bar */}
            <div className="px-3 py-2.5 border-t border-gray-100 bg-white flex-shrink-0"
              style={{ paddingBottom: 'calc(0.625rem + env(safe-area-inset-bottom, 0px))' }}
            >
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2 focus-within:border-[#1B3070]/40 focus-within:bg-white transition-colors">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Escribe tu pregunta..."
                  className="flex-1 bg-transparent text-[13px] focus:outline-none text-gray-900 placeholder:text-gray-400"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="w-8 h-8 rounded-full bg-[#1B3070] disabled:bg-gray-200 flex items-center justify-center transition-all active:scale-95 flex-shrink-0 shadow-sm disabled:shadow-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-white">
                    <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Auto-bubble ────────────────────────────────────────────────── */}
        {showBubble && !isOpen && (
          <button
            onClick={openChat}
            className="relative bg-white border border-gray-200 rounded-2xl rounded-br-sm px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.12)] max-w-[240px] text-left transition-transform hover:scale-[1.02] active:scale-[0.98]"
            style={{ animation: 'evaWidgetBubbleIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both' }}
          >
            {/* Dismiss × */}
            <span
              onClick={dismissBubble}
              role="button"
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gray-400 hover:bg-gray-500 flex items-center justify-center cursor-pointer shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-white">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </span>
            <p className="text-[13px] text-gray-800 leading-snug">
              Veo que estás viendo <strong className="text-[#1B3070]">{career.name}</strong> 👀
            </p>
            <p className="text-[12px] text-gray-500 mt-1">¿Quieres que te explique más sobre esta carrera?</p>
            <p className="text-[11px] text-[#1B3070] font-black mt-2 uppercase tracking-wide">Toca para chatear →</p>
          </button>
        )}

        {/* ── FAB button ─────────────────────────────────────────────────── */}
        <button
          onClick={isOpen ? () => setIsOpen(false) : openChat}
          aria-label="Hablar con Eva IA"
          className="relative flex-shrink-0 rounded-full bg-[#1B3070] flex items-center justify-center shadow-[0_4px_20px_rgba(27,48,112,0.45)] transition-transform duration-200 hover:scale-110 active:scale-95"
          style={{ width: 52, height: 52 }}
        >
          {/* Pulse ring */}
          {!isOpen && (
            <span
              className="absolute w-full h-full rounded-full bg-[#1B3070]"
              style={{ animation: 'evaWidgetFabPulse 2.8s ease-in-out infinite' }}
            />
          )}
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-white relative z-10">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#E6B400" className="w-6 h-6 relative z-10">
              <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
            </svg>
          )}
        </button>

      </div>
    </>
  )
}
