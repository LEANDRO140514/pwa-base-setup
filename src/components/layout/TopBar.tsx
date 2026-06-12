import { Link } from 'react-router-dom'
import { useAdmin } from '@/context/AdminContext'

interface TopBarProps {
  title?: string
  showBack?: boolean
  onBack?: () => void
  action?: React.ReactNode
  transparent?: boolean
}

export default function TopBar({ title, showBack, onBack, action, transparent }: TopBarProps) {
  const { values } = useAdmin()

  return (
    <header
      className={`md:hidden ${transparent ? 'absolute' : 'sticky'} top-0 z-40 ${
        transparent ? 'bg-transparent border-transparent' : 'bg-white/95 backdrop-blur-md border-b border-gray-100/80'
      }`}
      style={{ paddingTop: 'env(safe-area-inset-top)', width: '100%' }}
    >
      <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
        {showBack ? (
          <button
            onClick={onBack}
            className={`w-9 h-9 flex items-center justify-center -ml-2 ${transparent ? 'text-white' : 'text-[#1B3070]'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        ) : (
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo-escudo.png" alt="Universidad Latino" className="w-8 h-8 object-contain" />
            <span className={`font-black text-sm tracking-tight leading-none ${transparent ? 'text-white' : 'text-[#1B3070]'}`}>
              {values.appName}
            </span>
          </Link>
        )}

        {title && (
          <h1 className="absolute left-1/2 -translate-x-1/2 font-black text-[#1B3070] text-sm tracking-tight">
            {title}
          </h1>
        )}

        <div className="flex items-center gap-2">
          {action}
        </div>
      </div>
    </header>
  )
}
