import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAdmin } from '@/context/AdminContext'
import type { Career } from '@/context/AdminContext'
import { supabase } from '@/lib/supabase'

function formatPrice(price: string | number | null | undefined, suffix = '/mes'): string | undefined {
  if (price === null || price === undefined || price === '') return undefined
  const str = String(price).trim()
  if (str.includes('$')) return str
  const num = parseFloat(str.replace(/,/g, ''))
  if (isNaN(num)) return str
  return `$${num.toLocaleString('es-MX')}${suffix}`
}

function normalizeModality(m: string): Career['modality'] {
  const map: Record<string, Career['modality']> = {
    'Presencial': 'presencial', 'presencial': 'presencial',
    'En línea': 'en-linea', 'En Línea': 'en-linea', 'en-linea': 'en-linea',
    'Sabatina': 'sabatina', 'sabatina': 'sabatina',
  }
  return map[m] ?? 'presencial'
}

// ─── Area content maps ────────────────────────────────────────────────────────

const AREA_IMG: Record<string, string> = {
  'Derecho':     'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1600&q=80&fit=crop',
  'Salud':       'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1600&q=80&fit=crop',
  'Negocios':    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1600&q=80&fit=crop',
  'Gastronomía': 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=1600&q=80&fit=crop',
  'Tecnología':  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80&fit=crop',
}

const GRAD_PROFILE: Record<string, string[]> = {
  'Derecho':     [
    'Defiendes derechos con argumentos sólidos y ética profesional',
    'Dominas el sistema jurídico nacional e internacional',
    'Representas a personas y empresas en procesos legales complejos',
    'Asesoras con criterio en materia civil, penal, mercantil y más',
  ],
  'Salud':       [
    'Transformas vidas con atención clínica de calidad',
    'Aplicas protocolos científicos actualizados con precisión',
    'Trabajas en equipo multidisciplinario con liderazgo',
    'Generas impacto real en la salud pública de tu comunidad',
  ],
  'Negocios':    [
    'Tomas decisiones estratégicas que mueven empresas hacia adelante',
    'Líderas equipos en entornos nacionales e internacionales',
    'Analizas mercados y diseñas planes de crecimiento rentables',
    'Dominas herramientas digitales, finanzas y marketing moderno',
  ],
  'Gastronomía': [
    'Creas experiencias culinarias que sorprenden y fidelizan',
    'Gestionas cocinas y restaurantes con eficiencia y creatividad',
    'Dominas técnicas nacionales e internacionales de alto nivel',
    'Emprendes en el sector food con visión empresarial sólida',
  ],
  'Tecnología':  [
    'Diseñas sistemas que resuelven problemas reales del mundo',
    'Desarrollas aplicaciones seguras en múltiples lenguajes',
    'Lideras proyectos de innovación con IA, cloud y ciberseguridad',
    'Te adaptas continuamente a tecnologías emergentes con agilidad',
  ],
}

const JOB_FIELDS: Record<string, { label: string; icon: string }[]> = {
  'Derecho': [
    { label: 'Despachos jurídicos y notarías',           icon: 'building' },
    { label: 'Poder Judicial y Ministerio Público',      icon: 'gavel' },
    { label: 'Asesoría jurídica empresarial',            icon: 'briefcase' },
    { label: 'Defensoría pública y derechos humanos',    icon: 'shield' },
    { label: 'Docencia e investigación jurídica',        icon: 'book' },
  ],
  'Salud': [
    { label: 'Hospitales y clínicas públicas y privadas', icon: 'hospital' },
    { label: 'Consultorios y práctica independiente',    icon: 'stethoscope' },
    { label: 'Programas de salud pública',               icon: 'heart' },
    { label: 'Investigación biomédica y docencia',       icon: 'book' },
    { label: 'Organismos internacionales de salud',      icon: 'globe' },
  ],
  'Negocios': [
    { label: 'Empresas nacionales e internacionales',    icon: 'building' },
    { label: 'Consultoras y despachos de negocios',      icon: 'briefcase' },
    { label: 'Emprendimiento y startups',                icon: 'rocket' },
    { label: 'Sector bancario y financiero',             icon: 'bank' },
    { label: 'Comercio exterior y logística',            icon: 'globe' },
  ],
  'Gastronomía': [
    { label: 'Restaurantes y hoteles de alta categoría', icon: 'star' },
    { label: 'Industria alimentaria y manufactura',      icon: 'building' },
    { label: 'Catering, eventos y banquetes',            icon: 'cake' },
    { label: 'Consultoría gastronómica',                 icon: 'briefcase' },
    { label: 'Emprendimiento y restaurantes propios',    icon: 'rocket' },
  ],
  'Tecnología': [
    { label: 'Empresas de software y telecomunicaciones', icon: 'code' },
    { label: 'Sector bancario y fintech',                icon: 'bank' },
    { label: 'Gobierno y sector público digital',        icon: 'building' },
    { label: 'Consultoras de tecnología e innovación',   icon: 'briefcase' },
    { label: 'Emprendimiento tecnológico',               icon: 'rocket' },
  ],
}

const IDEAL_PROFILE: Record<string, string[]> = {
  'Derecho':     [
    'Te apasiona la justicia y defender los derechos de las personas',
    'Disfrutas argumentar, debatir y resolver conflictos con lógica',
    'Eres analítico/a y no te intimidan los textos complejos',
    'Quieres ejercer como abogado/a, notario/a, juez o asesor',
    'Buscas una carrera con alta demanda y proyección profesional',
  ],
  'Salud':       [
    'Sientes vocación por cuidar y mejorar la vida de las personas',
    'No te incomoda el ambiente clínico ni trabajar bajo presión',
    'Eres empático/a, responsable y comprometido/a con el bienestar',
    'Quieres hacer una diferencia real en la salud pública',
    'Buscas una carrera con trabajo garantizado y gran impacto social',
  ],
  'Negocios':    [
    'Tienes visión para los negocios y te gustan los retos estratégicos',
    'Eres ambicioso/a y quieres crecer profesional y económicamente',
    'Sabes trabajar en equipo y liderar con resultados',
    'Te interesan las finanzas, el marketing o el comercio exterior',
    'Quieres emprender tu propio negocio o dirigir empresas',
  ],
  'Gastronomía': [
    'La cocina es tu pasión y quieres convertirla en profesión',
    'Eres creativo/a, detallista y te encanta experimentar sabores',
    'Disfrutas crear experiencias únicas para quienes te rodean',
    'Quieres trabajar en hoteles, restaurantes o tener el tuyo propio',
    'Buscas una carrera con proyección internacional',
  ],
  'Tecnología':  [
    'Te fascina la tecnología y cómo soluciona problemas reales',
    'Eres curioso/a, lógico/a y te encanta aprender lenguajes nuevos',
    'Quieres construir apps, sistemas o proyectos de IA',
    'Buscas una carrera con altísima demanda y sueldos competitivos',
    'Estás listo/a para transformar industrias con código',
  ],
}

const ASPIRATIONAL_INTRO: Record<string, string> = {
  'Derecho':     'Una carrera que te pone en el centro de la justicia. Defenderás derechos, resolverás conflictos y tendrás un impacto directo en la vida de personas, familias y empresas.',
  'Salud':       'Transformarás vidas desde el primer semestre. Con prácticas reales, tecnología de vanguardia y convenios con los mejores centros de salud de Yucatán.',
  'Negocios':    'El mundo empresarial te espera. Aprenderás a tomar decisiones que mueven mercados, liderarás equipos y desarrollarás la visión estratégica que las empresas buscan hoy.',
  'Gastronomía': 'Donde la creatividad y la disciplina se encuentran. Aprenderás de los mejores en cocinas reales, con intercambios internacionales y un mercado laboral que nunca para.',
  'Tecnología':  'La tecnología que usas todos los días fue construida por alguien — ese alguien puedes ser tú. Desarrolla proyectos reales desde el primer año con las herramientas más demandadas.',
}

const CURRICULUM: Record<string, string[][]> = {
  'Derecho': [
    ['Intro al Derecho', 'Historia del Derecho', 'Derecho Romano', 'Lógica Jurídica', 'Metodología'],
    ['Derecho Civil I', 'Derecho Penal I', 'Constitucional I', 'Mercantil I', 'Sociología Jurídica'],
    ['Derecho Civil II', 'Derecho Penal II', 'Constitucional II', 'Mercantil II', 'Economía'],
    ['Procesal Civil I', 'Procesal Penal', 'Administrativo I', 'Laboral I', 'Derechos Humanos'],
    ['Procesal Civil II', 'Administrativo II', 'Laboral II', 'Fiscal I', 'Deontología Jurídica'],
    ['Derecho Familiar', 'Derecho Notarial', 'Int. Público', 'Amparo I', 'Práctica Forense Civil'],
    ['Derecho Agrario', 'Int. Privado', 'Amparo II', 'Criminología', 'Práctica Forense Penal'],
    ['Ambiental', 'Ética Profesional', 'Titulación', 'Servicio Social', 'Práctica Profesional'],
  ],
  'Salud': [
    ['Anatomía', 'Fisiología', 'Bioquímica', 'Metodología Científica', 'Psicología Básica'],
    ['Microbiología', 'Nutrición Básica', 'Farmacología I', 'Comunicación en Salud', 'Inglés I'],
    ['Patología', 'Dietética I', 'Farmacología II', 'Salud Pública I', 'Estadística'],
    ['Dietética II', 'Clínica I', 'Salud Pública II', 'Educación para la Salud', 'Inglés II'],
    ['Clínica II', 'Epidemiología', 'Geriatría', 'Pediatría', 'Administración en Salud'],
    ['Clínica III', 'Salud Comunitaria', 'Investigación I', 'Práctica Hospitalaria I', 'Bioética'],
    ['Optativa', 'Tecnología en Salud', 'Investigación II', 'Práctica Hospitalaria II', 'Emprendimiento'],
    ['Innovación en Salud', 'Gerencia', 'Práctica Profesional', 'Servicio Social', 'Titulación'],
  ],
  'Negocios': [
    ['Fund. Administración', 'Matemáticas', 'Intro a Negocios', 'Inglés I', 'Estadística'],
    ['Contabilidad I', 'Microeconomía', 'Marketing I', 'Comunicación Empresarial', 'Inglés II'],
    ['Contabilidad II', 'Macroeconomía', 'Marketing II', 'Derecho Empresarial', 'Estadística Aplicada'],
    ['Finanzas I', 'Comportamiento Org.', 'Ventas', 'Comercio Exterior I', 'TI para Negocios'],
    ['Finanzas II', 'Capital Humano', 'Marketing Digital', 'Comercio Exterior II', 'Inv. de Mercados'],
    ['Finanzas Corp.', 'Gestión de Proyectos', 'Negocios Internacionales', 'Cadena de Suministro', 'Emprendimiento'],
    ['Estrategia', 'Consultoría', 'E-Commerce', 'Innovación', 'Práctica Profesional I'],
    ['Dirección General', 'Responsabilidad Social', 'Titulación', 'Servicio Social', 'Práctica Prof. II'],
  ],
  'Gastronomía': [
    ['Fund. Gastronómicos', 'Historia Gastronomía', 'Técnicas Básicas', 'Matemáticas', 'Higiene Alimentaria'],
    ['Cocina Mexicana I', 'Repostería I', 'Nutrición', 'Inglés Gastronómico', 'Administración'],
    ['Cocina Mexicana II', 'Cocina Internacional I', 'Repostería II', 'Admón. de Bar', 'Inglés II'],
    ['Cocina Internacional II', 'Cocina Yucateca', 'Panadería', 'Costos y Presupuestos', 'Enología'],
    ['Cocina de Vanguardia', 'Cocina Vegetariana', 'Cocina Fusión', 'Mktg Gastronómico', 'Gestión Rest.'],
    ['Alta Cocina I', 'Catering y Eventos', 'Fotografía Gastronómica', 'Investigación Culinaria', 'Práctica I'],
    ['Alta Cocina II', 'Cocina Molecular', 'Plan de Negocios', 'Sumillería', 'Práctica II'],
    ['Innovación Culinaria', 'Emprendimiento', 'Práctica Profesional', 'Servicio Social', 'Titulación'],
  ],
  'Tecnología': [
    ['Fund. Programación', 'Matemáticas I', 'Intro a Sistemas', 'Inglés I', 'Lógica Computacional'],
    ['POO', 'Matemáticas II', 'Arquitectura Comp.', 'Inglés II', 'Álgebra Lineal'],
    ['Estructuras de Datos', 'Base de Datos I', 'Sistemas Operativos', 'Cálculo', 'Inglés III'],
    ['Ingeniería de Software', 'Base de Datos II', 'Redes I', 'Estadística', 'Inglés IV'],
    ['Desarrollo Web', 'Redes II', 'Seguridad I', 'Inteligencia Artificial', 'Admón. TI'],
    ['Desarrollo Móvil', 'Cloud Computing', 'Seguridad II', 'Big Data', 'Gestión Proyectos TI'],
    ['Arquitectura de SW', 'DevOps', 'Machine Learning', 'Innovación Tech', 'Práctica Prof. I'],
    ['Temas Avanzados TI', 'Emprendimiento Tech', 'Servicio Social', 'Práctica Prof. II', 'Titulación'],
  ],
}

const MODALITY_LABELS: Record<string, string> = {
  presencial: 'Presencial',
  'en-linea': 'En Línea',
  sabatina: 'Sabatina',
}
const MODALITY_COLORS: Record<string, string> = {
  presencial: 'bg-blue-100 text-blue-700',
  'en-linea': 'bg-green-100 text-green-700',
  sabatina: 'bg-orange-100 text-orange-700',
}

// ─── Job icon SVGs ────────────────────────────────────────────────────────────

function JobIcon({ type }: { type: string }) {
  const cls = 'w-4 h-4 flex-shrink-0'
  switch (type) {
    case 'building': return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={cls}><path fillRule="evenodd" d="M4 16.5v-13h-.25a.75.75 0 010-1.5h12.5a.75.75 0 010 1.5H16v13h.25a.75.75 0 010 1.5h-3.5a.75.75 0 01-.75-.75v-2.5a.75.75 0 00-.75-.75h-2.5a.75.75 0 00-.75.75v2.5a.75.75 0 01-.75.75h-3.5a.75.75 0 010-1.5H4zm3-11a.75.75 0 01.75-.75h.5a.75.75 0 010 1.5h-.5A.75.75 0 017 5.5zm.75 1.75a.75.75 0 000 1.5h.5a.75.75 0 000-1.5h-.5zm-.75 3.5a.75.75 0 01.75-.75h.5a.75.75 0 010 1.5h-.5a.75.75 0 01-.75-.75zm3.75-5a.75.75 0 000 1.5h.5a.75.75 0 000-1.5h-.5zm-.75 3.5a.75.75 0 01.75-.75h.5a.75.75 0 010 1.5h-.5a.75.75 0 01-.75-.75zm.75 1.75a.75.75 0 000 1.5h.5a.75.75 0 000-1.5h-.5z" clipRule="evenodd"/></svg>
    case 'briefcase': return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={cls}><path fillRule="evenodd" d="M6 3.75A2.75 2.75 0 018.75 1h2.5A2.75 2.75 0 0114 3.75v.443c.572.055 1.14.122 1.706.2C17.053 4.582 18 5.75 18 7.07v3.469c0 1.126-.694 2.191-1.83 2.54-1.952.599-4.024.921-6.17.921s-4.219-.322-6.17-.921C2.694 12.73 2 11.665 2 10.539V7.07c0-1.321.947-2.489 2.294-2.676A41.047 41.047 0 016 4.193V3.75zm6.5 0v.325a41.622 41.622 0 00-5 0V3.75c0-.69.56-1.25 1.25-1.25h2.5c.69 0 1.25.56 1.25 1.25zM10 10a1 1 0 00-1 1v.01a1 1 0 001 1h.01a1 1 0 001-1V11a1 1 0 00-1-1H10z" clipRule="evenodd"/><path d="M3 15.055v-.684c.278.075.565.144.858.205A49.105 49.105 0 0010 15c2.378 0 4.668-.221 6.875-.643a41.27 41.27 0 00.855-.205v.684c0 1.347-.985 2.53-2.405 2.729A48.585 48.585 0 0110 18a48.585 48.585 0 01-5.325-.38C3.985 17.585 3 16.402 3 15.055z"/></svg>
    case 'shield': return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={cls}><path fillRule="evenodd" d="M9.661 2.237a.531.531 0 01.678 0 11.947 11.947 0 007.078 2.749.5.5 0 01.479.425c.069.52.104 1.05.104 1.589 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 01-.332 0C5.26 16.564 2 12.163 2 7c0-.538.035-1.069.104-1.589a.5.5 0 01.48-.425 11.947 11.947 0 007.077-2.749z" clipRule="evenodd"/></svg>
    case 'book': return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={cls}><path d="M10.75 16.82A7.462 7.462 0 0115 15.5c.71 0 1.396.098 2.046.282A.75.75 0 0018 15.06v-11a.75.75 0 00-.546-.721A9.006 9.006 0 0015 3a8.963 8.963 0 00-4.25 1.065V16.82zM9.25 4.065A8.963 8.963 0 005 3c-.85 0-1.673.118-2.454.339A.75.75 0 002 4.06v11a.75.75 0 00.954.721A7.506 7.506 0 015 15.5c1.579 0 3.042.487 4.25 1.32V4.065z"/></svg>
    case 'hospital': case 'stethoscope': case 'heart': return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={cls}><path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-2.184C4.imagery 12.61 3 10.58 3 8a5 5 0 0110 0 5 5 0 015 0c0 2.58-1.imagery 4.61-2.885 6.036a22.045 22.045 0 01-2.582 2.184 20.76 20.76 0 01-1.162.682l-.019.01-.005.003h-.002a.739.739 0 01-.707 0l-.002-.001z"/></svg>
    case 'globe': return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={cls}><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-1.503.204A6.5 6.5 0 116.985 3.51c.976 1.8 1.2 3.647 1.03 5.158a5.021 5.021 0 01-.243 1.099l-.34.917c-.19.513-.295 1.055-.295 1.6v.316c0 .327.032.653.094.973L7.5 14.5a6.47 6.47 0 01-.534-2.575c0-.44.058-.872.167-1.286a6.455 6.455 0 011.626-2.907c.24-.24.5-.458.773-.65a6.487 6.487 0 00-1.082 3.418c0 .527.085 1.032.24 1.505A6.462 6.462 0 0010 12.5c.4 0 .784.054 1.15.155a4.955 4.955 0 011.538.734 6.527 6.527 0 003.809-3.185z" clipRule="evenodd"/></svg>
    case 'rocket': return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={cls}><path fillRule="evenodd" d="M4.606 12.97a.75.75 0 01-.134 1.051 9.994 9.994 0 00-1.96 2.429.75.75 0 01-1.337-.679 11.494 11.494 0 012.252-2.79.75.75 0 011.179-.011zm9.791-9.776A.75.75 0 0115 3v.75a.75.75 0 01-.22.53L9.5 9.56l.94.94 2.74-2.74a.75.75 0 011.06 1.06l-2.74 2.74.94.94 5.28-5.28A.75.75 0 0118 7.25V17a.75.75 0 01-.75.75H7.25a.75.75 0 01-.53-.22l-4-4a.75.75 0 010-1.06l6.75-6.75a.75.75 0 01.927-.079z" clipRule="evenodd"/></svg>
    case 'bank': return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={cls}><path fillRule="evenodd" d="M1 2.75A.75.75 0 011.75 2h16.5a.75.75 0 010 1.5H18v8.75A2.75 2.75 0 0115.25 15h-1.072l.798 3.06a.75.75 0 01-1.452.38L13.261 18H6.739l-.263 1.44a.75.75 0 11-1.478-.27L5.822 15H4.75A2.75 2.75 0 012 12.25V3.5h-.25A.75.75 0 011 2.75zM7.373 15l-.391 1.5h6.036l-.392-1.5H7.373zm5.649-6.5a.75.75 0 000-1.5H6.978a.75.75 0 000 1.5h6.044z" clipRule="evenodd"/></svg>
    case 'code': return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={cls}><path fillRule="evenodd" d="M6.28 5.22a.75.75 0 010 1.06L2.56 10l3.72 3.72a.75.75 0 01-1.06 1.06L.97 10.53a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 0zm7.44 0a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L17.44 10l-3.72-3.72a.75.75 0 010-1.06zM11.377 2.011a.75.75 0 01.612.867l-2.5 14.5a.75.75 0 01-1.478-.255l2.5-14.5a.75.75 0 01.866-.612z" clipRule="evenodd"/></svg>
    case 'gavel': return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={cls}><path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clipRule="evenodd"/></svg>
    case 'star': return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={cls}><path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd"/></svg>
    default: return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={cls}><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd"/></svg>
  }
}

// ─── HTML builder for downloadable PDF-style brochure ─────────────────────────

function buildCareerHTML(career: Career, curriculum: string[][], values: Record<string, any>) {
  const subjects = curriculum.map((sems, i) =>
    `<tr><td style="font-weight:700;color:#1B3070;padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px">Semestre ${i + 1}</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#4b5563;font-size:13px">${sems.join(' · ')}</td></tr>`
  ).join('')
  const modLabel = { presencial: 'Presencial', 'en-linea': 'En Línea', sabatina: 'Sabatina' }[career.modality] ?? career.modality
  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><title>${career.name} | Universidad Latino</title>
<style>
  @page { margin: 1.5cm; size: A4; }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; color:#111827; margin:0; padding:0; line-height:1.5; }
  .hero { background:#1B3070; padding:40px 48px; color:#fff; }
  .hero h1 { font-size:28px; font-weight:900; margin:0 0 6px; letter-spacing:-0.02em; }
  .hero p { font-size:14px; color:#94a3b8; margin:0; }
  .badge { display:inline-block; background:#E6B400; color:#1B3070; font-weight:900; font-size:11px; padding:4px 14px; border-radius:999px; margin-top:12px; }
  .section { padding:32px 48px; }
  .section-title { font-size:18px; font-weight:900; color:#1B3070; margin:0 0 12px; letter-spacing:-0.01em; }
  .desc { color:#4b5563; font-size:14px; line-height:1.7; margin:0 0 24px; }
  .grid-2 { display:flex; gap:16px; flex-wrap:wrap; }
  .stat { flex:1; min-width:120px; background:#f8fafc; border-radius:12px; padding:16px; text-align:center; }
  .stat-num { font-size:22px; font-weight:900; color:#1B3070; }
  .stat-label { font-size:12px; color:#6b7280; margin-top:4px; }
  table { width:100%; border-collapse:collapse; border-radius:12px; overflow:hidden; }
  th { background:#1B3070; color:#fff; font-size:13px; font-weight:700; padding:10px 12px; text-align:left; }
  .footer { border-top:2px solid #e5e7eb; padding:24px 48px; font-size:12px; color:#9ca3af; text-align:center; }
  .footer strong { color:#1B3070; }
</style></head><body>
<div class="hero">
  <h1>${career.name}</h1>
  <p>${career.area} · ${modLabel} · ${values.appName || 'Universidad Latino'}</p>
  <div class="badge">${career.duration}</div>
</div>
<div class="section">
  <h2 class="section-title">Acerca del programa</h2>
  <p class="desc">${career.description || ''}</p>
  <div class="grid-2">
    ${career.enrollment ? `<div class="stat"><div class="stat-num">${career.enrollment}</div><div class="stat-label">Inscripción</div></div>` : ''}
    ${career.monthlyFee ? `<div class="stat"><div class="stat-num">${career.monthlyFee}</div><div class="stat-label">Mensualidad</div></div>` : ''}
    <div class="stat"><div class="stat-num">${curriculum.length}</div><div class="stat-label">Semestres</div></div>
    <div class="stat"><div class="stat-num">${modLabel}</div><div class="stat-label">Modalidad</div></div>
  </div>
</div>
<div class="section">
  <h2 class="section-title">Plan de estudios</h2>
  <table><thead><tr><th style="width:140px">Semestre</th><th>Materias</th></tr></thead><tbody>${subjects}</tbody></table>
</div>
<div class="section" style="background:#f8fafc;border-radius:12px;margin:0 48px 32px;padding:24px">
  <p style="font-size:14px;color:#4b5563;margin:0 0 8px;font-weight:700">¿Listo para comenzar?</p>
  <p style="font-size:13px;color:#6b7280;margin:0">Contáctanos por WhatsApp para iniciar tu proceso de admisi&oacute;n.</p>
  <p style="font-size:13px;color:#1B3070;margin-top:8px"><strong>${values.contactPhone || '999-943-5386'}</strong> · ${values.contactEmail || 'informes@universidadlatino.edu.mx'}</p>
</div>
<div class="footer">
  <strong>${values.appName || 'Universidad Latino'}</strong> · ${values.address || 'Mérida, Yucatán'} · RVOE SEP<br>
  Documento generado el ${new Date().toLocaleDateString('es-MX', { year:'numeric',month:'long',day:'numeric' })}
</div>
</body></html>`
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CarreraDetalle() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { values } = useAdmin()
  const [openSems, setOpenSems] = useState<Set<number>>(new Set([0]))
  const [career, setCareer] = useState<Career | null | undefined>(() => {
    // Render immediately from AdminContext instead of showing a loading spinner
    const found = values.careers.find((c) => c.id === id)
    return found ?? undefined
  })

  useEffect(() => { window.scrollTo(0, 0) }, [id])

  // Background enrichment from Supabase (non-blocking)
  useEffect(() => {
    if (!id) { setCareer(null); return }
    const fromContext = values.careers.find((c) => c.id === id)
    const load = async () => {
      try {
        const { data } = await supabase.from('careers').select('*').eq('id', id).single()
        if (data) {
          setCareer({
            id: data.id,
            name: data.name,
            area: data.area ?? '',
            duration: data.duration ?? '',
            modality: normalizeModality(data.modality ?? ''),
            description: data.description ?? '',
            monthlyFee: formatPrice(data.monthly_price),
            enrollment: formatPrice(data.enrollment_price ?? data.enrollment, ''),
            highlights: data.highlights ?? undefined,
            active: true,
          })
        } else if (!fromContext) {
          setCareer(null)
        }
      } catch {
        if (!fromContext) setCareer(null)
      }
    }
    // Set from context immediately so UI renders without waiting for Supabase
    if (fromContext) setCareer(fromContext)
    load()
  }, [id])

  // Store career context for Eva IA contextual greeting
  useEffect(() => {
    if (career) {
      localStorage.setItem('evaCareerContext', JSON.stringify({ name: career.name, area: career.area, id: career.id }))
    }
    return () => { localStorage.removeItem('evaCareerContext') }
  }, [career])

  // Must define all hooks before any early return (React Rules of Hooks)
  const handleDownloadHTML = useCallback(() => {
    if (!career) return
    const curric = CURRICULUM[career.area] ?? CURRICULUM['Negocios']
    const html = buildCareerHTML(career, curric, values)
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${career.name.replace(/[\s/]+/g, '-')}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [career, values])

  if (career === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-[#1B3070] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (career === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Carrera no encontrada.</p>
        <button onClick={() => navigate('/')} className="text-[#1B3070] font-bold hover:underline">Volver al inicio</button>
      </div>
    )
  }

  const heroImg    = AREA_IMG[career.area]       ?? AREA_IMG['Negocios']
  const gradProfile = GRAD_PROFILE[career.area]  ?? GRAD_PROFILE['Negocios']
  const jobFields  = JOB_FIELDS[career.area]     ?? JOB_FIELDS['Negocios']
  const curriculum = CURRICULUM[career.area]     ?? CURRICULUM['Negocios']
  const idealProfile = IDEAL_PROFILE[career.area] ?? IDEAL_PROFILE['Negocios']
  const aspIntro   = ASPIRATIONAL_INTRO[career.area] ?? ''

  const c = career

  const waNumber = (values.whatsappNumber || '+529994538421').replace(/\D/g, '')
  const waMsg = `https://wa.me/${waNumber}?text=Hola%2C%20quiero%20iniciar%20mi%20proceso%20de%20admisi%C3%B3n%20en%20${encodeURIComponent(c.name)}%20en%20Universidad%20Latino.`

  function handleSolicitar() {
    localStorage.setItem('selectedBecaCareer', JSON.stringify({
      id: c.id,
      name: c.name,
      monthly_price: c.monthlyFee ?? '',
      enrollment_price: c.enrollment ?? '',
      modality: c.modality,
    }))
    navigate('/mi-beca')
  }

  function toggleSem(i: number) {
    setOpenSems((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  const priceLabel = c.monthlyFee
    ? `Desde ${c.monthlyFee} con beca`
    : 'Consultar precio'

  return (
    <div className="flex flex-col bg-white min-h-dvh">

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative flex items-end min-h-[65vh] md:min-h-[75vh] overflow-hidden bg-[#1B3070]">
        <img src={heroImg} alt={career.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#06090f]/80 via-transparent to-transparent" />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-16 pb-14 md:pb-20 pt-28 md:pt-32">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-white/40 text-xs mb-6">
            <Link to="/" className="hover:text-white transition-colors">Inicio</Link>
            <span>/</span>
            <Link to="/carreras" className="hover:text-white transition-colors">Carreras</Link>
            <span>/</span>
            <span className="text-white/70 truncate max-w-[200px]">{career.name}</span>
          </nav>

          <p className="text-[#E6B400] text-[10px] font-black uppercase tracking-[0.35em] mb-4">{career.area}</p>
          <h1 className="text-white font-black text-[2rem] md:text-[3.5rem] lg:text-[4rem] leading-[1.0] tracking-tight mb-6 max-w-3xl">
            {career.name}
          </h1>

          {/* Modality + duration badges */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${MODALITY_COLORS[career.modality] ?? 'bg-gray-100 text-gray-700'}`}>
              {MODALITY_LABELS[career.modality] ?? career.modality}
            </span>
            {career.duration && (
              <span className="bg-white/10 backdrop-blur text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                {career.duration}
              </span>
            )}
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-2 mb-8">
            {[
              '✔ RVOE SEP',
              '✔ Prácticas desde 1er semestre',
              '✔ Alta empleabilidad',
            ].map((badge) => (
              <span key={badge} className="bg-white/10 backdrop-blur-sm border border-white/20 text-white text-[11px] font-semibold px-3 py-1.5 rounded-full">
                {badge}
              </span>
            ))}
          </div>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={waMsg}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#E6B400] text-[#1B3070] font-black px-7 py-3.5 rounded-full text-sm hover:brightness-105 active:scale-95 transition-all shadow-[0_8px_24px_rgba(230,180,0,0.4)]"
            >
              Iniciar proceso
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd"/>
              </svg>
            </a>
            <button
              onClick={handleSolicitar}
              className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur border border-white/30 text-white font-bold px-7 py-3.5 rounded-full text-sm hover:bg-white/20 active:scale-95 transition-all"
            >
              Calcular mi beca
            </button>
          </div>
        </div>
      </section>

      {/* ── Sticky back bar ──────────────────────────────────────────────────── */}
      <div className="sticky top-0 md:top-16 z-30 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 md:px-16 h-14 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate('/carreras')}
            className="flex items-center gap-1.5 text-[#1B3070] text-sm font-semibold hover:opacity-70 transition-opacity flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
            </svg>
            Volver
          </button>
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar text-right">
            {c.monthlyFee && (
              <div className="flex-shrink-0">
                <p className="text-[#1B3070] font-black text-sm leading-tight">{priceLabel}</p>
                <p className="text-gray-400 text-[10px] uppercase tracking-wide">Colegiatura</p>
                <p className="text-[10px] text-[#E6B400] font-semibold">Puede reducirse con beca</p>
              </div>
            )}
            {c.enrollment && (
              <div className="flex-shrink-0">
                <p className="text-[#1B3070] font-black text-sm leading-tight">{c.enrollment}</p>
                <p className="text-gray-400 text-[10px] uppercase tracking-wide">Inscripción</p>
              </div>
            )}
            {c.duration && (
              <div className="flex-shrink-0 hidden sm:block">
                <p className="text-[#1B3070] font-black text-sm">{c.duration}</p>
                <p className="text-gray-400 text-[10px] uppercase tracking-wide">Duración</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto w-full px-6 md:px-16 py-16 space-y-20 pb-28 md:pb-20">

        {/* Descripción aspiracional */}
        <section>
          <SectionLabel>Acerca del programa</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
            <div className="md:col-span-2 space-y-4">
              {aspIntro && (
                <p className="text-[#1B3070] font-bold text-lg leading-relaxed">{aspIntro}</p>
              )}
              {career.description && (
                <p className="text-gray-600 text-base leading-relaxed">{career.description}</p>
              )}
              {career.highlights && career.highlights.length > 0 && (
                <ul className="mt-4 space-y-3">
                  {career.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-[#E6B400]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E6B400]" />
                      </span>
                      <span className="text-gray-700 text-sm">{h}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="bg-[#f7f8fc] rounded-2xl p-6 space-y-4 h-fit">
              <p className="text-[#1B3070] font-black text-sm">Modalidad</p>
              <span className={`inline-block text-xs font-bold px-3 py-1.5 rounded-full ${MODALITY_COLORS[career.modality] ?? 'bg-gray-100 text-gray-700'}`}>
                {MODALITY_LABELS[career.modality] ?? career.modality}
              </span>
              {career.duration && (
                <>
                  <p className="text-[#1B3070] font-black text-sm pt-2">Duración</p>
                  <p className="text-gray-600 text-sm">{career.duration}</p>
                </>
              )}
              <div className="pt-2 border-t border-gray-200 space-y-1">
                <p className="text-[#1B3070] font-black text-sm">Área</p>
                <p className="text-gray-600 text-sm">{career.area}</p>
              </div>
            </div>
          </div>

          {/* CTA after description */}
          <div className="flex flex-col sm:flex-row gap-3 mt-10">
            <a href={waMsg} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#1B3070] text-white font-black px-7 py-3.5 rounded-full text-sm hover:bg-[#152858] active:scale-95 transition-all shadow-lg">
              Iniciar proceso
            </a>
            <button onClick={handleSolicitar}
              className="inline-flex items-center justify-center gap-2 border-2 border-[#1B3070] text-[#1B3070] font-black px-7 py-3.5 rounded-full text-sm hover:bg-[#1B3070]/5 active:scale-95 transition-all">
              Calcular mi beca
            </button>
          </div>
        </section>

        {/* ¿Esta carrera es para ti? */}
        <section className="bg-gradient-to-br from-[#f7f8fc] to-[#eef1f8] rounded-3xl p-8 md:p-12">
          <SectionLabel>¿Esta carrera es para ti?</SectionLabel>
          <p className="text-gray-500 text-sm mt-2 mb-8">Si te identificas con la mayoría de estos puntos, estás en el lugar correcto.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {idealProfile.map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm">
                <div className="w-6 h-6 rounded-full bg-[#E6B400] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#1B3070" className="w-3.5 h-3.5">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd"/>
                  </svg>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Perfil del egresado + Campo laboral */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <SectionLabel>Perfil del egresado</SectionLabel>
            <p className="text-gray-400 text-sm mt-1 mb-6">Al terminar esta carrera, serás capaz de:</p>
            <ul className="space-y-4">
              {gradProfile.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#1B3070] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[#E6B400] font-black text-[10px]">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed pt-0.5">{item}</p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionLabel>Campo laboral</SectionLabel>
            <p className="text-gray-400 text-sm mt-1 mb-6">Dónde trabajan nuestros egresados:</p>
            <div className="grid grid-cols-1 gap-3">
              {jobFields.map((field, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-[#f7f8fc] hover:bg-[#eef1f8] hover:shadow-sm transition-all duration-200 group">
                  <div className="w-9 h-9 rounded-xl bg-[#1B3070]/8 group-hover:bg-[#1B3070] flex items-center justify-center flex-shrink-0 transition-colors duration-200">
                    <div className="text-[#1B3070] group-hover:text-white transition-colors duration-200">
                      <JobIcon type={field.icon} />
                    </div>
                  </div>
                  <span className="text-gray-700 text-sm font-medium">{field.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Malla curricular — accordion */}
        <section>
          <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
            <div>
              <SectionLabel>Malla curricular</SectionLabel>
              <p className="text-gray-400 text-sm mt-1">{curriculum.length} semestres · Plan de estudios vigente</p>
            </div>
            <button
              onClick={handleDownloadHTML}
              className="flex items-center gap-1.5 text-[#1B3070] text-xs font-bold border border-[#1B3070]/20 px-4 py-2 rounded-full hover:bg-[#1B3070]/5 active:scale-95 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M4 2a1.5 1.5 0 00-1.5 1.5v13A1.5 1.5 0 004 18h12a1.5 1.5 0 001.5-1.5V6.621a1.5 1.5 0 00-.44-1.06L13.56.44A1.5 1.5 0 0012.5 0H4zm7 1.5v3A1.5 1.5 0 0012.5 6H16v10.5a.5.5 0 01-.5.5h-11a.5.5 0 01-.5-.5v-13A.5.5 0 014 3h7zM6.75 9.25a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-4.5z" clipRule="evenodd"/>
              </svg>
              Descargar PDF
            </button>
          </div>
          <div className="space-y-3">
            {curriculum.map((subjects, sem) => (
              <div key={sem} className="rounded-2xl border border-gray-100 overflow-hidden hover:border-[#1B3070]/15 transition-colors duration-200 shadow-sm">
                <button
                  onClick={() => toggleSem(sem)}
                  className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-[#f7f8fc] transition-colors duration-150 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#1B3070] flex items-center justify-center flex-shrink-0">
                      <span className="text-[#E6B400] font-black text-[10px]">{String(sem + 1).padStart(2, '0')}</span>
                    </div>
                    <div className="text-left">
                      <p className="text-[#1B3070] font-black text-sm">Semestre {sem + 1}</p>
                      {!openSems.has(sem) && (
                        <p className="text-gray-400 text-xs mt-0.5 group-hover:text-gray-500 transition-colors">
                          {subjects.slice(0, 2).join(' · ')} {subjects.length > 2 ? `+${subjects.length - 2} más` : ''}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#E6B400] font-black text-xs bg-[#E6B400]/10 px-2 py-0.5 rounded-full">{subjects.length} materias</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${openSems.has(sem) ? 'rotate-180' : ''}`}
                    >
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </button>
                {openSems.has(sem) && (
                  <div className="px-5 pb-4 bg-[#f9fafb] border-t border-gray-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-3">
                      {subjects.map((subject, j) => (
                        <div key={j} className="flex items-center gap-2 text-xs text-gray-600 py-1.5 px-3 bg-white rounded-lg border border-gray-100">
                          <span className="w-1 h-1 rounded-full bg-[#E6B400] flex-shrink-0" />
                          {subject}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Becas disponibles */}
        <section className="bg-[#06090f] rounded-3xl overflow-hidden">
          <div className="relative p-8 md:p-12">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
              style={{ background: 'radial-gradient(circle, #E6B400 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-[#E6B400] text-xs font-black uppercase tracking-[0.3em] mb-4">Becas disponibles</p>
                <h2 className="text-white font-black text-2xl md:text-3xl leading-tight mb-4">
                  Estudia con hasta<br />50% de beca
                </h2>
                <p className="text-white/55 text-sm leading-relaxed">
                  El monto de tu beca se determina por tu promedio académico. Cuanto más alto, mayor es tu descuento en colegiatura e inscripción.
                </p>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Sobresaliente', range: '9.60 – 10.00', beca: '50% colegiatura + 50% inscripción', color: '#059669' },
                  { label: 'Muy alto',      range: '9.00 – 9.59', beca: '40% colegiatura + 50% inscripción', color: '#2563eb' },
                  { label: 'Alto',          range: '8.5 – 8.99', beca: '30% colegiatura + 50% inscripción', color: '#7c3aed' },
                  { label: 'Base',          range: '7.0 – 8.49',   beca: '50% descuento en inscripción',      color: '#d97706' },
                ].map((level) => (
                  <div key={level.label} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: level.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-xs">{level.label} <span className="text-white/40">· {level.range}</span></p>
                      <p className="text-white/50 text-[11px] mt-0.5">{level.beca}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA after becas */}
        <section className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleSolicitar}
            className="flex-1 flex items-center justify-center gap-2 bg-[#E6B400] text-[#1B3070] font-black px-8 py-4 rounded-full text-sm hover:brightness-105 active:scale-95 transition-all shadow-[0_8px_24px_rgba(230,180,0,0.4)]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd" />
            </svg>
            Calcular mi beca
          </button>
          <a
            href={waMsg}
            target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 border-2 border-[#1B3070] text-[#1B3070] font-black px-8 py-4 rounded-full text-sm hover:bg-[#1B3070]/5 active:scale-95 transition-all"
          >
            Iniciar proceso
          </a>
        </section>

        {/* Cierre */}
        <section className="text-center py-10">
          <div className="inline-flex items-center gap-2 bg-[#E6B400]/10 text-[#E6B400] text-xs font-black uppercase tracking-[0.25em] px-4 py-2 rounded-full mb-6">
            ¿Listo para iniciar?
          </div>
          <h2 className="text-[#1B3070] font-black text-[2rem] md:text-[2.5rem] leading-tight tracking-tight mb-4 max-w-2xl mx-auto">
            Tu carrera profesional<br />comienza aquí
          </h2>
          <p className="text-gray-500 text-base mb-8 max-w-md mx-auto">
            Sin examen de admisión. Con beca disponible desde el primer día. Empieza tu proceso hoy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={waMsg}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#1B3070] text-white font-black px-8 py-4 rounded-full text-sm hover:bg-[#152858] active:scale-95 transition-all shadow-[0_8px_32px_rgba(27,48,112,0.25)]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0">
                <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 012.43 8.326 13.019 13.019 0 012 5V3.5z" clipRule="evenodd" />
              </svg>
              WhatsApp
            </a>
            <button
              onClick={handleSolicitar}
              className="inline-flex items-center justify-center gap-2 bg-[#E6B400] text-[#1B3070] font-black px-8 py-4 rounded-full text-sm hover:brightness-105 active:scale-95 transition-all shadow-[0_8px_24px_rgba(230,180,0,0.4)]"
            >
              Iniciar proceso
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd"/>
              </svg>
            </button>
          </div>
        </section>

      </div>

      {/* Eva IA career widget */}

    </div>
  )
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-1 h-6 rounded-full bg-[#E6B400]" />
      <h2 className="text-[#1B3070] font-black text-lg md:text-xl tracking-tight">{children}</h2>
    </div>
  )
}
