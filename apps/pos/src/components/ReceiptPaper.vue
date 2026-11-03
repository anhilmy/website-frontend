<script setup>
import { computed } from 'vue'
import { money, signedMoney } from '../lib/format'
import { documentView } from '../lib/document'

const props = defineProps({
  order: { type: Object, required: true },
  mode: { type: String, default: 'bill' },
  settings: { type: Object, default: () => ({}) },
  showVoided: { type: Boolean, default: false },
  showRefunds: { type: Boolean, default: false },
  showUnitPrice: { type: Boolean, default: false },
})

const view = computed(() => documentView(props.order, props.mode, props.settings))
const lines = computed(() =>
  (props.order.items || []).filter(
    (line) => props.showVoided || line.status !== 'VOIDED',
  ),
)
const subtotal = computed(() => {
  const stored = Number(props.order.subtotalAmount || 0)
  if (stored) return stored
  return activeLines.value.reduce(
    (sum, line) => sum + Number(line.totalPrice ?? line.unitPrice * line.quantity),
    0,
  )
})
const activeLines = computed(() => lines.value.filter((line) => line.status !== 'VOIDED'))
const refundedAmount = computed(() => Number(props.order.refundedAmount || 0))
const netAmount = computed(
  () => Number(props.order.totalAmount || 0) - refundedAmount.value,
)
const change = computed(
  () => Number(props.order.paymentAmount || 0) - Number(props.order.totalAmount || 0),
)
</script>

<template>
  <div class="recv px-6 py-7">
    <header class="text-center">
      <div v-if="view.systemName" class="eyebrow">{{ view.systemName }}</div>
      <h1 class="display text-2xl mt-2">{{ view.companyName || view.systemName }}</h1>
      <div class="mono text-[11px] tracking-[0.24em] text-ink-3 mt-1">
        {{ view.receipt ? 'RECEIPT' : 'BILL' }}
      </div>
      <p v-if="view.location" class="mono text-[10px] tracking-[0.2em] text-ink-3 mt-1">
        {{ view.location }}
      </p>
      <p v-if="view.taxNumber" class="mono text-[10px] text-ink-3 mt-0.5">
        NPWP {{ view.taxNumber }}
      </p>
      <div class="dashed my-4"></div>
      <div class="flex items-center justify-between mono text-[11px] tracking-widest">
        <span class="text-ink-3">{{ view.receipt ? 'RECEIPT NO' : 'BILL NO' }}</span>
        <span>{{ view.receiptNumber }}</span>
      </div>
    </header>

    <div v-if="view.meta.length" class="mt-4 text-center mono text-[11px] text-ink-2">
      {{ view.meta.join(' · ') }}
    </div>

    <div class="dashed my-4"></div>

    <ul class="space-y-3">
      <li
        v-for="line in lines"
        :key="line.id"
        class="flex items-baseline gap-3 text-sm"
        :class="{ 'line-through text-ink-3': line.status === 'VOIDED' }"
      >
        <span class="mono text-ink-3 w-8">{{ line.quantity }}×</span>
        <span class="flex-1 min-w-0">
          {{ line.menuItem?.name }}
          <span
            v-if="line.modifiers?.length"
            class="block mono text-[10px] text-ink-3 mt-0.5"
          >
            <span v-for="(m, idx) in line.modifiers" :key="m.id || idx">
              {{ m.groupName }}: {{ m.optionName }}<template v-if="Number(m.priceDelta)">
                ({{ signedMoney(m.priceDelta) }})</template><template
                v-if="idx < line.modifiers.length - 1"
              >
                · </template>
            </span>
          </span>
          <span v-if="line.note" class="block text-[11px] italic text-ink-3 mt-0.5">
            “{{ line.note }}”
          </span>
          <span
            v-if="line.status === 'VOIDED'"
            class="block mono text-[10px] tracking-widest text-ember mt-0.5 no-underline"
          >
            VOIDED · {{ line.voidReason }}
          </span>
        </span>
        <span v-if="showUnitPrice" class="mono text-[11px] text-ink-3">
          {{ money(line.unitPrice) }}
        </span>
        <span class="mono w-20 text-right">{{ money(line.totalPrice) }}</span>
        <span v-if="$slots['line-actions']" class="flex gap-1 no-underline">
          <slot name="line-actions" :line="line" />
        </span>
      </li>
    </ul>

    <div class="dashed my-4"></div>

    <div class="space-y-1.5">
      <div class="flex justify-between text-[12px] text-ink-2">
        <span>Subtotal</span><span class="mono">{{ money(subtotal) }}</span>
      </div>
      <div
        v-for="c in order.charges || []"
        :key="c.id"
        class="flex justify-between text-[12px] text-ink-2"
      >
        <span>{{ c.label }}</span><span class="mono">{{ money(c.computedAmount) }}</span>
      </div>
      <div v-if="!order.charges?.length" class="flex justify-between text-[12px] text-ink-2">
        <span>Tax</span><span class="mono">{{ money(order.taxAmount) }}</span>
      </div>
      <div class="flex justify-between items-baseline pt-2 border-t hairline mt-2">
        <span class="display text-base">Total</span>
        <span class="mono text-xl font-bold">{{ money(order.totalAmount) }}</span>
      </div>
      <template v-if="refundedAmount > 0">
        <div class="flex justify-between text-[12px] text-ember">
          <span>Refunded</span><span class="mono">−{{ money(refundedAmount) }}</span>
        </div>
        <div class="flex justify-between text-[12px] font-medium">
          <span>Net</span><span class="mono">{{ money(netAmount) }}</span>
        </div>
      </template>
      <div
        v-if="view.showPayment"
        class="flex justify-between items-baseline pt-2 border-t hairline mt-2"
      >
        <span class="mono text-[11px] tracking-widest uppercase">
          {{ view.paymentMethod }}
        </span>
        <span class="mono text-[13px]">{{ money(view.paymentAmount) }}</span>
      </div>
      <div v-if="view.showReference" class="flex justify-between text-[12px]">
        <span class="text-ink-3">Reference</span>
        <span class="mono">{{ view.reference }}</span>
      </div>
      <template v-if="view.showTendered">
        <div class="flex justify-between text-[12px]">
          <span>Tendered</span><span class="mono">{{ money(order.paymentAmount) }}</span>
        </div>
        <div v-if="view.showChange && change > 0" class="flex justify-between text-[12px]">
          <span>Change</span><span class="mono">{{ money(change) }}</span>
        </div>
      </template>
    </div>

    <template v-if="showRefunds && order.refunds?.length">
      <div class="dashed my-4"></div>
      <div class="eyebrow mb-3">Refunds</div>
      <ul class="space-y-2">
        <li
          v-for="r in order.refunds"
          :key="r.id"
          class="flex items-baseline justify-between gap-3 text-sm"
        >
          <span class="min-w-0">
            <span class="mono text-ink-3">{{ r.quantity }}×</span>
            {{ r.reason }}
            <span class="mono text-[10px] text-ink-3 block">
              {{ r.createdBy }} · {{ r.paymentMethod }}
            </span>
          </span>
          <span class="mono text-ember whitespace-nowrap">−{{ money(r.amount) }}</span>
        </li>
      </ul>
    </template>

    <div class="dashed my-4"></div>
    <p class="text-center mono text-[10px] tracking-[0.2em] text-ink-3">
      {{ view.statusFooter }}
    </p>
    <p v-if="view.footer" class="text-center mono text-[10px] tracking-[0.15em] text-ink-3 mt-1.5">
      {{ view.footer }}
    </p>
  </div>
</template>
