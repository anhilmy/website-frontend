/** Build a query string; arrays become repeated keys (`status=A&status=B`). */
export function buildQuery(path, params = {}) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item === undefined || item === null || item === '') continue
        search.append(key, String(item))
      }
      continue
    }
    search.append(key, String(value))
  }
  const qs = search.toString()
  return `${path}${qs ? `?${qs}` : ''}`
}
