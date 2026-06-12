// ─── Eva Engine — Type definitions ───────────────────────────────────────────

export type Intent =
  | 'greeting'
  | 'faq'
  | 'career_list'
  | 'career_detail'
  | 'modality_filter'
  | 'scholarship'
  | 'payment'
  | 'admission'
  | 'documents'
  | 'schedule'
  | 'revalidation'
  | 'confirmation_yes'
  | 'confirmation_no'
  | 'fallback'

export type Modality = 'En línea' | 'Presencial' | 'Sabatina'

export type MatchedSource = 'faq' | 'careers' | 'schedules' | 'content' | 'fallback'

export interface Entities {
  careerName: string | null   // name fragment as stored in Supabase (e.g. "Derecho")
  area: string | null
  modality: Modality | null
}

export interface ConversationState {
  currentIntent: Intent | null
  currentCareer: string | null
  currentArea: string | null
  currentModality: Modality | null
  pendingAction: string | null
  lastResults: Career[] | null
}

export interface Career {
  id: string
  name: string
  slug?: string | null
  area: string
  modality: string
  monthly_price: number | string | null
  enrollment_price?: number | string | null
  description?: string | null
  duration?: string | null
  job_field?: string | null
  student_profile?: string | null
  requirements?: string | null
  rvoe?: string | null
  is_featured?: boolean
}

export interface FAQ {
  id: string
  type: 'informational' | 'conversational'
  triggers: string[]
  response: string
  created_at?: string
}

export interface EngineResponse {
  intent: Intent
  entities: Entities
  state: ConversationState
  response: string
  matchedSource: MatchedSource
  confidence: number
}
