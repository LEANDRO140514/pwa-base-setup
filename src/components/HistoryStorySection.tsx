import { useRef } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'

// ─── Data ─────────────────────────────────────────────────────────────────────

const BLOCKS = [
  {
    eyebrow: 'Nuestro origen',
    title: 'Todo comenzó con una vocación',
    text: 'En 1963, la profesora María Asunción Cardeña Sosa de Tenreiro decidió continuar su pasión por enseñar desde su propio hogar, dando inicio a una historia que transformaría vidas.',
    img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=900&q=80&fit=crop',
    accent: '#E6B400',
    flip: false,
    bg: '#ffffff',
  },
  {
    eyebrow: 'Los primeros pasos',
    title: 'Una idea que creció con propósito',
    text: 'Con el paso de los años, aquel proyecto independiente se consolidó como el Centro Educativo Latino, ampliando su impacto en la formación de estudiantes.',
    img: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&q=80&fit=crop',
    accent: '#60A5FA',
    flip: true,
    bg: '#f8fafc',
  },
  {
    eyebrow: 'Estructura',
    title: 'El nacimiento de una institución',
    text: 'En 1987 se formaliza la Asociación Civil, sentando las bases de un modelo educativo integral que perduró en el tiempo.',
    img: 'https://images.unsplash.com/photo-1562774053-701939374585?w=900&q=80&fit=crop',
    accent: '#A78BFA',
    flip: false,
    bg: '#ffffff',
  },
  {
    eyebrow: 'Evolución',
    title: 'El inicio del nivel profesional',
    text: 'En 1992 nace el nivel superior con programas académicos orientados al futuro, ofreciendo licenciaturas reconocidas por la SEP.',
    img: 'https://images.unsplash.com/photo-1550439062-609e1531270e?w=900&q=80&fit=crop',
    accent: '#FB923C',
    flip: true,
    bg: '#f8fafc',
  },
  {
    eyebrow: 'Crecimiento académico',
    title: 'Nuevas carreras, nuevas oportunidades',
    text: 'La institución amplía su oferta incorporando áreas como negocios, salud, derecho y tecnología, respondiendo a las necesidades del mercado laboral.',
    img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=900&q=80&fit=crop',
    accent: '#F87171',
    flip: false,
    bg: '#ffffff',
  },
  {
    eyebrow: 'Un nuevo capítulo',
    title: 'Nace Universidad Latino',
    text: 'En 2008, la institución se consolida oficialmente como Universidad Latino, fortaleciendo su identidad educativa y presencia en Mérida, Yucatán.',
    img: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=900&q=80&fit=crop',
    accent: '#34D399',
    flip: true,
    bg: '#f8fafc',
  },
  {
    eyebrow: 'Hoy',
    title: 'Formando el futuro',
    text: 'Hoy seguimos formando profesionales con visión, valores y compromiso con la sociedad. Más de 30 años de historia que continúan escribiéndose.',
    img: 'https://images.unsplash.com/photo-1529390079861-591de354faf5?w=900&q=80&fit=crop',
    accent: '#E6B400',
    flip: false,
    bg: '#ffffff',
  },
]

// ─── Parallax image ────────────────────────────────────────────────────────────

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

// ─── Fade up wrapper ──────────────────────────────────────────────────────────

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

// ─── Component ────────────────────────────────────────────────────────────────

export default function HistoryStorySection() {
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

      {/* Story blocks */}
      {BLOCKS.map((block, i) => (
        <div
          key={i}
          className={`flex flex-col ${block.flip ? 'md:flex-row-reverse' : 'md:flex-row'} min-h-[60vh]`}
          style={{ backgroundColor: block.bg }}
        >
          {/* Image */}
          <div className="w-full md:w-1/2 h-64 md:h-auto overflow-hidden relative">
            <ParallaxImg src={block.img} alt={block.title} />
          </div>

          {/* Text */}
          <div
            className="w-full md:w-1/2 flex items-center px-8 md:px-14 lg:px-20 py-12 md:py-16"
            style={{ backgroundColor: block.bg }}
          >
            <FadeText delay={0.1}>
              <div
                className="w-8 h-0.5 mb-5"
                style={{ backgroundColor: block.accent }}
              />
              <p
                className="text-[10px] font-black uppercase tracking-[0.35em] mb-4"
                style={{ color: block.accent }}
              >
                {block.eyebrow}
              </p>
              <h3 className="text-[#1B3070] font-black text-2xl md:text-3xl lg:text-[2rem] leading-tight tracking-tight mb-5 max-w-sm">
                {block.title}
              </h3>
              <p className="text-gray-500 text-sm md:text-base leading-relaxed max-w-md">
                {block.text}
              </p>
            </FadeText>
          </div>
        </div>
      ))}

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
