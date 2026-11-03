import test from 'node:test'
import assert from 'node:assert/strict'
import {
  documentView,
  formatReceiptNumber,
  formatTokens,
  validateFormat,
} from './document.js'

const settings = {
  systemName: 'Counter',
  companyName: 'ChocoCaffe',
  location: 'Jakarta',
  taxNumber: '01.234',
  receiptNumberFormat: '{:year}{:month}-{:order_no}',
  receiptNumberPadding: 4,
  showSystemName: true,
  showCompanyName: true,
  showLocation: true,
  showTaxNumber: true,
  showDate: true,
  showCustomer: true,
  showCashier: true,
  showPaymentMethod: true,
  showReference: true,
  showTendered: true,
  showChange: true,
  showFooter: true,
  receiptFooter: 'Thanks',
  billFooter: 'Please pay',
}

const order = {
  id: 7,
  receiptNumber: '202610-0042',
  createdAt: '2026-10-29T10:15:00',
  customerInfo: 'Ada',
  cashier: { username: 'manager' },
  status: 'COMPLETED',
  totalAmount: 34600,
  paymentAmount: 50000,
  paymentMethod: 'CASH',
  paymentReference: 'R-1',
  charges: [],
}

test('tokens expand date, year, month, and padded order number', () => {
  assert.equal(
    formatTokens('{:year}{:month}-{:order_no}', {
      date: new Date(2026, 9, 29),
      orderNumber: 42,
      padding: 4,
    }),
    '202610-0042',
  )
  assert.equal(
    formatTokens('INV/{:date}/{:order_no}', {
      date: new Date(2026, 0, 5),
      orderNumber: 3,
      padding: 3,
    }),
    'INV/20260105/003',
  )
})

test('format validation requires order_no and rejects unknown tokens', () => {
  assert.equal(validateFormat('{:year}-{:order_no}'), '')
  assert.match(validateFormat('{:year}'), /order_no/)
  assert.match(validateFormat('{:year}-{:order_no}-{:day}'), /Unknown token/)
})

test('stored receipt numbers win over current settings', () => {
  assert.equal(formatReceiptNumber(order, settings), '202610-0042')
  assert.equal(formatReceiptNumber({ id: 7 }, settings), '#007')
})

test('document view removes meta labels and keeps values only', () => {
  const view = documentView(order, 'receipt', settings)
  assert.deepEqual(view.meta, ['29 Oct, 10:15', 'Ada', 'manager'])
  assert.equal(view.taxNumber, '01.234')
  assert.equal(view.footer, 'Thanks')
  assert.equal(view.showPayment, true)
  assert.equal(view.showTendered, true)
})

test('bills never expose tendered or change and use the bill footer', () => {
  const view = documentView(order, 'bill', settings)
  assert.equal(view.showTendered, false)
  assert.equal(view.footer, 'Please pay')
})

test('visibility flags hide values and payment group', () => {
  const view = documentView(
    order,
    'receipt',
    { ...settings, showCustomer: false, showPaymentMethod: false },
  )
  assert.deepEqual(view.meta, ['29 Oct, 10:15', 'manager'])
  assert.equal(view.showPayment, false)
  assert.equal(view.showReference, false)
  assert.equal(view.showTendered, false)
})
