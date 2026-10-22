import { reactive } from 'vue'
import { api, setToken, getToken, setUnauthorizedHandler } from './api'

const storedUser = localStorage.getItem('pos.user')

export const session = reactive({
  token: getToken() || null,
  user: storedUser ? JSON.parse(storedUser) : null,
})

export function isAuthenticated() {
  return Boolean(session.token)
}

export function isManager() {
  return session.user?.role === 'MANAGER'
}

export async function login(username, password) {
  const data = await api.post('/auth/login', { username, password }, { auth: false })
  session.token = data.token
  session.user = { id: data.userId, username: data.username, role: data.role }
  setToken(data.token)
  localStorage.setItem('pos.user', JSON.stringify(session.user))
  return data
}

export function clearSession() {
  session.token = null
  session.user = null
  setToken(null)
  localStorage.removeItem('pos.user')
}

export async function logout() {
  try {
    if (session.token) await api.post('/auth/logout')
  } catch {
    // Best-effort; clear locally regardless.
  }
  clearSession()
}

// Any 401 from the API drops the local session.
setUnauthorizedHandler(clearSession)
