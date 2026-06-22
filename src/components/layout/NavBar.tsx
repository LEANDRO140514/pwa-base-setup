import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAdmin } from '@/context/AdminContext'

const NAV_LINKS = [
  { to: '/',            label: 'Inicio',      end: true },
  { to: '/carreras',    label: 'Carreras',    end: false },
  { to: '/universidad', label: 'Universidad', end: false },
  // { to: '/eva-ia',  label: 'Eva IA',      end: false },  // suspended
]

export default function NavBar() {
  const { values } = useAdmin()
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [pathname])

  const isHeroPage = pathname === '/' || pathname === '/intro' || pathname === '/universidad'
  const transparent = isHeroPage && !scrolled

  return (
    <header
      className={`
        hidden md:flex fixed top-0 left-0 right-0 z-50
        transition-all duration-300
        ${transparent
          ? 'bg-transparent border-transparent'
          : 'bg-white/95 backdrop-blur-md border-b border-gray-100/80 shadow-sm'
        }
      `}
    >
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto px-8 h-16">

        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <img src="/logo-escudo.png" alt="Universidad Latino" className="w-9 h-9 object-contain" />
          <span className={`font-black text-sm tracking-tight leading-tight transition-colors ${transparent ? 'text-white' : 'text-[#1B3070]'}`}>
            {values.appName}
          </span>
        </NavLink>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {NAV_LINKS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `
                relative px-4 py-2 rounded-full text-sm font-semibold transition-all duration-150
                ${isActive
                  ? transparent
                    ? 'text-white bg-white/15'
                    : 'text-[#1B3070] bg-[#1B3070]/8'
                  : transparent
                    ? 'text-white/80 hover:text-white hover:bg-white/10'
                    : 'text-gray-500 hover:text-[#1B3070] hover:bg-gray-50'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  {label}
                  {isActive && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-6 h-[3px] rounded-full bg-[#E6B400] shadow-[0_0_8px_rgba(230,180,0,0.5)]" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>


      </div>
    </header>
  )
}
