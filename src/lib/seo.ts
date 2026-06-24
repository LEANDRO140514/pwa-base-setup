// ─── SEO Head — Per-page meta tags ─────────────────────────────────────────
// Imperative helpers for updating <title>, <meta>, <link rel="canonical">.
// Pages call applySEO() inside a useEffect() on mount.

export const DEFAULT_TITLE = 'Universidad Latino | Licenciaturas en Mérida, Yucatán'
export const DEFAULT_DESC =
  'Universidad Latino en Mérida, Yucatán. Licenciaturas con RVOE SEP. Becas de hasta 50% sujeta a validación.'
export const DEFAULT_CANONICAL = 'https://testunilatino.algorithmus.io/'

export interface SEOProps {
  title?: string
  description?: string
  canonical?: string
  ogImage?: string
}

function setMeta(name: string, content: string): void {
  let el = document.querySelector(`meta[name="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setOG(property: string, content: string): void {
  let el = document.querySelector(`meta[property="${property}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('property', property)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setCanonical(href: string): void {
  let el = document.querySelector('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

export function applySEO(props: SEOProps): void {
  const title = props.title || DEFAULT_TITLE
  const desc = props.description || DEFAULT_DESC

  document.title = title
  setMeta('description', desc)
  setOG('og:title', title)
  setOG('og:description', desc)
  setOG('og:url', props.canonical || DEFAULT_CANONICAL)
  if (props.ogImage) setOG('og:image', props.ogImage)
  setCanonical(props.canonical || DEFAULT_CANONICAL)
}

export function resetSEO(): void {
  document.title = DEFAULT_TITLE
  setMeta('description', DEFAULT_DESC)
  setOG('og:title', DEFAULT_TITLE)
  setOG('og:description', DEFAULT_DESC)
  setOG('og:url', DEFAULT_CANONICAL)
  setCanonical(DEFAULT_CANONICAL)
}