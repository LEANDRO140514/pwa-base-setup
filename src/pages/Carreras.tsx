import { useEffect, useState, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import TopBar from '@/components/layout/TopBar'
import { supabase } from '@/lib/supabase'
import { useAdmin } from '@/context/AdminContext'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Career {
  id: string
  name: string
  area: string
  modality: string
  monthly_price: string
  description: string
  duration?: string
  enrollment?: string
  highlights?: string[]
  image?: string
}

// ─── Area images ──────────────────────────────────────────────────────────────

const AREA_IMG: Record<string, string> = {
  'Derecho':     '/aulas.jpg',
  'Salud':       '/psi-estudiante.webp',
  'Negocios':    '/entrada-principal.jpg',
  'Gastronomía': '/espacios-convivencia.jpg',
  'Tecnología':  '/centro-computo.jpg',
}

// ─── Career-specific images ────────────────────────────────────────────────────

const CAREER_IMG: Record<string, string> = {
  // Supabase names (short)
  'Derecho':                                         '/img-server/8001/01_derecho.webp',
  'Derecho Online':                                  '/img-server/8001/02_derecho_online.webp',
  'Psicología':                                      '/img-server/8001/03_psicologia.webp',
  'Enfermería':                                      '/img-server/8001/04_enfermeria.webp',
  'Nutrición':                                       '/img-server/8001/05_nutricion.webp',
  'Negocios Internacionales':                        '/img-server/8001/06_negocios_internacionales.webp',
  'Ventas y Mercadotecnia':                          '/img-server/8001/07_ventas_mercadotecnia.webp',
  'Ventas y Mercadotecnia Online':                   '/img-server/8001/08_ventas_mercadotecnia_online.webp',
  'Gastronomía':                                     '/img-server/8001/12_gastronomia.webp',
  'Ingeniería en Sistemas Computacionales':           '/img-server/8001/11_ingenieria_sistemas.webp',
  'Administración Sabatina':                         '/img-server/8001/09_administracion_sabatina.webp',
  'Administración y Desarrollo Empresarial Online':  '/img-server/8001/10_administracion_online.webp',
  // AdminContext names (full - fallback)
  'Licenciatura en Derecho':                      '/img-server/8001/01_derecho.webp',
  'Licenciatura en Derecho (Online)':             '/img-server/8001/02_derecho_online.webp',
  'Licenciatura en Psicología':                   '/img-server/8001/03_psicologia.webp',
  'Licenciatura en Enfermería':                   '/img-server/8001/04_enfermeria.webp',
  'Licenciatura en Nutrición':                    '/img-server/8001/05_nutricion.webp',
  'Lic. en Negocios Internacionales':             '/img-server/8001/06_negocios_internacionales.webp',
  'Lic. en Ventas y Mercadotecnia':               '/img-server/8001/07_ventas_mercadotecnia.webp',
  'Lic. en Ventas y Mercadotecnia (Online)':      '/img-server/8001/08_ventas_mercadotecnia_online.webp',
  'Licenciatura en Gastronomía':                  '/img-server/8001/12_gastronomia.webp',
  'Licenciatura en Administración (Sabatina)':     '/img-server/8001/09_administracion_sabatina.webp',
  'Lic. en Administración y Desarrollo Empresarial (Online)': '/img-server/8001/10_administracion_online.webp',
}

const MODALITY_LABELS: Record<string, string> = {
  presencial:  'Presencial',
  'en-linea':  'En Línea',
  sabatina:    'Sabatina',
}

const MODALITY_COLORS: Record<string, string> = {
  presencial:  'bg-blue-500/20 text-blue-200 border-blue-400/30',
  'en-linea':  'bg-green-500/20 text-green-200 border-green-400/30',
  sabatina:    'bg-orange-500/20 text-orange-200 border-orange-400/30',
}

// ─── Normalization helpers ────────────────────────────────────────────────────

function normalizeModality(m: string): string {
  const map: Record<string, string> = {
    'Presencial': 'presencial', 'presencial': 'presencial',
    'En línea': 'en-linea', 'En Línea': 'en-linea', 'En linea': 'en-linea',
    'en-linea': 'en-linea', 'en_linea': 'en-linea', 'online': 'en-linea',
    'Sabatina': 'sabatina', 'sabatina': 'sabatina',
  }
  return map[m] ?? m.toLowerCase().replace(/\s+/g, '-')
}

function formatPrice(price: string | number | null | undefined, suffix = '/mes'): string {
  if (price === null || price === undefined || price === '') return ''
  const str = String(price).trim()
  if (str.includes('$')) return str
  const num = parseFloat(str.replace(/,/g, ''))
  if (isNaN(num)) return str
  return `$${num.toLocaleString('es-MX')}${suffix}`
}

// ─── Module-level cache ───────────────────────────────────────────────────────

let careersCache: Career[] | null = null

// ─── Individual career block ──────────────────────────────────────────────────

function CareerSection({
  career,
  onRef,
  scrollContainerRef,
}: {
  career: Career
  onRef: (el: HTMLElement | null) => void
  scrollContainerRef: React.RefObject<HTMLDivElement>
}) {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: false, amount: 0.2 })

  const { scrollYProgress } = useScroll({
    target: ref,
    container: scrollContainerRef,
    offset: ['start end', 'end start'],
  })
  const bgY = useTransform(scrollYProgress, [0, 1], ['8%', '-8%'])

  // Register section ref with parent for dots + scroll-to
  useEffect(() => {
    onRef(ref.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const bgImg = career.image || CAREER_IMG[career.name] || AREA_IMG[career.area] || CAREER_IMG['Nutrición']

  const contentVariants = {
    hidden: { opacity: 0, y: 28 },
    visible: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const, delay },
    }),
  }

  return (
    // motion.section broadcasts "hover" variant to children without animate prop
    <motion.section
      ref={ref as React.RefObject<HTMLElement>}
      initial="rest"
      whileHover="hover"
      style={{ position: 'relative', overflow: 'hidden' }}
      className="min-h-[150px] sm:min-h-[175px] md:h-[22vh] lg:h-[24vh]"
    >
      {/* Parallax background — zoom on hover via variant propagation */}
      <motion.div
        variants={{
          rest: { scale: 1,     transition: { duration: 0.6, ease: 'easeInOut' } },
          hover: { scale: 1.025, transition: { duration: 0.5, ease: 'easeOut'  } },
        }}
        style={{
          position: 'absolute',
          top: '-10%',
          left: 0,
          right: 0,
          bottom: '-10%',
          y: bgY,
        }}
      >
        <img
          src={bgImg}
          alt={career.name}
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center left',
          }}
        />
      </motion.div>

      {/* Base gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to right, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.54) 60%, rgba(0,0,0,0.20) 100%)',
        }}
      />

      {/* Extra overlay that darkens on hover */}
      <motion.div
        variants={{
          rest: { opacity: 0, transition: { duration: 0.3 } },
          hover: { opacity: 1, transition: { duration: 0.25 } },
        }}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.14)' }}
      />

      {/* Content */}
      <div
        className="relative z-10 flex flex-col justify-center px-5 md:px-10 lg:px-14 py-4 md:py-5 max-w-3xl min-h-[150px] sm:min-h-[175px] md:min-h-[22vh] lg:min-h-[24vh]"
      >
        {/* Area label */}
        <motion.p
          custom={0.04}
          variants={contentVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="text-[#E6B400] text-[9px] font-black uppercase tracking-[0.3em] mb-1 md:mb-1.5 text-center md:text-left"
        >
          {career.area}
        </motion.p>

        {/* Career name — scaled from hero to catalog */}
        <motion.h2
          custom={0.11}
          variants={contentVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="text-white font-bold text-base md:text-xl leading-tight tracking-tight mb-1.5 md:mb-2 text-center md:text-left"
        >
          {career.name}
        </motion.h2>

        {/* Description */}
        {career.description && (
          <motion.p
            custom={0.18}
            variants={contentVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="text-gray-300 text-[11px] md:text-xs leading-snug mb-2 max-w-md line-clamp-2 text-center md:text-left"
          >
            {career.description}
          </motion.p>
        )}

        {/* Chips: modalidad, duración, precio */}
        <motion.div
          custom={0.24}
          variants={contentVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="flex flex-wrap gap-1 mb-3 justify-center md:justify-start"
        >
          {career.modality && (
            <span
              className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                MODALITY_COLORS[career.modality] ?? 'bg-white/10 text-white border-white/20'
              }`}
            >
              {MODALITY_LABELS[career.modality] ?? career.modality}
            </span>
          )}
          {career.duration && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border bg-white/10 text-white border-white/20">
              {career.duration}
            </span>
          )}
          {career.monthly_price && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border bg-[#E6B400]/15 text-[#E6B400] border-[#E6B400]/30">
              {career.monthly_price}
            </span>
          )}
        </motion.div>

        {/* CTA — full-width on mobile, auto on desktop */}
        <motion.div
          custom={0.31}
          variants={contentVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="flex justify-center"
        >
          <Link
            to={`/carrera/${career.id}`}
            className="inline-flex items-center justify-center gap-1 bg-[#E6B400] text-[#1B3070] font-semibold text-xs tracking-wide px-4 py-2 rounded-full shadow-[0_4px_16px_rgba(230,180,0,0.30)] hover:scale-[1.03] active:scale-95 transition-transform duration-200"
          >
            Ver carrera
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-3 h-3 shrink-0"
            >
              <path
                fillRule="evenodd"
                d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </motion.div>
      </div>
    </motion.section>
  )
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function SnapSkeleton() {
  return (
    <div
      className="flex flex-col items-center justify-center bg-[#06090f] min-h-[150px] md:h-[22vh]"
    >
      <div className="w-7 h-7 rounded-full border-2 border-[#E6B400] border-t-transparent animate-spin mb-3" />
      <p className="text-white/40 text-[10px] font-medium tracking-widest uppercase">
        Cargando catálogo
      </p>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Carreras() {
  const navigate = useNavigate()
  const { values } = useAdmin()
  const [careers, setCareers] = useState<Career[]>(careersCache ?? [])
  const [loading, setLoading] = useState(careersCache === null)
  const [activeIndex, setActiveIndex] = useState(0)
  const sectionRefs = useRef<(HTMLElement | null)[]>([])
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (careersCache !== null) return

    const fetchCareers = async () => {
      const { data, error } = await supabase.from('careers').select('*')

      let result: Career[]
      if (error || !data || data.length === 0) {
        result = values.careers
          .filter((c) => c.active)
          .map((c) => ({
            id: c.id,
            name: c.name,
            area: c.area,
            modality: c.modality,
            monthly_price: formatPrice(c.monthlyFee),
            description: c.description ?? '',
            duration: c.duration,
            enrollment: formatPrice(c.enrollment, '') || undefined,
            highlights: c.highlights,
          }))
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result = data.map((d: any) => ({
          id: d.id,
          name: d.name ?? '',
          area: d.area ?? '',
          modality: normalizeModality(d.modality ?? ''),
          monthly_price: formatPrice(d.monthly_price),
          description: d.description ?? '',
          duration: d.duration ?? undefined,
          enrollment: formatPrice(d.enrollment_price ?? d.enrollment, '') || undefined,
          highlights: Array.isArray(d.highlights) ? d.highlights : undefined,
          image: d.image ?? undefined,
        }))
      }

      careersCache = result
      setCareers(result)
      setLoading(false)
    }

    fetchCareers()
  }, [])

  // IntersectionObserver — catalog mode: highlight the topmost visible section
  useEffect(() => {
    if (careers.length === 0) return
    const container = scrollContainerRef.current
    if (!container) return

    const refs = sectionRefs.current.filter(Boolean) as HTMLElement[]
    if (refs.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = sectionRefs.current.findIndex((r) => r === entry.target)
            if (idx !== -1) setActiveIndex(idx)
          }
        })
      },
      // Detection band: top 5% to bottom 50% — highlights the topmost visible section
      { root: container, rootMargin: '-5% 0px -50% 0px', threshold: 0 },
    )

    refs.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [careers])

  // Click dot → scroll to section
  const scrollToSection = useCallback((index: number) => {
    const el = sectionRefs.current[index]
    const container = scrollContainerRef.current
    if (!el || !container) return
    container.scrollTo({ top: el.offsetTop, behavior: 'smooth' })
  }, [])

  // Stable ref registration callback per index
  const registerRef = useCallback(
    (index: number) => (el: HTMLElement | null) => {
      sectionRefs.current[index] = el
    },
    [],
  )

  return (
    <div className="relative" style={{ height: '100dvh', overflow: 'hidden' }}>
      {/* Transparent TopBar overlay — mobile only */}
      <div className="absolute inset-x-0 top-0 z-50 md:hidden">
        <TopBar transparent />
      </div>

      {/* Back button — top-right, visible on all backgrounds */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-3 right-4 md:top-4 md:right-8 z-50 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold hover:bg-[#E6B400] hover:text-[#1B3070] hover:border-[#E6B400] transition-all duration-200"
        aria-label="Volver atrás"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
          <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
        </svg>
        Volver
      </button>

      {/* Continuous scroll container — no snap, catalog feel */}
      <div
        ref={scrollContainerRef}
        className="h-full"
        style={{ overflowY: loading ? 'hidden' : 'scroll' }}
      >
        {loading ? (
          <SnapSkeleton />
        ) : careers.length === 0 ? (
          <div className="flex items-center justify-center bg-[#06090f] min-h-[150px] md:h-[22vh]">
            <p className="text-white/50 text-sm">No hay carreras disponibles</p>
          </div>
        ) : (
          <>
            {/* Desktop spacer — pushes first card below the fixed NavBar (h-16 = 64px) */}
            <div className="hidden md:block h-16" />
            {careers.map((career, index) => (
              <CareerSection
                key={career.id}
                career={career}
                onRef={registerRef(index)}
                scrollContainerRef={scrollContainerRef}
              />
            ))}
          </>
        )}
      </div>

      {/* Lateral dots navigation — fixed, outside scroll container */}
      {!loading && careers.length > 1 && (
        <nav
          className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-50"
          aria-label="Navegación de carreras"
        >
          {careers.map((c, i) => (
            <button
              key={c.id}
              onClick={() => scrollToSection(i)}
              aria-label={`Ir a ${c.name}`}
              title={c.name}
              className="flex items-center justify-center p-1 cursor-pointer"
            >
              <span
                className={`block rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? 'w-1.5 h-4 bg-[#E6B400]'
                    : 'w-1.5 h-1.5 bg-white/35 hover:bg-white/70'
                }`}
              />
            </button>
          ))}
        </nav>
      )}
    </div>
  )
}
