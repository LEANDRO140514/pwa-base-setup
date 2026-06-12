import { useRef, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAdmin } from '@/context/AdminContext'
import { useTestModal } from '@/context/TestModalContext'
import type { Career } from '@/context/AdminContext'

// ─── Scroll-reveal hook ───────────────────────────────────────────────────────

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true) },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

function FadeUp({ children, delay = 0, className = '' }: {
  children: React.ReactNode; delay?: number; className?: string
}) {
  const { ref, inView } = useInView()
  return (
    <div ref={ref} className={className} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(32px)',
      transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
    }}>
      {children}
    </div>
  )
}

// ─── Area + benefit content ───────────────────────────────────────────────────

const AREA_META: Record<string, { img: string }> = {
  'Derecho':     { img: 'http://154.38.173.239:8002/dis-derecho.webp' },
  'Salud':       { img: 'http://154.38.173.239:8002/dis-salud.webp' },
  'Negocios':    { img: 'http://154.38.173.239:8002/dis-negocios.webp' },
  'Gastronomía': { img: 'http://154.38.173.239:8002/dis-gastronomia.webp' },
  'Tecnología':  { img: 'http://154.38.173.239:8002/dis-tecnologia.webp' },
}

// ─── Career-specific images (one per career, different from area images) ──────

const CAREER_IMG: Record<string, string> = {
  'Licenciatura en Derecho':                      'http://154.38.173.239:8001/01_derecho.webp',
  'Licenciatura en Derecho (Online)':             'http://154.38.173.239:8001/02_derecho_online.webp',
  'Licenciatura en Psicología':                   'http://154.38.173.239:8001/03_psicologia.webp',
  'Licenciatura en Enfermería':                   'http://154.38.173.239:8001/04_enfermeria.webp',
  'Licenciatura en Nutrición':                    'http://154.38.173.239:8001/05_nutricion.webp',
  'Lic. en Negocios Internacionales':             'http://154.38.173.239:8001/06_negocios_internacionales.webp',
  'Lic. en Ventas y Mercadotecnia':               'http://154.38.173.239:8001/07_ventas_mercadotecnia.webp',
  'Lic. en Ventas y Mercadotecnia (Online)':      'http://154.38.173.239:8001/08_ventas_mercadotecnia_online.webp',
  'Licenciatura en Gastronomía':                  'http://154.38.173.239:8001/12_gastronomia.webp',
  'Ingeniería en Sistemas Computacionales':        'http://154.38.173.239:8001/11_ingenieria_sistemas.webp',
  'Licenciatura en Administración (Sabatina)':     'http://154.38.173.239:8001/09_administracion_sabatina.webp',
  'Lic. en Administración y Desarrollo Empresarial (Online)': 'http://154.38.173.239:8001/10_administracion_online.webp',
}
const AREAS = ['Derecho', 'Salud', 'Negocios', 'Gastronomía', 'Tecnología']

const BENEFITS = [
  { title: 'Validez SEP',          desc: 'Títulos con RVOE reconocidos oficialmente por la Secretaría de Educación Pública.',      img: 'http://154.38.173.239:8002/validez-sep.webp' },
  { title: 'Ubicación',            desc: 'Campus en el norte de Mérida, la zona de mayor plusvalía y crecimiento de la ciudad, cerca de todo.', img: 'http://154.38.173.239:8002/ubicacion.webp' },
  { title: 'Empleabilidad',        desc: 'Programas diseñados junto al sector empresarial del sureste mexicano.',                   img: 'http://154.38.173.239:8002/empleabilidad.webp' },
  { title: 'Prácticas reales',     desc: 'Laboratorios, clínicas y empresas aliadas para aprendizaje práctico desde el primer año.',img: 'http://154.38.173.239:8002/practicas-reales.webp' },
  { title: 'Internacionalización', desc: 'Convenios con instituciones extranjeras y movilidad estudiantil internacional.',          img: 'http://154.38.173.239:8002/internacionalizacion.webp' },
  { title: 'Tecnología educativa', desc: 'Plataformas digitales, aulas virtuales y herramientas de IA integradas al aprendizaje.',  img: 'http://154.38.173.239:8002/tecnologia-educativa.webp' },
]

const MODALITY_LABELS: Record<string, string> = {
  presencial: 'Presencial',
  'en-linea': 'En Línea',
  sabatina: 'Sabatina',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Inicio() {
  const { values } = useAdmin()
  const navigate = useNavigate()
  const { openTest } = useTestModal()
  const waNumber = (values.whatsappNumber || '+529996442662').replace(/\D/g, '')

  const [selectedArea, setSelectedArea] = useState<string | null>(null)
  const careersRef = useRef<HTMLDivElement>(null)

  const activeCareersList = values.careers.filter((c) => c.active)
  const filteredCareers = selectedArea
    ? activeCareersList.filter((c) => c.area === selectedArea)
    : activeCareersList

  function handleAreaClick(area: string) {
    const next = selectedArea === area ? null : area
    setSelectedArea(next)
    // Scroll to careers section after state update
    setTimeout(() => {
      careersRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
  }

  function handleCareerClick(career: Career) {
    navigate(`/carrera/${career.id}`)
  }

  return (
    <div className="flex flex-col bg-white overflow-x-hidden">

      {/* ── S1: CINEMATIC INTRO ─────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center h-screen bg-[#06090f] overflow-hidden">
        {/* Background image with dark overlay */}
        <div className="absolute inset-0">
          <img src="/portada-unilatino.jpg" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(27,48,112,0.5) 0%, transparent 68%)', animation: 'cinePulse 7s ease-in-out infinite' }} />
        </div>
        <div className="relative z-10 flex flex-col items-center text-center px-8" style={{ animation: 'fadeUp 1s ease 0.3s both' }}>
          <p className="text-[#E6B400] text-xs font-black uppercase tracking-[0.45em] mb-3">{values.appName}</p>
          <p className="text-white/70 text-sm tracking-widest">Mérida, Yucatán · Desde 1987</p>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3" style={{ animation: 'fadeUp 1s ease 1.1s both' }}>
          <span className="text-white/20 text-[10px] uppercase tracking-[0.3em]">Explorar</span>
          <div className="w-px h-14 bg-gradient-to-b from-white/25 to-transparent" style={{ animation: 'scrollLine 2.2s ease-in-out infinite' }} />
        </div>
      </section>

      {/* ── S2: HERO PRINCIPAL ──────────────────────────────────────────────── */}
      <section className="relative flex items-end min-h-screen overflow-hidden bg-[#1B3070]">
        <img src="/aulas.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <video autoPlay muted loop playsInline preload="none"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0, transition: 'opacity 1.5s ease' }}
          onCanPlay={(e) => { (e.target as HTMLVideoElement).style.opacity = '1' }}>
          <source src="https://videos.pexels.com/video-files/3195394/3195394-hd_1280_720_25fps.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#06090f]/65 via-transparent to-transparent" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-8 md:px-16 pb-20 md:pb-28 pt-32">
          <p className="text-[#E6B400] text-[10px] md:text-xs font-black uppercase tracking-[0.35em] mb-6" style={{ animation: 'fadeUp 0.7s ease 0.1s both' }}>
            Universidad Latino · Mérida, Yucatán
          </p>
          <h1 className="text-white font-black text-[2.6rem] md:text-[4.5rem] lg:text-[5.5rem] leading-[0.95] tracking-tight mb-6 max-w-3xl" style={{ animation: 'fadeUp 0.7s ease 0.2s both' }}>
            Forma parte de<br />los líderes del<br />mañana
          </h1>
          <p className="text-white/60 text-base md:text-lg leading-relaxed mb-10 max-w-lg" style={{ animation: 'fadeUp 0.7s ease 0.35s both' }}>
            Licenciaturas con RVOE avaladas por la SEP. Descubre tu vocación con inteligencia artificial.
          </p>
          <div className="flex flex-col sm:flex-row gap-4" style={{ animation: 'fadeUp 0.7s ease 0.45s both' }}>
            <button onClick={openTest}
              className="inline-flex items-center gap-2 bg-[#E6B400] text-[#1B3070] font-black px-8 py-4 rounded-full text-sm shadow-[0_8px_30px_rgba(230,180,0,0.4)] hover:brightness-105 hover:shadow-[0_12px_40px_rgba(230,180,0,0.55)] hover:scale-[1.02] active:scale-95 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0">
                <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              Iniciar Test Vocacional
            </button>
            <Link to="/carreras"
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white font-bold px-8 py-4 rounded-full text-sm border border-white/25 hover:bg-white/20 hover:scale-[1.02] active:scale-95 transition-all">
              Explorar Carreras
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0">
                <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── S3: ÁREAS DE CONOCIMIENTO ───────────────────────────────────────── */}
      <section className="py-24 md:py-32 bg-white px-6 md:px-16">
        <FadeUp className="max-w-7xl mx-auto mb-14">
          <p className="text-[#E6B400] text-xs font-black uppercase tracking-[0.3em] mb-4">Áreas de Conocimiento</p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h2 className="text-[#1B3070] font-black text-3xl md:text-5xl tracking-tight leading-tight max-w-md">
              Cinco disciplinas.<br />Un solo destino.
            </h2>
            <p className="text-gray-400 text-sm md:text-base max-w-xs">Selecciona un área para filtrar los programas académicos.</p>
          </div>
        </FadeUp>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {AREAS.slice(0, 3).map((area, i) => (
              <AreaCard key={area} area={area} delay={i * 80}
                isSelected={selectedArea === area}
                onClick={() => handleAreaClick(area)} />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:max-w-[66.7%] md:mx-auto">
            {AREAS.slice(3).map((area, i) => (
              <AreaCard key={area} area={area} delay={(i + 3) * 80}
                isSelected={selectedArea === area}
                onClick={() => handleAreaClick(area)} />
            ))}
          </div>
        </div>
      </section>

      {/* ── S4: POR QUÉ UNIVERSIDAD LATINO ─────────────────────────────────── */}
      <section className="py-24 md:py-32 bg-[#06090f] px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          <FadeUp className="mb-14">
            <p className="text-[#E6B400] text-xs font-black uppercase tracking-[0.3em] mb-4">Por qué elegirnos</p>
            <h2 className="text-white font-black text-3xl md:text-5xl tracking-tight leading-tight max-w-xl">
              Una educación diseñada<br />para el mundo real.
            </h2>
          </FadeUp>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {BENEFITS.map((b, i) => (
              <FadeUp key={b.title} delay={i * 70}>
                <BenefitCard title={b.title} desc={b.desc} img={b.img} />
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── S5: PROGRAMAS ACADÉMICOS ────────────────────────────────────────── */}
      <section className="py-24 md:py-32 bg-white px-6 md:px-16" ref={careersRef}>
        <div className="max-w-7xl mx-auto">
          <FadeUp>
            <p className="text-[#E6B400] text-xs font-black uppercase tracking-[0.3em] mb-4">Programas Académicos</p>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 gap-4">
              <h2 className="text-[#1B3070] font-black text-3xl md:text-5xl tracking-tight leading-tight max-w-xl">
                {filteredCareers.length} {selectedArea ? `${selectedArea.toLowerCase()}` : 'carreras'}.<br />Una decisión.
              </h2>
              <Link to="/carreras" className="text-[#1B3070] font-bold text-sm border-b-2 border-[#E6B400] pb-0.5 hover:opacity-70 transition-opacity self-start md:self-auto">
                Ver catálogo completo →
              </Link>
            </div>

            {/* Active filter chip */}
            {selectedArea && (
              <div className="flex items-center gap-3 mb-8">
                <span className="flex items-center gap-2 bg-[#1B3070] text-white text-xs font-bold px-4 py-2 rounded-full">
                  {selectedArea}
                  <button onClick={() => setSelectedArea(null)} className="text-white/60 hover:text-white ml-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                      <path d="M5.28 4.22a.75.75 0 00-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 101.06 1.06L8 9.06l2.72 2.72a.75.75 0 101.06-1.06L9.06 8l2.72-2.72a.75.75 0 00-1.06-1.06L8 6.94 5.28 4.22z" />
                    </svg>
                  </button>
                </span>
                <button onClick={() => setSelectedArea(null)} className="text-gray-400 text-xs hover:text-gray-600 transition-colors">
                  Mostrar todas
                </button>
              </div>
            )}
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCareers.map((career, i) => (
              <CareerCard key={career.id} career={career} delay={i * 50} onClick={() => handleCareerClick(career)} />
            ))}
          </div>
        </div>
      </section>

      {/* ── S6: BLOQUE DE CONVERSIÓN ────────────────────────────────────────── */}
      <section className="relative flex items-center min-h-[60vh] overflow-hidden">
        <img src="/inscripciones-bg.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#06090f]/95 via-[#06090f]/75 to-[#06090f]/30" />
        <FadeUp className="relative z-10 w-full max-w-7xl mx-auto px-8 md:px-16 py-20">
          <p className="text-[#E6B400] text-xs font-black uppercase tracking-[0.35em] mb-5">Inscripciones Abiertas</p>
          <h2 className="text-white font-black text-[2.2rem] md:text-[3.5rem] leading-tight tracking-tight mb-4 max-w-lg">
            Próxima generación<br />1 de septiembre 2026
          </h2>
          <p className="text-white/50 text-base mb-10 max-w-sm">Cupos limitados. Asegura tu lugar y accede al mejor plan de beca.</p>
          <a href={`https://wa.me/${waNumber}?text=Hola%2C%20quiero%20iniciar%20mi%20proceso%20de%20inscripción%20en%20Universidad%20Latino.`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#E6B400] text-[#1B3070] font-black px-8 py-4 rounded-full text-sm shadow-[0_8px_30px_rgba(230,180,0,0.4)] hover:brightness-105 hover:scale-[1.02] active:scale-95 transition-all">
            Iniciar proceso
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0">
              <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
            </svg>
          </a>
        </FadeUp>
      </section>

      {/* ── S7: UBICACIÓN ───────────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 bg-white px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          <FadeUp className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <p className="text-[#E6B400] text-xs font-black uppercase tracking-[0.3em]">Encuéntranos</p>
            </div>
            <h2 className="text-[#1B3070] font-black text-3xl md:text-4xl tracking-tight leading-tight mb-3">
              Ubicación privilegiada<br />en el norte de Mérida
            </h2>
            <p className="text-gray-500 text-base max-w-xl leading-relaxed">
              A pasos del periférico, cerca de Altabrisa, hospitales y las principales zonas comerciales. Conectividad total para tu día a día.
            </p>
          </FadeUp>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
            <div className="lg:col-span-3 rounded-2xl overflow-hidden shadow-xl h-80 lg:h-96 ring-1 ring-black/5">
              <iframe title="Universidad Latino"
                src="https://maps.google.com/maps?q=Universidad+Latino&ll=21.0279469,-89.5695554&z=16&output=embed"
                className="w-full h-full border-0" loading="lazy" />
            </div>
            <div className="lg:col-span-2 flex flex-col gap-6 pt-2">
              {[
                { icon: 'M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z', label: 'Dirección', value: values.address || 'Calle 7 Tablaje 15542 x 4 y 6, Santa Rita Cholul, Mérida, Yucatán' },
                { icon: 'M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z', label: 'Teléfono', value: values.contactPhone || '999-943-5386', href: `tel:${(values.contactPhone || '9999435386').replace(/\D/g, '')}` },
                { icon: 'M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75', label: 'Correo', value: values.contactEmail || 'informes@universidadlatino.edu.mx', href: `mailto:${values.contactEmail}` },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#f0f4fc] flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#1B3070" strokeWidth={1.8} className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-0.5">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="text-[#1B3070] font-semibold text-sm hover:underline">{item.value}</a>
                    ) : (
                      <p className="text-[#1B3070] font-semibold text-sm">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
              <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-2xl border border-[#25D366]/30 bg-[#f0fdf4] hover:bg-[#dcfce7] transition-colors">
                <svg viewBox="0 0 24 24" fill="#25D366" className="w-5 h-5 flex-shrink-0">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <div>
                  <p className="text-[#16a34a] font-bold text-sm">WhatsApp</p>
                  <p className="text-gray-500 text-xs">+52 999 644 2662</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── S8: FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="bg-[#06090f] text-white px-6 md:px-16 pt-16 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo-escudo.png" alt="" className="w-10 h-10 object-contain opacity-90" />
                <span className="font-black text-sm tracking-tight leading-tight">{values.appName}</span>
              </div>
              <p className="text-white/40 text-sm leading-relaxed mb-5">Educación de calidad con RVOE SEP.<br />Formando líderes desde 1987.</p>
              <div className="flex gap-3">
                {[
                  { href: 'https://instagram.com/universidadlatino', d: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' },
                  { href: 'https://facebook.com/universidadlatino', d: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
                ].map((soc, i) => (
                  <a key={i} href={soc.href} target="_blank" rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#1B3070] flex items-center justify-center transition-colors">
                    <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4"><path d={soc.d} /></svg>
                  </a>
                ))}
              </div>
            </div>
            <div>
              <p className="text-white/30 text-xs font-black uppercase tracking-[0.2em] mb-4">Carreras</p>
              <ul className="space-y-2.5">
                {AREAS.map((a) => (
                  <li key={a}><Link to="/carreras" className="text-white/50 text-sm hover:text-white transition-colors">{a}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-white/30 text-xs font-black uppercase tracking-[0.2em] mb-4">Admisiones</p>
              <ul className="space-y-2.5">
                {[
                  { label: 'Proceso de admisión', to: '/carreras' },
                  { label: 'Becas disponibles', to: '/mi-beca' },
                  { label: 'Test Vocacional', action: 'test' },
                  { label: 'Eva IA', to: '/eva-ia' },
                  { label: 'La Universidad', to: '/universidad' },
                ].map((item) => (
                  <li key={item.label}>
                    {item.action === 'test'
                      ? <button onClick={openTest} className="text-white/50 text-sm hover:text-white transition-colors text-left">{item.label}</button>
                      : <Link to={item.to!} className="text-white/50 text-sm hover:text-white transition-colors">{item.label}</Link>
                    }
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-white/30 text-xs font-black uppercase tracking-[0.2em] mb-4">Contacto</p>
              <ul className="space-y-3">
                <li className="text-white/50 text-sm leading-snug">{values.address || 'Calle 7 Tablaje 15542, Santa Rita Cholul, Mérida, Yuc.'}</li>
                <li><a href={`tel:${(values.contactPhone || '9999435386').replace(/\D/g, '')}`} className="text-white/50 text-sm hover:text-white transition-colors">{values.contactPhone || '999-943-5386'}</a></li>
                <li><a href={`mailto:${values.contactEmail}`} className="text-white/50 text-sm hover:text-white transition-colors">{values.contactEmail}</a></li>
              </ul>
            </div>
          </div>
          <div className="flex justify-center pt-2 pb-6">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex flex-col items-center gap-1.5 text-white/25 hover:text-white/70 transition-colors group"
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
          <div className="border-t border-white/8 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-white/20 text-xs">© 2026 {values.appName}. Todos los derechos reservados. · RVOE SEP</p>
            <p className="text-white/15 text-xs">{values.appTagline}</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cinePulse {
          0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
          50%       { opacity: 0.9; transform: translate(-50%, -50%) scale(1.12); }
        }
        @keyframes scrollLine {
          0%   { transform: scaleY(0); transform-origin: top; opacity: 1; }
          60%  { transform: scaleY(1); transform-origin: top; opacity: 1; }
          100% { transform: scaleY(1); transform-origin: bottom; opacity: 0; }
        }
      `}</style>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function AreaCard({ area, delay, isSelected, onClick }: {
  area: string; delay: number; isSelected: boolean; onClick: () => void
}) {
  const meta = AREA_META[area]
  if (!meta) return null
  return (
    <FadeUp delay={delay}>
      <div
        onClick={onClick}
        className={`relative group overflow-hidden rounded-2xl aspect-[4/3] cursor-pointer bg-gray-900 transition-all duration-300
          ${isSelected ? 'ring-3 ring-[#E6B400] shadow-[0_0_0_3px_#E6B400]' : 'hover:shadow-2xl'}`}
      >
        <img src={meta.img} alt={area} loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className={`absolute inset-0 transition-all duration-500 ${
          isSelected
            ? 'bg-[#1B3070]/75'
            : 'bg-gradient-to-t from-black/75 via-black/20 to-transparent group-hover:from-[#1B3070]/75 group-hover:via-[#1B3070]/25'
        }`} />
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          {isSelected && (
            <span className="absolute top-4 right-4 bg-[#E6B400] text-[#1B3070] text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide">
              Activa
            </span>
          )}
          <p className="text-white font-black text-2xl tracking-tight drop-shadow-lg">{area}</p>
          <p className={`text-xs font-semibold mt-1.5 transition-all duration-300 ${
            isSelected ? 'text-[#E6B400]' : 'text-white/0 group-hover:text-white/70 translate-y-2 group-hover:translate-y-0'
          }`}>
            {isSelected ? '✓ Filtrando carreras' : 'Ver programas →'}
          </p>
        </div>
      </div>
    </FadeUp>
  )
}

function BenefitCard({ title, desc, img }: { title: string; desc: string; img: string }) {
  return (
    <div className="relative group overflow-hidden rounded-2xl aspect-[4/3] bg-gray-900 cursor-default">
      <img src={img} alt={title} loading="lazy"
        className="absolute inset-0 w-full h-full object-contain transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-end p-6">
        <h3 className="text-white font-black text-xl tracking-tight mb-2 transition-transform duration-300 group-hover:translate-y-0">{title}</h3>
        <p className="text-white/60 text-sm leading-relaxed max-h-0 overflow-hidden group-hover:max-h-20 transition-all duration-500 group-hover:text-white/80">
          {desc}
        </p>
      </div>
    </div>
  )
}

function CareerCard({ career, delay, onClick }: { career: Career; delay: number; onClick: () => void }) {
  const img = CAREER_IMG[career.name] ?? AREA_META[career.area]?.img ?? AREA_META['Negocios'].img
  return (
    <FadeUp delay={delay}>
      <div onClick={onClick}
        className="relative group overflow-hidden rounded-2xl aspect-[4/5] cursor-pointer bg-gray-900 hover:shadow-2xl transition-shadow duration-300">
        <img src={img} alt={career.name} loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent group-hover:from-[#1B3070]/90 group-hover:via-[#1B3070]/45 transition-all duration-500" />
        <div className="absolute top-4 left-4">
          <span className="bg-[#E6B400] text-[#1B3070] text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide">
            Hasta 50% beca
          </span>
        </div>
        <div className="absolute top-4 right-4">
          <span className="bg-white/15 backdrop-blur text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
            {MODALITY_LABELS[career.modality] ?? career.modality}
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="text-white/55 text-[10px] font-semibold uppercase tracking-wider mb-1.5">{career.area}</p>
          <h3 className="text-white font-black text-base leading-tight mb-3">{career.name}</h3>
          <div className="flex items-center gap-2 text-[#E6B400] text-xs font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <span>Ver programa</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
    </FadeUp>
  )
}
