const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

export function money(value) {
  const n = typeof value === 'number' ? value : Number(value ?? 0)
  return currency.format(Number.isFinite(n) ? n : 0)
}

export function dateTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function dateOnly(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function timeOnly(value) {
  if (!value) return '—'
  return new Date(value).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

const STATUS_TONE = {
  DRAFT: 'ink',
  IN_PROGRESS: 'mustard',
  COMPLETED: 'sage',
  CANCELLED: 'ember',
}

export function statusTone(status) {
  return STATUS_TONE[status] || 'ink'
}
