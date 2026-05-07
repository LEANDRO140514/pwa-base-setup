// ─── Eva Engine — Conversation state management ───────────────────────────────

import type { ConversationState, Intent, Entities, Career, Modality } from './types'

export const EMPTY_STATE: ConversationState = {
  currentIntent:  null,
  currentCareer:  null,
  currentArea:    null,
  currentModality: null,
  pendingAction:  null,
  lastResults:    null,
}

export function updateConversationState(
  prev: ConversationState,
  intent: Intent,
  entities: Entities,
  opts: {
    lastResults?:  Career[] | null
    pendingAction?: string | null
  } = {},
): ConversationState {
  // If a specific career is named WITHOUT modality/area in the same message → reset context
  const resetContext = !!entities.careerName && !entities.modality && !entities.area

  return {
    currentIntent:   intent,
    currentCareer:   entities.careerName ?? prev.currentCareer,
    currentArea:     resetContext ? null : (entities.area    ?? prev.currentArea),
    currentModality: resetContext ? null : (entities.modality ?? (prev.currentModality as Modality | null)),
    pendingAction:   opts.pendingAction !== undefined ? opts.pendingAction : null,
    lastResults:     opts.lastResults    !== undefined ? opts.lastResults    : prev.lastResults,
  }
}
