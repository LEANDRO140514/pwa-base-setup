import { useEffect } from 'react'
import { useTestModal } from '@/context/TestModalContext'
import { trackStartTest } from '@/lib/tracking'

const TEST_URL = 'https://testunilatino.algorithmus.io/'

export default function TestVocacionalModal() {
  const { isOpen, closeTest } = useTestModal()

  // Fire StartTest event when modal opens
  useEffect(() => {
    if (isOpen) trackStartTest()
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeTest() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, closeTest])

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col"
      style={{ animation: 'testModalIn 0.25s ease both' }}
    >
      {/* Overlay backdrop (tap outside header to close) */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeTest} />

      {/* Modal container */}
      <div className="relative flex flex-col w-full h-full" style={{ animation: 'testModalSlide 0.3s ease both' }}>

        {/* Top bar */}
        <div className="relative z-10 flex items-center justify-between bg-[#1B3070] px-5 py-3 flex-shrink-0 shadow-lg"
          onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-3">
            <img src="/logo-escudo.png" alt="" className="w-7 h-7 object-contain opacity-90" />
            <div>
              <p className="text-white font-black text-sm leading-none">Test Vocacional</p>
              <p className="text-white/50 text-[10px] mt-0.5">Universidad Latino</p>
            </div>
          </div>
          <button
            onClick={closeTest}
            className="flex items-center gap-1.5 text-white/70 hover:text-white text-xs font-medium bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-all active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
            Cerrar
          </button>
        </div>

        {/* iframe */}
        <div className="relative flex-1 bg-white" onClick={(e) => e.stopPropagation()}>
          <iframe
            src={TEST_URL}
            title="Test Vocacional Universidad Latino"
            className="w-full h-full border-0"
            allow="camera; microphone; fullscreen"
            loading="eager"
          />
        </div>
      </div>

      <style>{`
        @keyframes testModalIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes testModalSlide {
          from { transform: translateY(20px); }
          to   { transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
