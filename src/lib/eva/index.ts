// ─── Eva Engine — Main entry point ───────────────────────────────────────────

import type { EngineResponse, ConversationState } from './types'
import { normalizeInput, CONFIRMATION_YES } from './normalizer'
import { extractEntities } from './entityExtractor'
import { detectIntent } from './intentEngine'
import { updateConversationState, EMPTY_STATE } from './stateManager'
import { buildResponse, PENDING_ACTIONS } from './responseBuilder'
import { fetchAllData } from './supabaseResolver'

export { EMPTY_STATE }
export type { ConversationState, EngineResponse }

/**
 * Main Eva resolver. Given raw user input and previous state, returns a full
 * EngineResponse with response text, updated state, intent, entities, source, confidence.
 */
export async function resolveEvaMessage(
  rawInput: string,
  prevState: ConversationState = EMPTY_STATE,
): Promise<EngineResponse> {
  // 1. Normalize
  const normalized = normalizeInput(rawInput)

  // 2. Fetch all Supabase data (cached)
  const { careers } = await fetchAllData()

  // ── resolvePendingAction (before everything else) ────────────────────────
  if (prevState.pendingAction) {
    const isYes = CONFIRMATION_YES.some(
      (c) => normalized === c || normalized.startsWith(c + ' '),
    )
    if (isYes) {
      const handler = PENDING_ACTIONS[prevState.pendingAction]
      if (handler) {
        const response = handler(careers)
        const state = updateConversationState(
          prevState, 'confirmation_yes',
          { careerName: null, area: null, modality: null },
          { pendingAction: null },
        )
        return {
          intent: 'confirmation_yes',
          entities: { careerName: null, area: null, modality: null },
          state,
          response,
          matchedSource: 'faq',
          confidence: 1,
        }
      }
    }
    // Non-affirmative → clear pending and continue normally
  }

  // 3. Extract entities (careerName, area, modality) — independently
  const entities = extractEntities(normalized)

  // 4. Detect primary intent
  const intent = detectIntent(normalized, entities, prevState)

  // 5. Build response (single coherent answer)
  const result = buildResponse(intent, entities, prevState, careers)

  // 6. Update state
  const newState = updateConversationState(prevState, intent, entities, {
    lastResults:   careers,
    pendingAction: result.pendingAction,
  })

  // 7. Dev logging
  if (import.meta.env.DEV) {
    console.group('[Eva]')
    console.log('input:    ', normalized)
    console.log('intent:   ', intent)
    console.log('entities: ', entities)
    console.log('source:   ', result.source)
    console.log('pending:  ', result.pendingAction)
    console.log('state →   ', newState)
    console.groupEnd()
  }

  return {
    intent,
    entities,
    state:         newState,
    response:      result.text,
    matchedSource: result.source,
    confidence:    result.confidence,
  }
}
