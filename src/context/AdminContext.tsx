import React, { createContext, useContext, useState, useCallback } from 'react'

// ─── Custom Values (editable from Admin Panel) ─────────────────────────────

export interface Banner {
  id: string
  imageUrl: string
  title: string
  subtitle?: string
  ctaText?: string
  ctaLink?: string
  active: boolean
}

export interface Career {
  id: string
  name: string
  area: string
  duration: string
  modality: 'presencial' | 'en-linea' | 'sabatina'
  description: string
  monthlyFee?: string
  enrollment?: string
  highlights?: string[]
  pdfUrl?: string
  active: boolean
}

export interface HeroContent {
  headline: string
  subheadline: string
  ctaText: string
  ctaLink: string
}

export interface CustomValues {
  banners: Banner[]
  hero: HeroContent
  careers: Career[]
  appName: string
  appTagline: string
  contactEmail: string
  contactPhone: string
  whatsappNumber: string
  address: string
}

// ─── Defaults ──────────────────────────────────────────────────────────────

const defaultCustomValues: CustomValues = {
  appName: 'Universidad Latino',
  appTagline: 'Educación que transforma',
  contactEmail: 'informes@universidadlatino.edu.mx',
  contactPhone: '999-322-6393',
  whatsappNumber: '+529991444478',
  address: 'Calle 7 Tablaje 15542 x 4 y 6, Santa Rita Cholul, Mérida, Yucatán',
  hero: {
    headline: 'Educación que transforma vidas',
    subheadline: 'Licenciaturas con RVOE avaladas por la SEP. Estudia en Mérida, Yucatán.',
    ctaText: 'Solicita tu beca',
    ctaLink: '/mi-beca',
  },
  banners: [
    {
      id: '1',
      imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80',
      title: 'Inscripciones Abiertas 2026',
      subtitle: 'Educación que transforma',
      ctaText: 'Ver carreras',
      ctaLink: '/carreras',
      active: true,
    },
    {
      id: '2',
      imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80',
      title: 'Becas disponibles ahora',
      subtitle: 'Hasta 80% de descuento',
      ctaText: 'Solicitar beca',
      ctaLink: '/mi-beca',
      active: true,
    },
  ],
  careers: [
    {
      id: '1',
      name: 'Licenciatura en Nutrición',
      area: 'Salud',
      duration: '4 años + S.S.',
      modality: 'presencial',
      monthlyFee: '$4,650/mes',
      enrollment: '$8,000',
      description: 'Profesional integral para evaluar, diseñar e implementar planes de alimentación personalizados en contextos clínicos, comunitarios, deportivos y empresariales.',
      highlights: ['Prácticas desde primeros semestres', 'Vinculación con SSA, DIF e IMSS', 'Docentes con experiencia clínica y docente'],
      active: true,
    },
    {
      id: '2',
      name: 'Licenciatura en Enfermería',
      area: 'Salud',
      duration: '4 años + S.S.',
      modality: 'presencial',
      monthlyFee: '$4,650/mes',
      enrollment: '$8,000',
      description: 'Profesional de la salud con formación para el cuidado integral del individuo, familia y comunidad, con prácticas en 9 instituciones de salud de Mérida.',
      highlights: ['Convenios con IMSS (8 unidades) y Hospital O\'Horán', 'Laboratorio equipado con incubadora y carro rojo', '70% docentes con Maestría, 60% con Especialidad'],
      active: true,
    },
    {
      id: '3',
      name: 'Licenciatura en Psicología',
      area: 'Salud',
      duration: '4 años + S.S.',
      modality: 'presencial',
      monthlyFee: '$4,650/mes',
      enrollment: '$8,000',
      description: 'Formación general en cuatro terminales: clínica, organizacional, educativa y comunitaria. Doble RVOE (estatal + federal). Único programa con idioma Maya en la malla.',
      highlights: ['Sala Gesell desde 1er semestre', 'Proceso terapéutico personal para titulación', 'Idioma Maya en malla curricular'],
      active: true,
    },
    {
      id: '4',
      name: 'Licenciatura en Derecho',
      area: 'Derecho',
      duration: '4 años',
      modality: 'presencial',
      monthlyFee: '$4,650/mes',
      enrollment: '$8,000',
      description: 'Formación teórica, práctica y ética en todas las ramas del derecho. 70% práctica desde el primer cuatrimestre, con asistencia a juicios reales.',
      highlights: ['Juicios reales desde 1er cuatrimestre', '50%+ docentes con doctorado', 'Clínicas de oralidad, criminología y forense'],
      active: true,
    },
    {
      id: '5',
      name: 'Licenciatura en Derecho (Online)',
      area: 'Derecho',
      duration: '3 años',
      modality: 'en-linea',
      monthlyFee: '$1,980/mes',
      enrollment: '$3,600',
      description: 'Mismo título que la modalidad presencial con validez oficial SEP. Clases en vivo martes y jueves 20:00–22:00 hrs. Ideal para quienes trabajan.',
      highlights: ['Clases en vivo + grabadas', '57% más económica que presencial', 'Sin eventos presenciales obligatorios'],
      active: true,
    },
    {
      id: '6',
      name: 'Lic. en Negocios Internacionales',
      area: 'Negocios',
      duration: '3 años 4 meses',
      modality: 'presencial',
      monthlyFee: '$4,650/mes',
      enrollment: '$8,000',
      description: 'Gestión de operaciones comerciales globales: comercio exterior, logística, cadena de suministro y negociación intercultural. Formación trilingüe (inglés, francés y mandarín).',
      highlights: ['Formación trilingüe: inglés + francés + mandarín', 'Clasificación arancelaria y aduanas', 'Visión estratégica global'],
      active: true,
    },
    {
      id: '7',
      name: 'Lic. en Ventas y Mercadotecnia',
      area: 'Negocios',
      duration: '3 años 4 meses',
      modality: 'presencial',
      monthlyFee: '$4,650/mes',
      enrollment: '$8,000',
      description: 'Profesional creativo y estratégico para diseñar e implementar estrategias de comercialización. Domina marketing digital, redes sociales y diseño audiovisual.',
      highlights: ['Marketing digital y redes sociales', 'Manejo de software de diseño y audiovisual', 'Inglés aplicado a mercadotecnia'],
      active: true,
    },
    {
      id: '8',
      name: 'Lic. en Ventas y Mercadotecnia (Online)',
      area: 'Negocios',
      duration: '3 años',
      modality: 'en-linea',
      monthlyFee: '$1,980/mes',
      enrollment: '$3,600',
      description: 'Marketing digital, big data, ventas online/offline e investigación de mercados. Modalidad 100% en línea — estudiar marketing en línea te prepara para el marketing digital.',
      highlights: ['Plan actualizado al mercado real', '57% más económica que presencial', 'Flexibilidad para estudiar y trabajar'],
      active: true,
    },
    {
      id: '9',
      name: 'Licenciatura en Gastronomía',
      area: 'Gastronomía',
      duration: '4 años',
      modality: 'presencial',
      monthlyFee: '$4,650/mes',
      enrollment: '$8,000',
      description: 'Arte culinario con técnicas modernas, enología, mixología y gestión gastronómica. Intercambios internacionales a 7 países. Prácticas con empresas como Hotel Fiesta Americana y Hacienda Chablé.',
      highlights: ['Intercambios a 7 países (España, Francia, Australia...)', 'Prácticas profesionales en el extranjero', 'Pioneros en tecnología de alimentos'],
      active: true,
    },
    {
      id: '10',
      name: 'Ingeniería en Sistemas Computacionales',
      area: 'Tecnología',
      duration: '3 años 8 meses',
      modality: 'presencial',
      monthlyFee: '$4,650/mes',
      enrollment: '$8,000',
      description: 'Desarrolla 12 proyectos reales: ciberseguridad, IA, apps móviles, robótica y más. Participación en NASA Space Apps Challenge. 6 lenguajes de programación.',
      highlights: ['12 proyectos reales durante la carrera', 'NASA International Space Apps Challenge', '2 laboratorios: cómputo y robótica'],
      active: true,
    },
    {
      id: '11',
      name: 'Licenciatura en Administración (Sabatina)',
      area: 'Negocios',
      duration: '3 años',
      modality: 'sabatina',
      monthlyFee: '$3,960/mes',
      enrollment: '$3,600',
      description: 'Gestión organizacional integral solo los sábados 8:00–13:00 hrs. Ideal para profesionales que trabajan y quieren obtener su título mientras aplican lo aprendido.',
      highlights: ['Solo sábados 8:00–13:00 hrs', 'Mismo título que presencial y online', '15% más económica que presencial'],
      active: true,
    },
    {
      id: '12',
      name: 'Lic. en Administración y Desarrollo Empresarial (Online)',
      area: 'Negocios',
      duration: '3 años',
      modality: 'en-linea',
      monthlyFee: '$1,980/mes',
      enrollment: '$3,600',
      description: 'Administración estratégica, finanzas, mercadotecnia digital y marco legal empresarial. 100% en línea, con inglés aplicado a negocios. 57% más económica que presencial.',
      highlights: ['Negocios digitales y tecnología', 'Inglés aplicado a administración', 'Modalidad 100% en línea flexible'],
      active: true,
    },
  ],
}

// ─── Context ───────────────────────────────────────────────────────────────

interface AdminContextType {
  values: CustomValues
  updateValues: (patch: Partial<CustomValues>) => void
  updateHero: (hero: Partial<HeroContent>) => void
  updateBanner: (id: string, patch: Partial<Banner>) => void
  addBanner: (banner: Omit<Banner, 'id'>) => void
  removeBanner: (id: string) => void
  updateCareer: (id: string, patch: Partial<Career>) => void
  addCareer: (career: Omit<Career, 'id'>) => void
  removeCareer: (id: string) => void
  isAdminMode: boolean
  setIsAdminMode: (v: boolean) => void
}

const AdminContext = createContext<AdminContextType | null>(null)

// ─── Provider ──────────────────────────────────────────────────────────────

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [values, setValues] = useState<CustomValues>(() => {
    try {
      const saved = localStorage.getItem('ul_custom_values')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.whatsappNumber === '+529993226393') {
          parsed.whatsappNumber = defaultCustomValues.whatsappNumber
        }
        return { ...defaultCustomValues, ...parsed, careers: defaultCustomValues.careers }
      }
      return defaultCustomValues
    } catch {
      return defaultCustomValues
    }
  })
  const [isAdminMode, setIsAdminMode] = useState(false)

  const persist = useCallback((next: CustomValues) => {
    setValues(next)
    localStorage.setItem('ul_custom_values', JSON.stringify(next))
  }, [])

  const updateValues = useCallback(
    (patch: Partial<CustomValues>) => persist({ ...values, ...patch }),
    [values, persist]
  )

  const updateHero = useCallback(
    (hero: Partial<HeroContent>) => persist({ ...values, hero: { ...values.hero, ...hero } }),
    [values, persist]
  )

  const updateBanner = useCallback(
    (id: string, patch: Partial<Banner>) =>
      persist({
        ...values,
        banners: values.banners.map((b) => (b.id === id ? { ...b, ...patch } : b)),
      }),
    [values, persist]
  )

  const addBanner = useCallback(
    (banner: Omit<Banner, 'id'>) =>
      persist({
        ...values,
        banners: [...values.banners, { ...banner, id: Date.now().toString() }],
      }),
    [values, persist]
  )

  const removeBanner = useCallback(
    (id: string) => persist({ ...values, banners: values.banners.filter((b) => b.id !== id) }),
    [values, persist]
  )

  const updateCareer = useCallback(
    (id: string, patch: Partial<Career>) =>
      persist({
        ...values,
        careers: values.careers.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      }),
    [values, persist]
  )

  const addCareer = useCallback(
    (career: Omit<Career, 'id'>) =>
      persist({
        ...values,
        careers: [...values.careers, { ...career, id: Date.now().toString() }],
      }),
    [values, persist]
  )

  const removeCareer = useCallback(
    (id: string) =>
      persist({ ...values, careers: values.careers.filter((c) => c.id !== id) }),
    [values, persist]
  )

  return (
    <AdminContext.Provider
      value={{
        values,
        updateValues,
        updateHero,
        updateBanner,
        addBanner,
        removeBanner,
        updateCareer,
        addCareer,
        removeCareer,
        isAdminMode,
        setIsAdminMode,
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider')
  return ctx
}
