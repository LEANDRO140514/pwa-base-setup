import { useState } from 'react'
import VoiceAgentPanel from './VoiceAgentPanel'

/**
 * Floating button that opens the xAI (Grok) voice agent panel.
 * The panel handles WebSocket connection, audio playback, and text input.
 * EVA (rule-based chat) remains completely untouched.
 */
export default function VoiceAgentFAB() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Habla con Eva por voz"
        className="group fixed z-[9999] cursor-pointer right-5 bottom-[152px] md:bottom-[88px]"
      >
        {/* Tooltip */}
        <span className="
          absolute right-full mr-3 top-1/2 -translate-y-1/2
          whitespace-nowrap bg-gray-900/90 text-white text-xs font-medium
          px-3 py-1.5 rounded-lg
          opacity-0 pointer-events-none
          group-hover:opacity-100
          transition-opacity duration-200
        ">
          Habla con Eva por voz
          <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 border-4 border-transparent border-l-gray-900/90" />
        </span>

        {/* Button */}
        <div className="
          w-[60px] h-[60px] rounded-full
          bg-[#8B0000]
          shadow-[0_4px_16px_rgba(139,0,0,0.45)]
          flex items-center justify-center
          transition-transform duration-200
          hover:scale-110 active:scale-95
        ">
          <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v1a7 7 0 0 1-14 0v-1H3v1a9 9 0 0 0 8 8.94V21h-3v2h8v-2h-3v-1.06A9 9 0 0 0 21 11v-1Z" />
          </svg>
        </div>
      </button>

      {/* Voice agent panel */}
      {open && <VoiceAgentPanel onClose={() => setOpen(false)} />}
    </>
  )
}