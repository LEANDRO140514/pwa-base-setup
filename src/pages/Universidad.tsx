import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import TopBar from '@/components/layout/TopBar'
import HistoryStorySection from '@/components/HistoryStorySection'

// ─── Scroll-reveal wrapper ────────────────────────────────────────────────────

function FadeUp({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.15 })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Data ─────────────────────────────────────────────────────────────────────


const LEADERS = [
  { name: 'QBA. Hugo Pacheco Vázquez MGE.', role: 'Rector', desc: 'Fundador y rector de Universidad Latino con más de 30 años dedicados a la educación superior en Mérida.', img: '/rector-hugo-pacheco.webp' },
  { name: 'Doctor. Ariel Elías Ceballos Mijangos', role: 'Secretario Académico', desc: 'Responsable de la coordinación académica y el desarrollo educativo institucional.', img: '/secretario-ariel-ceballos.webp' },
  { name: 'MNA Gertrudis Yukary Rodríguez Góngora', role: 'Posgrados de Nutrición', desc: 'Especialista en posgrados del área de nutrición con enfoque en investigación y práctica clínica.', img: '/postgrados-gertrudis-rodriguez.webp' },
  { name: 'MAD Mario Gerardo Sánchez Valladares', role: 'Director Lic. en Derecho', desc: 'Abogado con amplia experiencia en el ámbito jurídico y la formación de profesionales del derecho.', img: '/director-derecho-mario-sanchez.webp' },
]

const INFRA = [
  { label: 'Espacios de aprendizaje práctico', sub: 'Formación aplicada profesional', img: '/img-server/8002/comedor-practicas.webp' },
  { label: 'Centro de Cómputo', sub: 'Tecnología actualizada para tu formación digital', img: '/centro-computo.jpg' },
  { label: 'Espacios Académicos', sub: 'Aulas diseñadas para el aprendizaje activo', img: '/aulas.jpg' },
  { label: 'Áreas de Convivencia', sub: 'Espacios para la vida universitaria plena', img: '/espacios-convivencia.jpg' },
]

const COMMUNITY_IMGS = [
  '/galeria/buhos-1.jpg',
  '/img-server/8002/estudiantes.webp',
  '/psi-estudiante.webp',
  '/img-server/8002/vista-aulas.webp',
]

const BUHOS_TIMELINE = [
  { year: '2003', title: 'Inicio competitivo', desc: 'Subcampeonato en Liga Patria' },
  { year: '2004', title: 'Ascenso histórico', desc: 'Más de 100 goles y ascenso de categoría' },
  { year: '2008', title: 'Campeón Copa Telmex', desc: 'Representación estatal' },
  { year: '2009', title: 'Campeón Liga Premier', desc: 'Primer título en Primera Fuerza' },
  { year: '2013', title: 'Campeón Cadetes', desc: 'Primer título juvenil' },
  { year: '2016', title: 'Bicampeonato Liga Premier', desc: 'Dominio competitivo' },
  { year: '2017', title: 'Campeón Copa', desc: 'Victoria vs Rogers' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Universidad() {
  const navigate = useNavigate()
  const [activeBuhoYear, setActiveBuhoYear] = useState(0)

  // Parallax ref for Búhos section
  const buhosRef = useRef<HTMLElement>(null)
  const { scrollYProgress: buhosScroll } = useScroll({
    target: buhosRef,
    offset: ['start end', 'end start'],
  })
  const buhosY = useTransform(buhosScroll, [0, 1], ['-8%', '8%'])

  return (
    <div className="flex flex-col bg-white">

      {/* Mobile TopBar overlay */}
      <div className="md:hidden fixed top-0 inset-x-0 z-50">
        <TopBar title="Universidad" transparent showBack onBack={() => navigate(-1)} />
      </div>

      {/* ── 1. HERO ──────────────────────────────────────────────────────── */}
      <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
        {/* Background — fade-in + subtle zoom */}
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.8, ease: 'easeOut' }}
        >
          <img
            src="/img-server/8002/entrada.webp"
            alt="Comunidad universitaria"
            className="w-full h-full object-cover object-center"
          />
        </motion.div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/75" />

        {/* Content */}
        <div className="relative z-10 text-center max-w-3xl mx-auto px-6 pt-20 md:pt-28 pb-20">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-[#E6B400] text-[10px] font-black uppercase tracking-[0.35em] mb-6"
          >
            Universidad Latino · Mérida, Yucatán
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-white font-black text-[2.6rem] md:text-[4rem] lg:text-[5rem] leading-[1.0] tracking-tight mb-6"
          >
            Más que una universidad.
            <br />
            <span className="text-[#E6B400]">Una comunidad</span>
            <br />
            que transforma tu futuro.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.72 }}
            className="text-white/65 text-sm md:text-base leading-relaxed mb-10 max-w-lg mx-auto"
          >
            No solo formamos profesionistas. Formamos personas capaces de construir su camino.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="flex justify-center"
          >
            <a
              href="#comunidad"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#1B3070] font-bold text-sm px-6 py-3 rounded-full hover:bg-white/90 active:scale-95 transition-all"
            >
              Conocer la comunidad
            </a>
          </motion.div>
        </div>

        {/* Animated scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          <span className="text-white/35 text-[9px] uppercase tracking-[0.25em]">Descubrir</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="w-5 h-5 text-white/35"
          >
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* ── 2. ORGULLO UNILATINO — HERO ──────────────────────────────────── */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.06, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
        >
          <img
            src="/img-server/8002/deportes.webp"
            alt="Orgullo Búhos UNILATINO"
            className="w-full h-full object-cover object-center"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/45 to-black/80" />
        <div className="relative z-10 text-center max-w-3xl mx-auto px-6">
          <FadeUp>
            <p className="text-[#FACC15] text-[10px] font-black uppercase tracking-[0.4em] mb-5">
              IDENTIDAD · COMUNIDAD · DEPORTE
            </p>
            <h2 className="text-white font-black text-[2.6rem] md:text-[4.5rem] lg:text-[5.5rem] leading-[1.0] tracking-tight mb-6">
              Orgullo<br />
              <span className="text-[#FACC15]">UNILATINO</span>
            </h2>
            <p className="text-white/65 text-sm md:text-base leading-relaxed mb-8 max-w-xl mx-auto">
              Ser parte de UNILATINO es más que estudiar una carrera. Es pertenecer a una comunidad que forma profesionales con disciplina, carácter y espíritu competitivo.
            </p>
            <a
              href="#buhos-timeline"
              className="inline-flex items-center gap-2 bg-[#FACC15] text-[#1B3070] font-black text-sm px-7 py-3 rounded-full hover:bg-[#FACC15]/90 active:scale-95 transition-all"
            >
              Conoce nuestra historia
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
              </svg>
            </a>
          </FadeUp>
        </div>
      </section>

      {/* ── 3. HISTORIA (storytelling scroll) ───────────────────────────── */}
      <HistoryStorySection />

      {/* ── Directivos — Liderazgo académico ─────────────────────────────── */}
      <section className="pt-16 pb-8 md:pt-20 md:pb-10 bg-[#f8fafc] overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <FadeUp className="text-center mb-12">
            <p className="text-[#E6B400] text-[10px] font-black uppercase tracking-[0.3em] mb-3">Directivos</p>
            <h2 className="text-[#1B3070] font-black text-3xl md:text-5xl leading-tight tracking-tight">
              Liderazgo académico
            </h2>
          </FadeUp>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {LEADERS.map((leader, i) => (
              <FadeUp key={i} delay={i * 0.08}>
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group">
                  <div className="h-44 md:h-52 overflow-hidden">
                    <img
                      src={leader.img}
                      alt={leader.name}
                      className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <p className="font-black text-[#1B3070] text-sm leading-tight">{leader.name}</p>
                    <p className="text-[#E6B400] text-[9px] font-bold uppercase tracking-wider mt-1">{leader.role}</p>
                    <p className="text-gray-400 text-[11px] mt-2 leading-relaxed">{leader.desc}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. COMUNIDAD ─────────────────────────────────────────────────── */}
      <section id="comunidad" className="pt-8 pb-20 md:pt-10 md:pb-28 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <FadeUp className="mb-10 max-w-xl">
            <p className="text-[#E6B400] text-[10px] font-black uppercase tracking-[0.3em] mb-3">Comunidad</p>
            <h2 className="text-[#1B3070] font-black text-3xl md:text-5xl leading-tight tracking-tight mb-4">
              Una comunidad que te impulsa
            </h2>
            <p className="text-gray-500 text-base leading-relaxed">
              Aquí no solo estudias. Aquí perteneces. Conectas. Creces con personas que comparten tu ambición.
            </p>
          </FadeUp>

          {/* Collage grid */}
          <FadeUp delay={0.15}>
            <div className="grid grid-cols-2 md:grid-cols-3 grid-rows-2 gap-2 md:gap-3 h-[300px] md:h-[500px]">
              {/* Left tall video */}
              <div className="row-span-2 overflow-hidden rounded-2xl">
                <video
                  src="/comunidad-video.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Top right wide */}
              <div className="col-span-1 md:col-span-2 overflow-hidden rounded-2xl group">
                <img src={COMMUNITY_IMGS[1]} alt="Vida universitaria" className="w-full h-full object-scale-down transition-transform duration-700 group-hover:scale-105" />
              </div>
              {/* Bottom right 1 */}
              <div className="overflow-hidden rounded-2xl group">
                <img src={COMMUNITY_IMGS[2]} alt="Estudiantes" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              {/* Bottom right 2 — desktop only */}
              <div className="overflow-hidden rounded-2xl group hidden md:block">
                <img src={COMMUNITY_IMGS[3]} alt="Campus" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── 3. BÚHOS ─────────────────────────────────────────────────────── */}
      <section
        ref={buhosRef}
        className="relative overflow-hidden min-h-[60vh] md:min-h-[70vh] flex items-center"
      >
        {/* Parallax background */}
        <motion.div
          style={{
            position: 'absolute',
            top: '-10%',
            left: 0,
            right: 0,
            bottom: '-10%',
            y: buhosY,
          }}
        >
          <img
            src="/galeria/buhos-2.jpg"
            alt="Búhos UNILATINO"
            className="w-full h-full object-cover object-center"
          />
        </motion.div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1B3070]/92 via-[#1B3070]/70 to-transparent" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-20 md:py-28">
          <FadeUp>
            <p className="text-[#E6B400] text-[10px] font-black uppercase tracking-[0.35em] mb-5">
              Identidad · Espíritu · Deporte
            </p>
            <h2 className="text-white font-black text-4xl md:text-6xl lg:text-7xl leading-[1.0] tracking-tight mb-5 max-w-md">
              Somos<br />
              <span className="text-[#E6B400]">Búhos</span>
            </h2>
            <p className="text-white/70 text-base md:text-lg leading-relaxed max-w-sm">
              Disciplina, pasión y espíritu de equipo dentro y fuera del aula. Ser Búho es más que un equipo — es una identidad.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ── 5. ORGULLO UNILATINO ─────────────────────────────────────────── */}

      {/* 5c. TIMELINE TÍTULOS BÚHOS */}
      <section id="buhos-timeline" className="pt-12 pb-4 md:pt-16 md:pb-6 bg-[#0F1C3F] overflow-hidden">
        <div className="max-w-5xl mx-auto px-6">
          <FadeUp className="mb-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <p className="text-[#FACC15] text-[10px] font-black uppercase tracking-[0.3em] mb-3">Palmarés deportivo</p>
                <h2 className="text-white font-black text-3xl md:text-5xl leading-tight tracking-tight">
                  Títulos Búhos
                </h2>
              </div>
              <img
                src="/buho-mascota.png"
                alt="Búho UNILATINO"
                className="w-48 md:w-64 lg:w-80 object-contain drop-shadow-2xl flex-shrink-0"
              />
            </div>
          </FadeUp>

          {/* Desktop: horizontal interactive */}
          <FadeUp delay={0.1} className="hidden md:block">
            <div className="relative mb-8">
              <div className="absolute top-4 left-0 right-0 h-px bg-white/15" />
              <div className="flex justify-between">
                {BUHOS_TIMELINE.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveBuhoYear(i)}
                    className="flex flex-col items-center gap-3 cursor-pointer group"
                  >
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 z-10 relative ${
                      activeBuhoYear === i ? 'border-[#FACC15] bg-[#FACC15]' : 'border-white/20 bg-[#0F1C3F] group-hover:border-white/50'
                    }`}>
                      <div className={`w-2 h-2 rounded-full transition-colors ${activeBuhoYear === i ? 'bg-[#0F1C3F]' : 'bg-white/25'}`} />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-wider transition-colors ${activeBuhoYear === i ? 'text-[#FACC15]' : 'text-white/35 group-hover:text-white/65'}`}>
                      {item.year}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <motion.div
              key={activeBuhoYear}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="rounded-2xl p-6 md:p-8 border border-white/10"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <p className="text-[#FACC15] text-[11px] font-black uppercase tracking-widest mb-2">
                {BUHOS_TIMELINE[activeBuhoYear].year}
              </p>
              <h3 className="text-white font-black text-xl md:text-2xl mb-2">
                {BUHOS_TIMELINE[activeBuhoYear].title}
              </h3>
              <p className="text-white/55 text-sm leading-relaxed">
                {BUHOS_TIMELINE[activeBuhoYear].desc}
              </p>
            </motion.div>
          </FadeUp>

          {/* Mobile: vertical */}
          <div className="md:hidden space-y-0">
            {BUHOS_TIMELINE.map((item, i) => (
              <FadeUp key={i} delay={i * 0.06}>
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-[#FACC15] flex-shrink-0 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-[#0F1C3F]" />
                    </div>
                    {i < BUHOS_TIMELINE.length - 1 && <div className="w-px flex-1 bg-white/15 my-1 min-h-[28px]" />}
                  </div>
                  <div className="pb-5">
                    <p className="text-[#FACC15] text-[10px] font-black uppercase tracking-wider mb-0.5">{item.year}</p>
                    <h4 className="text-white font-bold text-sm mb-0.5">{item.title}</h4>
                    <p className="text-white/45 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* 5d. GALERÍA UNILATINO */}
      <section className="pt-4 pb-16 md:pt-6 md:pb-20 bg-[#0F1C3F] overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <FadeUp className="text-center mb-10">
            <p className="text-[#FACC15] text-[10px] font-black uppercase tracking-[0.3em] mb-3">Identidad visual</p>
            <h2 className="text-white font-black text-3xl md:text-5xl leading-tight tracking-tight">
              Galería UNILATINO
            </h2>
            <p className="text-white/50 text-sm md:text-base mt-3 max-w-md mx-auto leading-relaxed">
              Momentos reales que definen el espíritu Búho
            </p>
          </FadeUp>

          {/* Grid: fotos + video */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {/* Foto 1 — tall */}
            <FadeUp delay={0} className="row-span-2">
              <div className="rounded-2xl overflow-hidden h-full min-h-[280px] md:min-h-[400px] group">
                <img src="/galeria/buhos-1.jpg" alt="Búhos UNILATINO" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
            </FadeUp>

            {/* Foto 2 */}
            <FadeUp delay={0.08}>
              <div className="rounded-2xl overflow-hidden h-[140px] md:h-[190px] group">
                <img src="/img-server/8002/futbol-equipo.webp" alt="Búhos UNILATINO" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
            </FadeUp>

            {/* Foto 3 */}
            <FadeUp delay={0.12}>
              <div className="rounded-2xl overflow-hidden h-[140px] md:h-[190px] group">
                <img src="/galeria/buhos-3.jpg" alt="Búhos UNILATINO" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
            </FadeUp>

            {/* Video 1 */}
            <FadeUp delay={0.16}>
              <div className="rounded-2xl overflow-hidden h-[140px] md:h-[190px] bg-black">
                <video
                  src="/galeria/buhos-video-1.mp4"
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              </div>
            </FadeUp>

            {/* Foto 4 */}
            <FadeUp delay={0.2}>
              <div className="rounded-2xl overflow-hidden h-[140px] md:h-[190px] group">
                <img src="/galeria/buhos-4.jpg" alt="Búhos UNILATINO" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── 7. INFRAESTRUCTURA ───────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <FadeUp className="mb-12">
            <p className="text-[#E6B400] text-[10px] font-black uppercase tracking-[0.3em] mb-3">Instalaciones</p>
            <h2 className="text-[#1B3070] font-black text-3xl md:text-5xl leading-tight tracking-tight mb-3">
              Espacios para crecer
            </h2>
            <p className="text-gray-400 text-base max-w-md leading-relaxed">
              Instalaciones diseñadas para la formación práctica y el desarrollo integral del estudiante.
            </p>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
            {INFRA.map((item, i) => (
              <FadeUp key={i} delay={i * 0.07}>
                <div className="rounded-2xl overflow-hidden group relative">
                  <div className="h-48 md:h-60 overflow-hidden">
                    <img
                      src={item.img}
                      alt={item.label}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <p className="text-white font-black text-base">{item.label}</p>
                    <p className="text-white/55 text-xs mt-0.5">{item.sub}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. UBICACIÓN ─────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-[#f8fafc] overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <FadeUp className="mb-10 md:text-left text-center">
            <p className="text-[#E6B400] text-[10px] font-black uppercase tracking-[0.3em] mb-3">Campus</p>
            <h2 className="text-[#1B3070] font-black text-3xl md:text-5xl leading-tight tracking-tight mb-3">
              Ubicación que te conecta con todo
            </h2>
            <p className="text-gray-500 text-base max-w-2xl leading-relaxed">
              Al norte de Mérida, a pasos del periférico, con acceso rápido, seguro y estratégico desde cualquier punto de la ciudad.
            </p>
            <p className="text-[#E6B400] text-sm font-bold mt-2">Fácil acceso, mayor comodidad para tu día a día.</p>
          </FadeUp>

          <FadeUp delay={0.15}>
            <div className="grid md:grid-cols-5 gap-6 items-stretch">
              {/* Map */}
              <div className="md:col-span-3 rounded-2xl overflow-hidden shadow-md border border-gray-200 transition-transform duration-500 hover:scale-[1.01]">
                <iframe
                  title="Ubicación Universidad Latino"
                  src="https://maps.google.com/maps?q=Universidad+Latino&ll=21.0279469,-89.5695554&z=16&output=embed"
                  width="100%"
                  height="380"
                  style={{ border: 0, display: 'block' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              {/* Info card */}
              <div className="md:col-span-2 bg-white rounded-[20px] p-8 shadow-md border border-gray-100 flex flex-col justify-center gap-6">
                <div>
                  <p className="text-[9px] font-black text-[#E6B400] uppercase tracking-widest mb-2">📍 Dirección</p>
                  <p className="font-black text-[#1B3070] text-sm leading-snug">Calle 7 Tablaje 15542 x 4 y 6</p>
                  <p className="text-gray-400 text-sm mt-1">Santa Rita Cholul, Mérida, Yucatán</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-[#E6B400] uppercase tracking-widest mb-2">📞 Teléfono</p>
                  <p className="text-gray-600 text-sm">999-943-5386 ext. 201, 204, 206</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-[#E6B400] uppercase tracking-widest mb-2">✉️ Email</p>
                  <p className="text-gray-600 text-sm">informes@universidadlatino.edu.mx</p>
                </div>
                <div className="flex flex-col gap-3 mt-1">
                  <a
                    href="https://maps.app.goo.gl/hfCMm2qLDH4DSY2W8"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#1B3070] text-white text-sm font-bold px-5 py-3.5 rounded-xl hover:bg-[#162660] hover:-translate-y-0.5 active:scale-95 transition-all shadow-sm"
                  >
                    Abrir en Google Maps
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a
                    href="https://maps.app.goo.gl/hfCMm2qLDH4DSY2W8"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 border-2 border-[#1B3070] text-[#1B3070] text-sm font-bold px-5 py-3 rounded-xl hover:bg-[#1B3070]/5 active:scale-95 transition-all"
                  >
                    Cómo llegar
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>


      {/* ── BACK TO TOP ──────────────────────────────────────────────────── */}
      <div className="flex justify-center py-10 bg-[#f8fafc]">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex flex-col items-center gap-1.5 text-[#1B3070]/40 hover:text-[#1B3070] transition-colors group"
          aria-label="Volver arriba"
        >
          <span className="w-10 h-10 rounded-full border-2 border-current flex items-center justify-center group-hover:-translate-y-1 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04L10.75 5.612V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
            </svg>
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Inicio</span>
        </button>
      </div>

    </div>
  )
}
