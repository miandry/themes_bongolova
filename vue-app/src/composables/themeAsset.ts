/**
 * Resolves a public/ asset path to the correct URL in both
 * standalone Vite dev mode (base = '/') and Drupal production
 * (base = '/sites/bongolava/themes/bongolava/dist').
 *
 * Usage:  themeAsset('/logo.jpg')  →  '/sites/…/dist/logo.jpg'
 */
export function themeAsset(path: string): string {
  const raw =
    (typeof window !== 'undefined' && window.__bongolavaDistUrl) ||
    import.meta.env.BASE_URL ||
    '/'
  const base = raw.replace(/\/$/, '')
  const clean = path.replace(/^\//, '')
  if (!base || base === '.' || base === './') {
    return `./${clean}`
  }
  return `${base}/${clean}`
}
