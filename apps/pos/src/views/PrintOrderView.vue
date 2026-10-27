<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { orders } from '../lib/resources'
import { money, dateTime } from '../lib/format'

const route = useRoute()
const router = useRouter()

const order = ref(null)
const loading = ref(true)
const error = ref('')

const mode = computed(() => (route.query.mode === 'receipt' ? 'receipt' : 'bill'))
const format = computed(() => (route.query.format === 'a4' ? 'a4' : '80mm'))
const isReceipt = computed(() => mode.value === 'receipt')
const change = computed(
  () => Number(order.value?.paymentAmount || 0) - Number(order.value?.totalAmount || 0),
)
const activeItems = computed(() =>
  (order.value?.items || []).filter((line) => line.status !== 'VOIDED'),
)
const subtotal = computed(() => {
  const stored = Number(order.value?.subtotalAmount || 0)
  if (stored) return stored
  return activeItems.value.reduce(
    (sum, line) => sum + Number(line.totalPrice ?? line.unitPrice * line.quantity),
    0,
  )
})
const refundedAmount = computed(() => Number(order.value?.refundedAmount || 0))
const netAmount = computed(
  () => Number(order.value?.totalAmount || 0) - refundedAmount.value,
)
const footerText = computed(() => {
  switch (order.value?.status) {
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
})

onMounted(async () => {
  try {
    order.value = await orders.get(route.params.id)
    document.title = `${isReceipt.value ? 'Receipt' : 'Bill'} #${String(order.value.id).padStart(3, '0')}`
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

function print() {
  window.print()
}

function back() {
  if (window.history.length > 1) router.back()
  else if (order.value) router.push({ name: 'order', params: { id: order.value.id } })
  else router.push({ name: 'terminal' })
}

function setMode(next) {
  router.replace({ query: { ...route.query, mode: next } })
}

function setFormat(next) {
  router.replace({ query: { ...route.query, format: next } })
}

let pageStyle = null
function applyPageSize(value) {
  if (!pageStyle) {
    pageStyle = document.createElement('style')
    document.head.appendChild(pageStyle)
  }
  pageStyle.textContent = `@page { size: ${value === 'a4' ? 'A4' : '80mm auto'}; margin: 6mm; }`
}

watch(format, applyPageSize, { immediate: true })
onUnmounted(() => pageStyle?.remove())
</script>

<template>
  <div class="print-page min-h-screen bg-paper-2 px-4 py-8">
    <div class="print-toolbar mx-auto max-w-[820px] flex flex-wrap items-center gap-2 mb-4">
      <button class="btn btn-sm" @click="back">← Back</button>
      <div class="flex gap-1">
        <button
          class="btn btn-sm"
          :class="{ 'btn-active': mode === 'bill' }"
          @click="setMode('bill')"
        >
          Bill
        </button>
        <button
          class="btn btn-sm"
          :class="{ 'btn-active': mode === 'receipt' }"
          @click="setMode('receipt')"
        >
          Receipt
        </button>
      </div>
      <div class="flex gap-1">
        <button
          class="btn btn-sm"
          :class="{ 'btn-active': format === '80mm' }"
          @click="setFormat('80mm')"
        >
          80mm
        </button>
        <button
          class="btn btn-sm"
          :class="{ 'btn-active': format === 'a4' }"
          @click="setFormat('a4')"
        >
          A4
        </button>
      </div>
      <button class="btn-ember btn-sm ml-auto" :disabled="!order" @click="print">Print</button>
    </div>

    <p v-if="loading" class="text-center text-sm text-ink-3">Loading order…</p>
    <p v-else-if="error" class="text-center text-sm text-ember">{{ error }}</p>

    <div
      v-else-if="order"
      class="print-sheet mx-auto bg-paper shadow-lift"
      :class="format === 'a4' ? 'sheet-a4' : 'sheet-80'"
    >
      <div class="recv px-6 py-7">
        <header class="text-center">
          <div class="eyebrow">Counter · Terminal 01</div>
          <h1 class="display text-2xl mt-2">ChocoCaffe</h1>
          <p class="mono text-[10px] tracking-[0.2em] text-ink-3 mt-1">
            EST. 2026 · JAKARTA
          </p>
          <div class="dashed my-4"></div>
          <div class="flex items-center justify-between mono text-[11px] tracking-widest">
            <span>{{ isReceipt ? 'RECEIPT' : 'BILL' }}</span>
            <span>#{{ String(order.id).padStart(3, '0') }}</span>
          </div>
        </header>

        <div class="dashed my-4"></div>

        <dl class="mono text-[11px] grid grid-cols-2 gap-y-1.5">
          <dt class="text-ink-3">DATE</dt>
          <dd class="text-right">{{ dateTime(order.createdAt) }}</dd>
          <dt class="text-ink-3">CUSTOMER</dt>
          <dd class="text-right">{{ order.customerInfo || 'Walk-in' }}</dd>
          <dt class="text-ink-3">CASHIER</dt>
          <dd class="text-right">{{ order.cashier?.username }}</dd>
          <template v-if="isReceipt">
            <dt class="text-ink-3">PAYMENT</dt>
            <dd class="text-right">{{ order.paymentMethod || '—' }}</dd>
          </template>
          <template v-if="isReceipt && order.paymentReference">
            <dt class="text-ink-3">REFERENCE</dt>
            <dd class="text-right">{{ order.paymentReference }}</dd>
          </template>
        </dl>

        <div class="dashed my-4"></div>

        <table class="w-full text-[12px]">
          <thead>
            <tr class="mono text-[10px] uppercase tracking-widest text-ink-3">
              <th class="text-left font-normal pb-2">Item</th>
              <th class="text-center font-normal pb-2">Qty</th>
              <th class="text-right font-normal pb-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="line in activeItems" :key="line.id">
              <td class="py-1.5 pr-2">{{ line.menuItem?.name }}</td>
              <td class="text-center mono">{{ line.quantity }}</td>
              <td class="text-right mono whitespace-nowrap">{{ money(line.totalPrice) }}</td>
            </tr>
          </tbody>
        </table>

        <div class="dashed my-4"></div>

        <div class="space-y-1.5">
          <div class="flex justify-between text-[12px]">
            <span>Subtotal</span><span class="mono">{{ money(subtotal) }}</span>
          </div>
          <div
            v-for="c in order.charges || []"
            :key="c.id"
            class="flex justify-between text-[12px]"
          >
            <span>{{ c.label }}</span><span class="mono">{{ money(c.computedAmount) }}</span>
          </div>
          <div v-if="!order.charges?.length" class="flex justify-between text-[12px]">
            <span>Tax</span><span class="mono">{{ money(order.taxAmount) }}</span>
          </div>
          <div class="flex justify-between items-baseline pt-2 border-t border-line mt-2">
            <span class="display text-base">Total</span>
            <span class="mono text-xl font-bold">{{ money(order.totalAmount) }}</span>
          </div>
          <template v-if="refundedAmount > 0">
            <div class="flex justify-between text-[12px]">
              <span>Refunded</span><span class="mono">−{{ money(refundedAmount) }}</span>
            </div>
            <div class="flex justify-between text-[12px] font-medium">
              <span>Net</span><span class="mono">{{ money(netAmount) }}</span>
            </div>
          </template>
        </div>

        <template v-if="isReceipt">
          <div class="dashed my-4"></div>
          <div class="space-y-1.5 text-[12px]">
            <div class="flex justify-between">
              <span>Tendered</span><span class="mono">{{ money(order.paymentAmount) }}</span>
            </div>
            <div v-if="change > 0" class="flex justify-between">
              <span>Change</span><span class="mono">{{ money(change) }}</span>
            </div>
          </div>
        </template>

        <div class="dashed my-4"></div>
        <p class="text-center mono text-[10px] tracking-[0.2em] text-ink-3">
          {{ footerText }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sheet-80 {
  width: 80mm;
  max-width: 100%;
}
.sheet-a4 {
  width: 190mm;
  max-width: 100%;
}
</style>
