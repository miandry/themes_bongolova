/**
 * Normalizes API fields that may be null, strings, or arrays (Drupal bongolava_job).
 */

export function asList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean)
  }
  if (typeof value === 'string' && value.trim()) {
    return value.split(/[,;]/).map((s) => s.trim()).filter(Boolean)
  }
  return []
}

export interface EducationItem {
  degree: string
  school: string
  year: string
}

export function asEducationList(value: unknown): EducationItem[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'object' && item !== null) {
          const o = item as Record<string, unknown>
          return {
            degree: String(o.degree ?? o.title ?? ''),
            school: String(o.school ?? o.institution ?? ''),
            year: String(o.year ?? ''),
          }
        }
        return { degree: String(item), school: '', year: '' }
      })
      .filter((e) => e.degree || e.school)
  }
  if (typeof value === 'string' && value.trim()) {
    return [{ degree: value.trim(), school: '', year: '' }]
  }
  return []
}

export function personInitials(first?: unknown, last?: unknown): string {
  const f = String(first ?? '').trim()
  const l = String(last ?? '').trim()
  const a = f[0] ?? ''
  const b = l[0] ?? ''
  return (a + b).toUpperCase() || '??'
}

export function displayText(value: unknown, fallback = '—'): string {
  if (value === null || value === undefined || value === '') {
    return fallback
  }
  return String(value)
}

// Fonction pour séparer les données par saut de ligne
export function splitByNewline(data: string | null | undefined): string[] {
  if (!data) return []
  return data.split('\n')
    .map(item => item.trim())
    .filter(item => item.length > 0)
}