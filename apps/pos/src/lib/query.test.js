import test from 'node:test'
import assert from 'node:assert/strict'
import { buildQuery } from './query.js'

test('arrays become repeated keys and empty values are dropped', () => {
  assert.equal(
    buildQuery('/orders', {
      status: ['COMPLETED', 'REFUNDED'],
      cashierId: [1, 2],
      from: '',
      page: 1,
      missing: undefined,
    }),
    '/orders?status=COMPLETED&status=REFUNDED&cashierId=1&cashierId=2&page=1',
  )
})

test('empty arrays produce no query string', () => {
  assert.equal(buildQuery('/orders', { status: [], cashierId: null }), '/orders')
})

test('commas inside a single value are preserved', () => {
  assert.equal(buildQuery('/orders', { status: 'COMPLETED,REFUNDED' }), '/orders?status=COMPLETED%2CREFUNDED')
})
