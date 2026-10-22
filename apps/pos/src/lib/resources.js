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
  list: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
    ).toString()
    return api.get(`/orders${qs ? `?${qs}` : ''}`)
  },
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

export const users = {
  list: () => api.get('/users'),
  create: (body) => api.post('/users', body),
}
