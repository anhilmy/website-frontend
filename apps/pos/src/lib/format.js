const currency = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function money(value) {
  const n = typeof value === 'number' ? value : Number(value ?? 0)
  return currency.format(Number.isFinite(n) ? n : 0)
}

/** Explicit sign for deltas: +Rp 5.000 / −Rp 5.000 / Rp 0. */
export function signedMoney(value) {
  const n = typeof value === 'number' ? value : Number(value ?? 0)
  if (!Number.isFinite(n) || n === 0) return money(0)
  return `${n > 0 ? '+' : '−'}${money(Math.abs(n))}`
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
  // orders
  DRAFT: 'ink',
  IN_PROGRESS: 'mustard',
  COMPLETED: 'sage',
  CANCELLED: 'ember',
  PARTIALLY_REFUNDED: 'mustard',
  REFUNDED: 'teal',
  AMENDED: 'muted',
  // tables
  AVAILABLE: 'sage',
  RESERVED: 'mustard',
  OCCUPIED: 'ember',
  JOINED: 'teal',
  CLEANING: 'muted',
  OUT_OF_SERVICE: 'muted',
}

export function statusTone(status) {
  return STATUS_TONE[status] || 'ink'
}
