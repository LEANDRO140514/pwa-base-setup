// ─── Eva Engine — Input normalization + synonym constants ────────────────────

export const ONLINE_SYNONYMS = [
  'online', 'on line', 'en linea', 'virtual', 'virtuales',
  'remoto', 'remota', 'remotos', 'remotas', 'a distancia', 'desde casa',
]

export const PRESENTIAL_SYNONYMS = [
  'presencial', 'en campus', 'en salon', 'fisico', 'fisica',
]

export const SATURDAY_SYNONYMS = [
  'sabatina', 'sabados', 'sabado', 'fin de semana',
]

export const CONFIRMATION_YES = [
  'si', 'sí', 'claro', 'ok', 'va', 'vale', 'por favor',
  'andale', 'ándale', 'adelante', 'quiero', 'dime', 'cuentame',
]

export const CONFIRMATION_NO = [
  'no', 'no gracias', 'ahora no', 'luego', 'otro momento',
]

/** Lowercase, remove accents, remove punctuation noise, collapse spaces. */
export function normalizeInput(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // remove diacritics
    .replace(/[¿¡]/g, '')              // Spanish inv. punctuation
    .replace(/[.,!?;:()]/g, ' ')       // punctuation → space
    .replace(/\s+/g, ' ')
    .trim()
}
