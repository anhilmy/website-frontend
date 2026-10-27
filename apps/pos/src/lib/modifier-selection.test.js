import assert from 'node:assert/strict'
import test from 'node:test'
import {
  clearSelection,
  selectedCount,
  toggleSelection,
} from './modifier-selection.js'

const temperature = {
  id: 1,
  selectionType: 'SINGLE',
  minSelect: 1,
  maxSelect: 1,
  options: [
    { id: 1, name: 'Hot', available: true },
    { id: 2, name: 'Iced', available: true },
  ],
}

const extras = {
  id: 2,
  selectionType: 'MULTI',
  minSelect: 0,
  maxSelect: 3,
  options: [
    { id: 3, name: 'Extra shot', available: true },
    { id: 4, name: 'Oat milk', available: true },
    { id: 5, name: 'Vanilla', available: true },
    { id: 6, name: 'Sold out', available: false },
  ],
}

test('choosing a SINGLE option keeps MULTI selections from other groups', () => {
  const selected = toggleSelection([3], temperature, temperature.options[0])
  assert.deepEqual(selected, [3, 1])
})

test('replacing a SINGLE choice only touches that group', () => {
  const selected = toggleSelection([3, 1], temperature, temperature.options[1])
  assert.deepEqual(selected, [3, 2])
})

test('deselecting a SINGLE option clears only its group', () => {
  const selected = toggleSelection([3, 1], temperature, temperature.options[0])
  assert.deepEqual(selected, [3])
})

test('MULTI stops at maxSelect and ignores unavailable options', () => {
  const atMax = [3, 4, 5]
  assert.deepEqual(toggleSelection(atMax, extras, extras.options[3]), atMax)
  assert.deepEqual(toggleSelection([], extras, extras.options[3]), [])
})

test('selectedCount and clearSelection are group-scoped', () => {
  assert.equal(selectedCount([3, 1], extras), 1)
  assert.deepEqual(clearSelection([3, 1, 2], temperature), [3])
})
