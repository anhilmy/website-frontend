/** Pure helpers for the reusable MultiSelect component. */

export function toggleValue(values, value) {
  const next = Array.isArray(values) ? [...values] : []
  const index = next.indexOf(value)
  if (index >= 0) next.splice(index, 1)
  else next.push(value)
  return next
}

export function selectionLabel(values, label = 'items', placeholder) {
  const count = Array.isArray(values) ? values.length : 0
  if (count === 0) return placeholder || `All ${label}`
  if (count === 1) return '1 selected'
  return `${count} selected`
}

export function nextActiveIndex(current, length, step) {
  if (length <= 0) return -1
  if (current < 0) return step > 0 ? 0 : length - 1
  return (current + step + length) % length
}
