/**
 * Mirrors TransactionService.recalcTotals: ordered charges, each rounded once, with
 * SUBTOTAL / RUNNING_TOTAL bases. Negative values are discounts.
 */
export function evaluateCharges(definitions, subtotal) {
  let runningBase = Number(subtotal) || 0
  return [...definitions]
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((definition) => {
      const base =
        definition.basis === 'RUNNING_TOTAL' ? runningBase : Number(subtotal) || 0
      const value = Number(definition.value) || 0
      const raw = definition.calcType === 'FIXED' ? value : base * value
      const amount = (Math.sign(raw) * Math.round(Math.abs(raw) * 100)) / 100
      if (definition.taxable) runningBase += amount
      return { ...definition, computedAmount: amount }
    })
}
