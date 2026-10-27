/** Pure selection rules for the modifier picker (kept separate for tests). */

export function selectedCount(selected, group) {
  const ids = new Set((group.options || []).map((option) => option.id))
  return selected.filter((id) => ids.has(id)).length
}

export function clearSelection(selected, group) {
  const ids = new Set((group.options || []).map((option) => option.id))
  return selected.filter((id) => !ids.has(id))
}

/**
 * Toggle one option while only touching that option's own group. A SINGLE group replaces its
 * own choice (or clears it) and never disturbs selections in other groups.
 */
export function toggleSelection(selected, group, option) {
  if (!option?.available) return selected

  const groupIds = new Set((group.options || []).map((o) => o.id))
  if (group.selectionType === 'SINGLE') {
    const wasSelected = selected.includes(option.id)
    const next = selected.filter((id) => !groupIds.has(id))
    if (!wasSelected) next.push(option.id)
    return next
  }

  if (selected.includes(option.id)) {
    return selected.filter((id) => id !== option.id)
  }
  if (selectedCount(selected, group) >= Number(group.maxSelect ?? 1)) {
    return selected
  }
  return [...selected, option.id]
}
