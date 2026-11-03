import { dateTime } from './format.js'
import { DEFAULT_SETTINGS } from './settings-defaults.js'

export function validateFormat(format) {
  if (!format || !format.trim()) return 'Format is required'
  if (format.length > 64) return 'Format must be 64 characters or fewer'
  if (!format.includes('{:order_no}')) return 'Format must include {:order_no}'
  const stripped = format
    .replaceAll('{:date}', '')
    .replaceAll('{:year}', '')
    .replaceAll('{:month}', '')
    .replaceAll('{:order_no}', '')
  if (stripped.includes('{') || stripped.includes('}')) {
    return 'Unknown token. Use {:date}, {:year}, {:month}, {:order_no}'
  }
  return ''
}

export function formatTokens(format, { date, orderNumber = 1, padding = 4 } = {}) {
  const value = date ? new Date(date) : new Date()
  const pad = Math.max(1, Math.min(10, Number(padding) || 4))
  return String(format || DEFAULT_SETTINGS.receiptNumberFormat)
    .replaceAll('{:date}', ymd(value))
    .replaceAll('{:year}', String(value.getFullYear()))
    .replaceAll('{:month}', String(value.getMonth() + 1).padStart(2, '0'))
    .replaceAll('{:order_no}', String(orderNumber).padStart(pad, '0'))
}

export function formatReceiptNumber(order, settings = DEFAULT_SETTINGS) {
  if (!order) return ''
  if (order.receiptNumber) return order.receiptNumber
  const id = order.id ?? ''
  return id === '' ? '' : `#${String(id).padStart(3, '0')}`
}

export function statusFooter(status) {
  switch (status) {
    case 'COMPLETED':
      return 'PAID IN FULL · THANK YOU'
    case 'PARTIALLY_REFUNDED':
      return 'PARTIALLY REFUNDED'
    case 'REFUNDED':
      return 'REFUNDED IN FULL'
    case 'CANCELLED':
      return 'CANCELLED'
    case 'AMENDED':
      return 'AMENDED · SEE LINKED BILL'
    default:
      return 'NOT YET PAID · PLEASE SETTLE AT THE COUNTER'
  }
}

export function documentView(order, mode, settings = DEFAULT_SETTINGS) {
  const s = { ...DEFAULT_SETTINGS, ...(settings || {}) }
  const receipt = mode === 'receipt'
  const hasPayment = Boolean(order?.paymentMethod && order?.paymentAmount != null)
  const meta = []
  if (s.showDate) meta.push(dateTime(order?.createdAt))
  if (s.showCustomer) meta.push(order?.customerInfo || 'Walk-in')
  if (s.showCashier) meta.push(order?.cashier?.username || '—')

  return {
    receipt,
    systemName: s.showSystemName ? s.systemName : '',
    companyName: s.showCompanyName ? s.companyName : '',
    location: s.showLocation ? s.location : '',
    taxNumber: s.showTaxNumber ? s.taxNumber : '',
    meta: meta.filter((value) => value && value !== '—'),
    receiptNumber: formatReceiptNumber(order, s),
    showPayment: Boolean(s.showPaymentMethod && order?.paymentMethod),
    paymentMethod: order?.paymentMethod || '',
    paymentAmount: order?.totalAmount || 0,
    showReference: Boolean(
      receipt && s.showReference && s.showPaymentMethod && order?.paymentReference,
    ),
    reference: order?.paymentReference || '',
    showTendered: Boolean(receipt && s.showTendered && s.showPaymentMethod && hasPayment),
    showChange: Boolean(receipt && s.showChange && s.showPaymentMethod && hasPayment),
    footer: s.showFooter ? (receipt ? s.receiptFooter : s.billFooter) : '',
    statusFooter: statusFooter(order?.status),
  }
}

function ymd(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}${month}${day}`
}
