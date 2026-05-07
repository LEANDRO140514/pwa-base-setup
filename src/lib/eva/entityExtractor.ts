// ─── Eva Engine — Entity extraction (careerName, area, modality) ─────────────

import type { Entities, Modality } from './types'
import { ONLINE_SYNONYMS, PRESENTIAL_SYNONYMS, SATURDAY_SYNONYMS } from './normalizer'

// ── Area map ──────────────────────────────────────────────────────────────────

const AREA_MAP: Record<string, string[]> = {
  'Salud':       ['salud', 'medicina', 'nutricion', 'psicologia', 'enfermeria', 'clinica', 'clinico'],
  'Derecho':     ['derecho', 'legal', 'abogado', 'abogacia', 'juridico'],
  'Negocios':    ['negocios', 'empresa', 'empresas', 'administracion', 'mercadotecnia', 'ventas', 'marketing', 'internacionales', 'comercio'],
  'Gastronomía': ['gastronomia', 'cocina', 'chef', 'culinaria', 'alimentos'],
  'Tecnología':  ['tecnologia', 'sistemas', 'computacion', 'ingenieria', 'programacion', 'software', 'informatica'],
}

// ── Career keyword map (normalized fragment → Supabase name) ─────────────────
// Keys ordered longest-first to prefer specific matches.

const CAREER_KEYWORD_MAP: [string, string][] = [
  ['sistemas computacionales',              'Ingeniería en Sistemas Computacionales'],
  ['ingenieria en sistemas',                'Ingeniería en Sistemas Computacionales'],
  ['ingenieria sistemas',                   'Ingeniería en Sistemas Computacionales'],
  ['ventas y mercadotecnia',                'Ventas y Mercadotecnia'],
  ['negocios internacionales',              'Negocios Internacionales'],
  ['administracion y desarrollo',           'Administración y Desarrollo Empresarial Online'],
  ['administracion sabatina',               'Administración Sabatina'],
  ['desarrollo empresarial',                'Administración y Desarrollo Empresarial Online'],
  ['nutricion',                             'Nutrición'],
  ['enfermeria',                            'Enfermería'],
  ['psicologia',                            'Psicología'],
  ['gastronomia',                           'Gastronomía'],
  ['mercadotecnia',                         'Ventas y Mercadotecnia'],
  ['sistemas',                              'Ingeniería en Sistemas Computacionales'],
]

// ── Detectors ─────────────────────────────────────────────────────────────────

export function detectModality(n: string): Modality | null {
  if (ONLINE_SYNONYMS.some((s) => n.includes(s))) return 'En línea'
  if (PRESENTIAL_SYNONYMS.some((s) => n.includes(s))) return 'Presencial'
  if (SATURDAY_SYNONYMS.some((s) => n.includes(s))) return 'Sabatina'
  return null
}

export function detectArea(n: string): string | null {
  for (const [area, synonyms] of Object.entries(AREA_MAP)) {
    if (synonyms.some((s) => n.includes(s))) return area
  }
  return null
}

export function detectCareerName(n: string): string | null {
  for (const [fragment, name] of CAREER_KEYWORD_MAP) {
    if (n.includes(fragment)) return name
  }
  // standalone "derecho" (not part of a modality phrase)
  if (/\bderecho\b/.test(n)) return 'Derecho'
  return null
}

/** Extract careerName, area, modality independently from a normalized input. */
export function extractEntities(normalizedInput: string): Entities {
  return {
    careerName: detectCareerName(normalizedInput),
    area:       detectArea(normalizedInput),
    modality:   detectModality(normalizedInput),
  }
}
