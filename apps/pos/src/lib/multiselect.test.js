import test from 'node:test'
import assert from 'node:assert/strict'
import { nextActiveIndex, selectionLabel, toggleValue } from './multiselect.js'

test('toggleValue adds and removes without mutating the original', () => {
  const original = [1]
  const added = toggleValue(original, 2)
  assert.deepEqual(original, [1])
  assert.deepEqual(added, [1, 2])
  assert.deepEqual(toggleValue(added, 1), [2])
})

test('selectionLabel describes empty, one, and many selections', () => {
  assert.equal(selectionLabel([], 'statuses'), 'All statuses')
  assert.equal(selectionLabel([1], 'statuses'), '1 selected')
  assert.equal(selectionLabel([1, 2], 'statuses'), '2 selected')
  assert.equal(selectionLabel([], 'statuses', 'Any status'), 'Any status')
})

test('nextActiveIndex wraps in both directions', () => {
  assert.equal(nextActiveIndex(-1, 3, 1), 0)
  assert.equal(nextActiveIndex(-1, 3, -1), 2)
  assert.equal(nextActiveIndex(2, 3, 1), 0)
  assert.equal(nextActiveIndex(0, 3, -1), 2)
  assert.equal(nextActiveIndex(0, 0, 1), -1)
})
