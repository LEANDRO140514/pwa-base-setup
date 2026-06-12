import { useRef } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'

// ─── Data ─────────────────────────────────────────────────────────────────────

const BLOCKS = [
  {
    eyebrow: 'Nuestro origen',
    title: 'Todo comenzó con una vocación',
    text: 'En 1963, la profesora María Asunción Cardeña Sosa de Tenreiro decidió continuar su pasión por enseñar desde su propio hogar, dando inicio a una historia que transformaría vidas.',
    img: '/img-server/8002/clase-1963.webp',
    accent: '#E6B400',
    flip: false,
    bg: '#ffffff',
  },
  {
    eyebrow: 'Los primeros pasos',
    title: 'Una idea que creció con propósito',
    text: 'Con el paso de los años, aquel proyecto independiente se consolidó como el Centro Educativo Latino, ampliando su impacto en la formación de estudiantes.',
    img: '/img-server/8002/instalaciones.webp',
    accent: '#60A5FA',
    flip: true,
    bg: '#f8fafc',
  },
  {
    eyebrow: 'Estructura',
    title: 'El nacimiento de una institución',
    text: 'En 1987 se formaliza la Asociación Civil, sentando las bases de un modelo educativo integral que perduró en el tiempo.',
    img: '/img-server/8002/entrada-principal.webp',
    accent: '#A78BFA',
    flip: false,
    bg: '#ffffff',
  },
  {
    eyebrow: 'Evolución',
    title: 'El inicio del nivel profesional',
    text: 'En 1992 nace el nivel superior con programas académicos orientados al futuro, ofreciendo licenciaturas reconocidas por la SEP.',
    img: '/img-server/8002/reunion.webp',
    accent: '#FB923C',
    flip: true,
    bg: '#f8fafc',
  },
  {
    eyebrow: 'Crecimiento académico',
    title: 'Nuevas carreras, nuevas oportunidades',
    text: 'La institución amplía su oferta incorporando áreas como negocios, salud, derecho y tecnología, respondiendo a las necesidades del mercado laboral.',
    img: '/img-server/8002/enfermeria-uni.webp',
    accent: '#F87171',
    flip: false,
    bg: '#ffffff',
  },
  {
    eyebrow: 'Un nuevo capítulo',
    title: 'Nace Universidad Latino',
    text: 'En 2008, la institución se consolida oficialmente como Universidad Latino, fortaleciendo su identidad educativa y presencia en Mérida, Yucatán.',
    img: '/img-server/8002/rectoria.webp',
    accent: '#34D399',
    flip: true,
    bg: '#f8fafc',
  },
  {
    eyebrow: 'Hoy',
    title: 'Formando el futuro',
    text: 'Hoy seguimos formando profesionales con visión, valores y compromiso con la sociedad. Más de 30 años de historia que continúan escribiéndose.',
    img: '/img-server/8002/birrete.webp',
    accent: '#E6B400',
    flip: false,
    bg: '#ffffff',
  },
]

// ─── Helpers for mobile ────────────────────────────────────────────────────────

function ParallaxImg({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])
  return (
    <div ref={ref} className="w-full h-full overflow-hidden">
      <motion.div style={{ y, position: 'relative', height: '116%', top: '-8%' }}>
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      </motion.div>
    </div>
  )
}

function FadeText({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  )
}

// ─── Desktop: horizontal slide ─────────────────────────────────────────────────

function HorizontalSlide({
  block,
  index,
  total,
}: {
  block: (typeof BLOCKS)[number]
  index: number
  total: number
}) {
  const textRef = useRef<HTMLDivElement>(null)
  const textInView = useInView(textRef, { once: true, amount: 0.3 })

  return (
    <div
      className="w-screen h-full flex-shrink-0 flex relative"
      style={{ backgroundColor: block.bg }}
    >
      {/* Image half */}
      <div
        className={`w-1/2 h-full overflow-hidden relative ${block.flip ? 'order-2' : 'order-1'}`}
      >
        <img src={block.img} alt={block.title} className="w-full h-full object-cover" />
        {/* Gradient edge overlay */}
        <div
          className="absolute inset-y-0 w-20 z-10"
          style={{
            [block.flip ? 'left' : 'right']: 0,
            background: block.flip
              ? `linear-gradient(to right, ${block.bg}, transparent)`
              : `linear-gradient(to left, ${block.bg}, transparent)`,
          }}
        />
      </div>

      {/* Text half */}
      <div
        className={`w-1/2 h-full flex items-center z-20 ${block.flip ? 'order-1' : 'order-2'}`}
        style={{ backgroundColor: block.bg }}
      >
        <motion.div
          ref={textRef}
          initial={{ opacity: 0, y: 20 }}
          animate={textInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="px-10 lg:px-16 xl:px-20"
        >
          <div className="w-8 h-0.5 mb-5" style={{ backgroundColor: block.accent }} />
          <p
            className="text-[10px] font-black uppercase tracking-[0.35em] mb-4"
            style={{ color: block.accent }}
          >
            {block.eyebrow}
          </p>
          <h3 className="text-[#1B3070] font-black text-3xl lg:text-[2.2rem] leading-tight tracking-tight mb-5 max-w-sm">
            {block.title}
          </h3>
          <p className="text-gray-500 text-base leading-relaxed max-w-md">
            {block.text}
          </p>
        </motion.div>
      </div>

      {/* Slide counter */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === index ? 'w-8 bg-[#E6B400]' : 'w-1.5 bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function HistoryStorySection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  const TOTAL = BLOCKS.length
  const x = useTransform(scrollYProgress, (v) => -(TOTAL - 1) * window.innerWidth * v)
  const hintOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0])

  return (
    <section>
      {/* Header */}
      <div className="py-16 md:py-20 text-center px-6 bg-white">
        <FadeText>
          <p className="text-[#E6B400] text-[10px] font-black uppercase tracking-[0.3em] mb-3">Trayectoria</p>
          <h2 className="text-[#1B3070] font-black text-3xl md:text-5xl leading-tight tracking-tight">
            Nuestra historia
          </h2>
        </FadeText>
      </div>

      {/* ── Desktop: horizontal scroll ────────────────────────────────────── */}
      <div ref={sectionRef} className="relative hidden md:block" style={{ height: `${TOTAL * 100}vh` }}>
        <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-hidden">
          <motion.div style={{ x }} className="flex h-full will-change-transform">
            {BLOCKS.map((block, i) => (
              <HorizontalSlide key={i} block={block} index={i} total={TOTAL} />
            ))}
          </motion.div>

          {/* Scroll hint — fades as user scrolls */}
          <motion.div
            className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1 pointer-events-none"
            style={{ opacity: hintOpacity }}
          >
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
              Desliza
            </span>
            <motion.div
              animate={{ x: [0, 6, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              className="w-4 h-4 text-gray-400"
            >
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.04 1.08l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.04-1.08l3.96 4.158V3.75A.75.75 0 0110 3z" clipRule="evenodd" />
              </svg>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ── Mobile: vertical layout ────────────────────────────────────────── */}
      <div className="md:hidden">
        {BLOCKS.map((block, i) => (
          <div
            key={i}
            className={`flex flex-col ${block.flip ? '' : ''}`}
            style={{ backgroundColor: block.bg }}
          >
            {/* Image */}
            <div className="w-full h-64 overflow-hidden relative">
              <ParallaxImg src={block.img} alt={block.title} />
            </div>

            {/* Text */}
            <div className="w-full flex items-center px-8 py-12" style={{ backgroundColor: block.bg }}>
              <FadeText delay={0.1}>
                <div className="w-8 h-0.5 mb-5" style={{ backgroundColor: block.accent }} />
                <p className="text-[10px] font-black uppercase tracking-[0.35em] mb-4" style={{ color: block.accent }}>
                  {block.eyebrow}
                </p>
                <h3 className="text-[#1B3070] font-black text-2xl leading-tight tracking-tight mb-5">
                  {block.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {block.text}
                </p>
              </FadeText>
            </div>
          </div>
        ))}
      </div>

      {/* Closing block */}
      <div className="relative bg-[#1B3070] py-14 md:py-20 text-center overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1.5px, transparent 1.5px)', backgroundSize: '40px 40px' }}
        />
        <div className="relative z-10 max-w-2xl mx-auto px-6">
          <FadeText>
            <div className="w-12 h-0.5 bg-[#E6B400]/50 mx-auto mb-6" />
            <h2 className="text-white font-black text-3xl md:text-5xl leading-tight tracking-tight mb-4">
              Más que una historia,<br />
              <span className="text-[#E6B400]">un legado</span>
            </h2>
            <p className="text-white/60 text-base leading-relaxed max-w-md mx-auto">
              Cada generación forma parte de esta historia. Una historia construida con pasión por la educación.
            </p>
          </FadeText>
        </div>
      </div>
    </section>
  )
}