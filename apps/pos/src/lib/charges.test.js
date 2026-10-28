import assert from 'node:assert/strict'
import test from 'node:test'
import { evaluateCharges } from './charges.js'

const charge = (overrides) => ({
  code: 'TEST',
  label: 'Test',
  calcType: 'PERCENTAGE',
  value: 0.1,
  basis: 'SUBTOTAL',
  sortOrder: 10,
  taxable: false,
  isTax: false,
  ...overrides,
})

test('evaluates in sort order and rounds each charge once', () => {
  const result = evaluateCharges(
    [
      charge({ code: 'TAX', value: 0.1, basis: 'RUNNING_TOTAL', sortOrder: 20, isTax: true }),
      charge({ code: 'SERVICE', value: 0.1, sortOrder: 10, taxable: true }),
    ],
    100,
  )

  assert.deepEqual(
    result.map((c) => [c.code, c.computedAmount]),
    [
      ['SERVICE', 10],
      ['TAX', 11],
    ],
  )
})

test('applies a fixed and a percentage discount as negative charges', () => {
  const result = evaluateCharges(
    [
      charge({ code: 'FIXED', calcType: 'FIXED', value: -5 }),
      charge({ code: 'PCT', value: -0.1 }),
    ],
    100,
  )

  assert.deepEqual(
    result.map((c) => c.computedAmount),
    [-5, -10],
  )
})

test('taxable discounts reduce a later running-total base', () => {
  const result = evaluateCharges(
    [
      charge({ code: 'DISC', calcType: 'FIXED', value: -10, taxable: true, sortOrder: 10 }),
      charge({ code: 'TAX', value: 0.1, basis: 'RUNNING_TOTAL', sortOrder: 20, isTax: true }),
    ],
    100,
  )

  assert.equal(result[1].computedAmount, 9)
})
