/**
 * Thin API client for the POS backend.
 *
 * Base URL comes from VITE_API_BASE_URL, defaulting to the local backend.
 * Every backend response is the envelope { success, data, message, error, timestamp };
 * this module unwraps `data` and throws an Error carrying { status, code } on failure.
 */
const BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4567/api/v1').replace(/\/$/, '')

let onUnauthorized = null

export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn
}

export function getToken() {
  return localStorage.getItem('pos.token')
}

export function setToken(token) {
  if (token) localStorage.setItem('pos.token', token)
  else localStorage.removeItem('pos.token')
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  let res
  try {
    res = await fetch(BASE + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch (networkError) {
    const err = new Error('Cannot reach the API. Is the backend running?')
    err.status = 0
    err.cause = networkError
    throw err
  }

  const text = await res.text()
  let payload = null
  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = null
    }
  }

  if (res.status === 401) {
    if (onUnauthorized) onUnauthorized()
  }

  if (!res.ok || (payload && payload.success === false)) {
    const err = new Error(payload?.error?.message || res.statusText || 'Request failed')
    err.status = res.status
    err.code = payload?.error?.code
    throw err
  }

  return payload ? payload.data : null
}

async function download(path, filename) {
  const headers = {}
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(BASE + path, { headers })
  if (!res.ok) {
    let message = res.statusText || 'Download failed'
    try {
      const payload = await res.json()
      message = payload?.error?.message || message
    } catch {
      // Non-JSON error body; keep the status text.
    }
    const err = new Error(message)
    err.status = res.status
    throw err
  }

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  del: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
  download,
}

export const ApiError = Error
