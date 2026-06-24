// ─── Meta Pixel + Custom Events ─────────────────────────────────────────────
// Standard events for Meta Ads conversion tracking
// Pixel ID from env: VITE_FB_PIXEL_ID

declare global {
  interface Window {
    fbq: {
      (...args: unknown[]): void
      q?: unknown[][]
    }
    _fbq: unknown
  }
}

const PIXEL_ID = import.meta.env.VITE_FB_PIXEL_ID as string | undefined

let initialized = false

/** Initialize Meta Pixel — idempotent */
export function initPixel(): void {
  if (initialized || !PIXEL_ID) return

  // Inject fbq script
  const script = document.createElement('script')
  script.async = true
  script.defer = true
  script.src = 'https://connect.facebook.net/en_US/fbevents.js'
  document.head.appendChild(script)

  // Initialize fbq
  window.fbq = function (...args: unknown[]) {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    window._fbq = window._fbq || []
    window.fbq.q = window.fbq.q || []
    window.fbq.q.push(args)
  }
  window._fbq = window.fbq
  window.fbq('init', PIXEL_ID)

  initialized = true
}

/** Track a standard/custom event */
export function trackEvent(
  eventName: string,
  params?: Record<string, unknown>
): void {
  if (!initialized || !PIXEL_ID) return
  try {
    window.fbq('track', eventName, params)
  } catch {
    // silent
  }
}

/** Convenience: track PageView */
export function trackPageView(url?: string): void {
  trackEvent('PageView', url ? { page: url } : undefined)
}

/** Convenience: track ViewContent */
export function trackViewContent(params?: Record<string, unknown>): void {
  trackEvent('ViewContent', params)
}

/** Convenience: track Lead */
export function trackLead(params?: Record<string, unknown>): void {
  trackEvent('Lead', params)
}

/** Convenience: track Contact */
export function trackContact(params?: Record<string, unknown>): void {
  trackEvent('Contact', params)
}

/** Convenience: track StartTest */
export function trackStartTest(): void {
  trackEvent('StartTest')
}

/** Convenience: track CompleteTest */
export function trackCompleteTest(): void {
  trackEvent('CompleteTest')
}

/** Convenience: track ClickWhatsApp */
export function trackClickWhatsApp(params?: Record<string, unknown>): void {
  trackEvent('ClickWhatsApp', params)
}

/** Convenience: track ViewCarrera */
export function trackViewCarrera(params?: Record<string, unknown>): void {
  trackEvent('ViewCarrera', params)
}

/** Convenience: track ClickBeca */
export function trackClickBeca(params?: Record<string, unknown>): void {
  trackEvent('ClickBeca', params)
}