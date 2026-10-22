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

export const api = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  del: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
}

export const ApiError = Error
