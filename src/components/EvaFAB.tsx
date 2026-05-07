import { useNavigate, useLocation } from 'react-router-dom'

export default function EvaFAB() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // Hide only on Eva IA page itself
  if (pathname === '/eva-ia') return null

  return (
    <button
      onClick={() => navigate('/eva-ia')}
      aria-label="Hablar con Eva IA"
      className="group fixed z-50 right-5 bottom-[9.5rem] md:bottom-[5.5rem]"
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
        Habla con Eva IA
        <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 border-4 border-transparent border-l-gray-900/90" />
      </span>

      {/* Button */}
      <div
        className="rounded-full bg-[#1B3070] flex items-center justify-center
          shadow-[0_4px_20px_rgba(27,48,112,0.45)]
          transition-transform duration-200 hover:scale-110 active:scale-95"
        style={{ width: 52, height: 52 }}
      >
        {/* Pulse ring */}
        <span className="absolute w-full h-full rounded-full bg-[#1B3070]"
          style={{ animation: 'evaFabPulse 2.8s ease-in-out infinite' }} />
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#E6B400" className="w-6 h-6 relative z-10">
          <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
        </svg>
      </div>

      <style>{`
        @keyframes evaFabPulse {
          0%, 100% { opacity: 0; transform: scale(1); }
          50%       { opacity: 0.3; transform: scale(1.5); }
        }
      `}</style>
    </button>
  )
}
