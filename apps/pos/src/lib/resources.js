import { api } from './api'

/** Endpoint wrappers grouped by resource. */
export const auth = {
  me: () => api.get('/auth/me'),
}

export const menu = {
  categories: () => api.get('/menu/categories', { auth: false }),
  items: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
    ).toString()
    return api.get(`/menu/items${qs ? `?${qs}` : ''}`, { auth: false })
  },
  item: (id) => api.get(`/menu/items/${id}`, { auth: false }),
}

export const categories = {
  list: (active) => api.get(`/categories${active === undefined ? '' : `?active=${active}`}`),
  create: (body) => api.post('/categories', body),
  update: (id, body) => api.put(`/categories/${id}`, body),
  deactivate: (id) => api.del(`/categories/${id}`),
}

export const items = {
  list: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
    ).toString()
    return api.get(`/items${qs ? `?${qs}` : ''}`)
  },
  create: (body) => api.post('/items', body),
  update: (id, body) => api.put(`/items/${id}`, body),
  deactivate: (id) => api.del(`/items/${id}`),
}

export const orders = {
  create: (customerInfo) => api.post('/orders', { customerInfo }),
  list: (params = {}) => api.get(withQuery('/orders', params)),
  get: (id) => api.get(`/orders/${id}`),
  addItem: (id, menuItemId, quantity) =>
    api.post(`/orders/${id}/items`, { menuItemId, quantity }),
  updateItem: (id, itemId, quantity) =>
    api.put(`/orders/${id}/items/${itemId}`, { quantity }),
  removeItem: (id, itemId) => api.del(`/orders/${id}/items/${itemId}`),
  complete: (id, paymentMethod, paymentAmount) =>
    api.post(`/orders/${id}/complete`, { paymentMethod, paymentAmount }),
  cancel: (id) => api.post(`/orders/${id}/cancel`),
}

const withQuery = (path, params = {}) => {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  ).toString()
  return `${path}${qs ? `?${qs}` : ''}`
}

export const tables = {
  list: (params = {}) => api.get(withQuery('/tables', params)),
  get: (id) => api.get(`/tables/${id}`),
  create: (body) => api.post('/tables', body),
  update: (id, body) => api.put(`/tables/${id}`, body),
  remove: (id) => api.del(`/tables/${id}`),
  setStatus: (id, status) => api.patch(`/tables/${id}/status`, { status }),
  open: (id, customerInfo) =>
    api.post(`/tables/${id}/open`, customerInfo ? { customerInfo } : {}),
  assign: (id, transactionId) => api.post(`/tables/${id}/assign`, { transactionId }),
  release: (id) => api.post(`/tables/${id}/release`),
  join: (id, targetTableId) => api.post(`/tables/${id}/join`, { targetTableId }),
  unjoin: (id) => api.post(`/tables/${id}/unjoin`),
}

export const users = {
  list: () => api.get('/users'),
  create: (body) => api.post('/users', body),
}
