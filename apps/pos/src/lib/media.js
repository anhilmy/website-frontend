/** Resolve a stored image URL against the API origin. */
export function resolveMediaUrl(value, apiBase = '') {
  if (!value) return ''
  if (/^(https?:|data:|blob:)/i.test(value)) return value

  const origin = apiOrigin(apiBase)
  let path = value
  if (!path.startsWith('/')) {
    path = path.startsWith('menu/') ? `/media/${path}` : `/${path}`
  }
  return `${origin}${path}`
}

function apiOrigin(apiBase) {
  if (!apiBase || !/^https?:\/\//i.test(apiBase)) return ''
  try {
    return new URL(apiBase).origin
  } catch {
    return ''
  }
}
