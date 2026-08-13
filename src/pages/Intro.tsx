import { useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAdmin } from '@/context/AdminContext'
import { useTestModal } from '@/context/TestModalContext'
import { applySEO } from '@/lib/seo'

// ─── Scroll-reveal hook ───────────────────────────────────────────────────────

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true) },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])
  return { ref, inView }
}

function FadeUp({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const { ref, inView } = useInView()
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.8s ease ${delay}ms, transform 0.8s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

const stagger = {
  hidden: { opacity: 0, y: 40 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const, delay: 0.1 + custom * 0.15 },
  }),
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Intro() {
  const { values } = useAdmin()
  const navigate = useNavigate()
  const { openTest } = useTestModal()
  const waNumber = (values.whatsappNumber || '+529991444478').replace(/\D/g, '')

  // ── SEO ──────────────────────────────────────────────────────────────
  useEffect(() => {
    applySEO({
      title: 'Universidad Latino | Licenciaturas en Mérida, Yucatán',
      description: 'Licenciaturas presenciales, en línea y sabatinas con RVOE SEP. Becas de hasta 50% sujeta a validación. ¡Inscripciones abiertas!',
    })
  }, [])

  return (
    <div className="w-full overflow-x-hidden">

      <style>{`
        @keyframes scrollChevron {
          0%, 100% { opacity: 0.4; transform: translateY(0); }
          50%       { opacity: 0.9; transform: translateY(8px); }
        }
      `}</style>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SECTION 1 — INTRO CINEMATIC                                        */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <section className="relative w-full min-h-screen overflow-hidden bg-[#0a0f1e]">

        {/* Background image with dark overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        {/* Video background */}
        <video
          autoPlay muted loop playsInline preload="none"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0, transition: 'opacity 1.6s ease' }}
          onCanPlay={(e) => { (e.target as HTMLVideoElement).style.opacity = '1' }}
        >
          <source src="https://videos.pexels.com/video-files/3195394/3195394-hd_1280_720_25fps.mp4" type="video/mp4" />
        </video>

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />

        {/* Content with Framer Motion */}
        <div className="relative z-10 flex flex-col items-start justify-end min-h-screen px-8 pb-20">
          <motion.p
            custom={0}
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="text-[#E6B400] text-[10px] font-black uppercase tracking-[0.32em] mb-5"
          >
            Universidad Latino · Mérida, Yucatán
          </motion.p>

          <motion.h1
            custom={1}
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="text-white font-black text-5xl leading-[0.95] tracking-tight mb-6 max-w-xs"
          >
            Tu futuro comienza aquí
          </motion.h1>

          <motion.p
            custom={2}
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="text-white/50 text-base leading-relaxed mb-10 max-w-xs"
          >
            No elijas una carrera al azar. Descubre la que realmente es para ti con inteligencia artificial.
          </motion.p>

          <motion.div
            custom={3}
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-3 w-full max-w-xs"
          >
            <button
              onClick={openTest}
              className="flex items-center justify-center gap-2 bg-[#E6B400] text-[#1B3070] font-black px-6 py-4 rounded-full text-sm shadow-[0_8px_32px_rgba(230,180,0,0.35)] hover:brightness-105 hover:shadow-[0_12px_40px_rgba(230,180,0,0.50)] hover:scale-[1.02] active:scale-95 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0">
                <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              Iniciar Test Vocacional
            </button>
            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-white font-semibold px-6 py-4 rounded-full text-sm border border-white/30 hover:bg-white/10 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Hablar con un asesor
            </a>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="absolute bottom-8 right-8 flex flex-col items-center gap-1.5"
        >
          <span className="text-white/30 text-[9px] uppercase tracking-widest" style={{ writingMode: 'vertical-lr' }}>Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/30 to-transparent" />
        </motion.div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SECTION 2 — PROBLEM                                                 */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <section className="relative w-full min-h-screen bg-white flex items-center overflow-hidden">
        <div className="w-full px-8 py-24">
          <FadeUp delay={0}>
            <span className="block text-[10px] font-black uppercase tracking-[0.28em] text-gray-300 mb-8">El problema</span>
          </FadeUp>
          <FadeUp delay={100}>
            <h2 className="font-black text-[#1B3070] text-4xl leading-[1.05] tracking-tight mb-8 max-w-sm">
              Elegir una carrera no debería ser una decisión al azar.
            </h2>
          </FadeUp>
          <FadeUp delay={220}>
            <div className="w-12 h-px bg-[#E6B400] mb-8" />
          </FadeUp>
          <FadeUp delay={300}>
            <p className="text-gray-400 text-xl leading-relaxed max-w-xs">
              Es una de las decisiones más importantes de tu vida.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SECTION 3 — TENSION                                                 */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <section className="relative w-full min-h-screen overflow-hidden bg-[#0a0f1e]">
        <video
          autoPlay muted loop playsInline preload="none"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
          onCanPlay={(e) => { (e.target as HTMLVideoElement).style.opacity = '0.25' }}
        >
          <source src="https://videos.pexels.com/video-files/3195394/3195394-hd_1280_720_25fps.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1e]/60 to-[#0a0f1e]/95" />
        <div className="relative z-10 w-full px-8 py-24 flex flex-col justify-center min-h-screen">
          <FadeUp delay={0}>
            <span className="block text-[10px] font-black uppercase tracking-[0.28em] text-white/25 mb-8">La realidad</span>
          </FadeUp>
          <FadeUp delay={100}>
            <h2 className="font-black text-white text-4xl leading-[1.05] tracking-tight mb-8 max-w-sm">
              Miles de estudiantes eligen sin estar seguros.
            </h2>
          </FadeUp>
          <FadeUp delay={220}>
            <div className="w-12 h-px bg-[#E6B400]/50 mb-8" />
          </FadeUp>
          <FadeUp delay={300}>
            <p className="text-white/40 text-xl leading-relaxed max-w-xs">
              Y después cambian de carrera o pierden tiempo valioso.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SECTION 4 — SOLUTION                                                */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <section className="relative w-full min-h-screen bg-[#1B3070] overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative z-10 w-full px-8 py-24 flex flex-col justify-center min-h-screen">
          <FadeUp delay={0}>
            <span className="block text-[10px] font-black uppercase tracking-[0.28em] text-[#E6B400] mb-8">Nuestra diferencia</span>
          </FadeUp>
          <FadeUp delay={100}>
            <h2 className="font-black text-white text-4xl leading-[1.05] tracking-tight mb-14 max-w-sm">
              Por eso en Universidad Latino lo hacemos diferente.
            </h2>
          </FadeUp>
          <div className="space-y-10">
            {[
              {
                num: '01',
                title: 'Inteligencia artificial que te orienta',
                desc: 'Eva IA analiza tu perfil y te guía hacia tu carrera ideal.',
              },
              {
                num: '02',
                title: 'Test vocacional personalizado',
                desc: 'En menos de 2 minutos descubres qué carrera se adapta a ti.',
              },
              {
                num: '03',
                title: 'Acompañamiento real',
                desc: 'Asesores que te apoyan en cada paso del proceso.',
              },
            ].map((item, i) => (
              <FadeUp key={i} delay={200 + i * 120}>
                <div className="flex items-start gap-5">
                  <span className="text-[#E6B400]/30 font-black text-3xl leading-none flex-shrink-0 mt-1">{item.num}</span>
                  <div>
                    <p className="text-white font-black text-base leading-tight">{item.title}</p>
                    <p className="text-white/40 text-sm mt-2 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SECTION 5 — TRANSITION TO SYSTEM                                    */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <section className="relative w-full min-h-screen bg-white overflow-hidden">
        <div className="w-full px-8 py-24 flex flex-col justify-center min-h-screen">
          <FadeUp delay={0}>
            <span className="block text-[10px] font-black uppercase tracking-[0.28em] text-gray-300 mb-8">Empieza ahora</span>
          </FadeUp>
          <FadeUp delay={80}>
            <h2 className="font-black text-[#1B3070] text-5xl leading-[0.97] tracking-tight mb-4">
              No eliges solo.
            </h2>
          </FadeUp>
          <FadeUp delay={150}>
            <p className="text-gray-300 text-2xl font-black mb-16">Te guiamos paso a paso.</p>
          </FadeUp>
          <div className="space-y-1">
            {[
              {
                label: 'Descubre tu carrera',
                sub: 'Test vocacional · 2 min',
                action: 'test' as const,
                external: false,
              },
              {
                label: 'Explora programas',
                sub: '12 carreras · RVOE SEP',
                to: '/carreras',
                external: false,
              },
              {
                label: 'Calcula tu beca',
                sub: 'Basada en tu promedio',
                to: '/mi-beca',
                external: false,
              },
            ].map((item, i) => {
              const inner = (
                <div className="flex items-center justify-between py-5 border-b border-gray-100 active:opacity-60 transition-opacity">
                  <div>
                    <p className="font-black text-[#1B3070] text-base">{item.label}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{item.sub}</p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-200 flex-shrink-0">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                  </svg>
                </div>
              )
              return (
                <FadeUp key={i} delay={250 + i * 80}>
                  {'action' in item && item.action === 'test' ? (
                    <button className="w-full text-left" onClick={openTest}>{inner}</button>
                  ) : (
                    <button
                      className="w-full text-left"
                      onClick={() => {
                        localStorage.setItem('app_visited', '1')
                        navigate(item.to!)
                      }}
                    >
                      {inner}
                    </button>
                  )}
                </FadeUp>
              )
            })}
          </div>
          <FadeUp delay={550}>
            <button
              onClick={() => {
                localStorage.setItem('app_visited', '1')
                navigate('/')
              }}
              className="mt-12 text-gray-300 text-sm font-medium tracking-wide hover:text-gray-500 transition-colors"
            >
              Entrar al inicio →
            </button>
          </FadeUp>
        </div>
      </section>

    </div>
  )
}