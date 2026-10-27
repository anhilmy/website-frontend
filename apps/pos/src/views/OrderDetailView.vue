<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { orders, paymentMethods } from '../lib/resources'
import { money, dateTime, signedMoney } from '../lib/format'
import { isManager } from '../lib/session'
import StatusTag from '../components/StatusTag.vue'

const route = useRoute()
const router = useRouter()
const manager = isManager()

const order = ref(null)
const loading = ref(true)
const error = ref('')
const notice = ref('')
const busy = ref(false)

const refundOpen = ref(false)
const refundError = ref('')
const methods = ref([])
const refundForm = reactive({
  transactionItemId: null,
  quantity: 1,
  reason: '',
  paymentMethod: '',
})

const items = computed(() => order.value?.items ?? [])
const activeItems = computed(() => items.value.filter((i) => i.status !== 'VOIDED'))
const refundableItems = computed(() =>
  activeItems.value.filter((i) => remainingQty(i) > 0),
)
const subtotal = computed(() =>
  activeItems.value.reduce(
    (s, l) => s + Number(l.totalPrice ?? l.unitPrice * l.quantity),
    0,
  ),
)
const isOpen = computed(() => order.value?.status === 'DRAFT')
const isSettled = computed(() =>
  ['COMPLETED', 'PARTIALLY_REFUNDED', 'REFUNDED'].includes(order.value?.status),
)
const canRefund = computed(
  () =>
    manager &&
    ['COMPLETED', 'PARTIALLY_REFUNDED'].includes(order.value?.status),
)
const canAmend = computed(
  () => order.value?.status === 'CANCELLED' && !order.value?.amendedToId,
)
const refundedAmount = computed(() => Number(order.value?.refundedAmount || 0))
const netAmount = computed(
  () => Number(order.value?.totalAmount || 0) - refundedAmount.value,
)
const selectedRefundLine = computed(() =>
  refundableItems.value.find((i) => i.id === refundForm.transactionItemId),
)
const selectedRefundAmount = computed(() => {
  const line = selectedRefundLine.value
  if (!line) return 0
  const remaining = remainingQty(line)
  const qty = Math.min(Math.max(Number(refundForm.quantity) || 0, 0), remaining)
  if (qty <= 0) return 0

  const subtotal =
    Number(order.value?.subtotalAmount || 0) ||
    activeItems.value.reduce((sum, l) => sum + Number(l.totalPrice || 0), 0)
  const total = Number(order.value?.totalAmount || 0)
  const lineTotal = Number(line.totalPrice || 0)
  const lineTarget = subtotal > 0 ? (lineTotal * total) / subtotal : lineTotal
  const already = (order.value?.refunds || [])
    .filter((r) => r.transactionItemId === line.id)
    .reduce((sum, r) => sum + Number(r.amount), 0)

  const amount =
    qty >= remaining
      ? lineTarget - already
      : subtotal > 0
        ? ((lineTotal * qty) / Number(line.quantity)) * (total / subtotal)
        : (lineTotal * qty) / Number(line.quantity)
  const outstanding = total - Number(order.value?.refundedAmount || 0)
  return Math.max(0, Math.min(amount, outstanding))
})
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
      return 'NOT YET SETTLED'
  }
})

function remainingQty(line) {
  const refunded = (order.value?.refunds ?? [])
    .filter((r) => r.transactionItemId === line.id)
    .reduce((sum, r) => sum + Number(r.quantity), 0)
  return Number(line.quantity) - refunded
}

async function load() {
  loading.value = true
  try {
    order.value = await orders.get(route.params.id)
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function printOrder(mode) {
  if (!order.value) return
  const target = router.resolve({
    name: 'print-order',
    params: { id: order.value.id },
    query: { mode },
  })
  window.open(target.href, '_blank', 'noopener')
}

async function cancel() {
  busy.value = true
  notice.value = ''
  try {
    order.value = await orders.cancel(order.value.id)
  } catch (e) {
    notice.value = e.message
  } finally {
    busy.value = false
  }
}

async function voidLine(line) {
  const reason = window.prompt(`Void ${line.menuItem?.name}? Reason:`, '')
  if (!reason || !reason.trim()) return
  busy.value = true
  notice.value = ''
  try {
    order.value = await orders.voidItem(order.value.id, line.id, reason.trim())
  } catch (e) {
    notice.value = e.message
  } finally {
    busy.value = false
  }
}

function startRefund(line) {
  refundForm.transactionItemId = line.id
  refundForm.quantity = 1
  refundForm.reason = ''
  refundForm.paymentMethod = ''
  refundError.value = ''
  refundOpen.value = true
}

async function submitRefund() {
  if (busy.value || !selectedRefundLine.value) return
  const remaining = remainingQty(selectedRefundLine.value)
  if (remaining <= 0) {
    refundError.value = 'Nothing left to refund on this line'
    return
  }
  if (!refundForm.reason.trim()) {
    refundError.value = 'Reason is required'
    return
  }
  const qty = Math.min(Math.max(1, Number(refundForm.quantity) || 1), remaining)
  refundError.value = ''
  busy.value = true
  try {
    order.value = await orders.refund(order.value.id, {
      transactionItemId: refundForm.transactionItemId,
      quantity: qty,
      reason: refundForm.reason.trim(),
      paymentMethod: refundForm.paymentMethod || null,
    })
    refundOpen.value = false
  } catch (e) {
    refundError.value = e.message
  } finally {
    busy.value = false
  }
}

async function amendOrder() {
  busy.value = true
  notice.value = ''
  try {
    const amended = await orders.amend(order.value.id)
    router.push({ name: 'order', params: { id: amended.id } })
  } catch (e) {
    notice.value = e.message
  } finally {
    busy.value = false
  }
}

onMounted(async () => {
  await load()
  methods.value = await paymentMethods.list(true).catch(() => [])
})
</script>

<template>
  <div class="max-w-2xl">
    <button class="btn btn-sm mb-6" @click="router.push({ name: 'orders' })">← Ledger</button>

    <p v-if="loading" class="text-sm text-ink-3">Loading order…</p>
    <p v-else-if="error" class="text-sm text-ember">{{ error }}</p>

    <template v-else-if="order">
      <div
        v-if="order.amendedFromId || order.amendedToId"
        class="plate-2 px-4 py-3 mb-4 mono text-[11px] tracking-wide flex flex-wrap gap-x-5 gap-y-1"
      >
        <span v-if="order.amendedFromId">
          AMENDS
          <RouterLink
            :to="{ name: 'order', params: { id: order.amendedFromId } }"
            class="text-ember"
          >#{{ String(order.amendedFromId).padStart(3, '0') }}</RouterLink>
        </span>
        <span v-if="order.amendedToId">
          AMENDED BY
          <RouterLink
            :to="{ name: 'order', params: { id: order.amendedToId } }"
            class="text-ember"
          >#{{ String(order.amendedToId).padStart(3, '0') }}</RouterLink>
        </span>
      </div>

      <!-- Receipt -->
      <div class="recv px-8 py-8 shadow-lift rise rise-1">
        <div class="text-center">
          <div class="eyebrow">Counter · Terminal 01</div>
          <h3 class="display text-3xl mt-2">Order #{{ String(order.id).padStart(3, '0') }}</h3>
          <div class="mt-2 flex justify-center"><StatusTag :status="order.status" /></div>
        </div>

        <div class="dashed my-6"></div>

        <dl class="mono text-[12px] grid grid-cols-2 gap-y-2">
          <dt class="text-ink-3">CUSTOMER</dt>
          <dd class="text-right">{{ order.customerInfo || 'Walk-in' }}</dd>
          <dt class="text-ink-3">CASHIER</dt>
          <dd class="text-right">{{ order.cashier?.username }}</dd>
          <dt class="text-ink-3">OPENED</dt>
          <dd class="text-right">{{ dateTime(order.createdAt) }}</dd>
          <dt class="text-ink-3">PAYMENT</dt>
          <dd class="text-right">{{ order.paymentMethod || '—' }}</dd>
          <template v-if="order.paymentReference">
            <dt class="text-ink-3">REFERENCE</dt>
            <dd class="text-right">{{ order.paymentReference }}</dd>
          </template>
        </dl>

        <div class="dashed my-6"></div>

        <ul class="space-y-3">
          <li
            v-for="line in items"
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
              <span
                v-if="line.note"
                class="block text-[11px] italic text-ink-3 mt-0.5"
              >
                “{{ line.note }}”
              </span>
              <span
                v-if="line.status === 'VOIDED'"
                class="block mono text-[10px] tracking-widest text-ember mt-0.5 no-underline"
              >
                VOIDED · {{ line.voidReason }}
              </span>
            </span>
            <span class="mono text-[12px] text-ink-3">{{ money(line.unitPrice) }}</span>
            <span class="mono w-20 text-right">{{ money(line.totalPrice) }}</span>
            <span class="flex gap-1 no-underline">
              <button
                v-if="isOpen && line.status !== 'VOIDED'"
                class="btn btn-ghost btn-sm"
                :disabled="busy"
                @click="voidLine(line)"
              >
                Void
              </button>
              <button
                v-if="canRefund && line.status !== 'VOIDED' && remainingQty(line) > 0"
                class="btn btn-ghost btn-sm"
                :disabled="busy"
                @click="startRefund(line)"
              >
                Refund
              </button>
            </span>
          </li>
        </ul>

        <div class="dashed my-6"></div>

        <div class="space-y-2">
          <div class="flex justify-between text-sm text-ink-2">
            <span>Subtotal</span><span class="mono">{{ money(subtotal) }}</span>
          </div>
          <div
            v-for="c in order.charges || []"
            :key="c.id"
            class="flex justify-between text-sm text-ink-2"
          >
            <span>{{ c.label }}</span><span class="mono">{{ money(c.computedAmount) }}</span>
          </div>
          <div
            v-if="!order.charges?.length"
            class="flex justify-between text-sm text-ink-2"
          >
            <span>Tax</span><span class="mono">{{ money(order.taxAmount) }}</span>
          </div>
          <div class="flex justify-between items-baseline pt-2 border-t hairline mt-2">
            <span class="display text-lg">Total</span>
            <span class="mono text-2xl font-bold">{{ money(order.totalAmount) }}</span>
          </div>
          <template v-if="refundedAmount > 0">
            <div class="flex justify-between text-sm text-ember">
              <span>Refunded</span><span class="mono">−{{ money(refundedAmount) }}</span>
            </div>
            <div class="flex justify-between text-sm font-medium">
              <span>Net</span><span class="mono">{{ money(netAmount) }}</span>
            </div>
          </template>
        </div>

        <template v-if="order.refunds?.length">
          <div class="dashed my-6"></div>
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

        <div class="dashed my-6"></div>
        <div class="text-center mono text-[11px] tracking-[0.2em] text-ink-3">
          {{ footerText }}
        </div>
      </div>

      <!-- Actions -->
      <div class="mt-6 flex flex-wrap gap-3 rise rise-2">
        <button
          v-if="isOpen"
          class="btn-ember"
          :disabled="busy"
          @click="router.push({ name: 'terminal', query: { order: order.id } })"
        >
          Settle at terminal
        </button>
        <button v-if="isOpen" class="btn" :disabled="busy" @click="cancel">Cancel order</button>
        <button v-if="canAmend" class="btn-ember" :disabled="busy" @click="amendOrder">
          Amend bill
        </button>
        <button class="btn" @click="printOrder(isSettled ? 'receipt' : 'bill')">
          {{ isSettled ? 'Print receipt' : 'Print bill' }}
        </button>
        <button v-if="!isOpen" class="btn" @click="router.push({ name: 'terminal' })">
          New order at terminal
        </button>
      </div>

      <p v-if="notice" class="mt-4 text-sm text-ember">{{ notice }}</p>
    </template>

    <!-- Refund dialog -->
    <div
      v-if="refundOpen"
      class="fixed inset-0 z-40 grid place-items-center bg-ink/40 p-4"
      @click.self="refundOpen = false"
    >
      <div class="plate w-full max-w-md p-6 rise">
        <div class="flex items-center justify-between">
          <div class="eyebrow">Refund item</div>
          <button class="btn btn-ghost btn-sm" @click="refundOpen = false">Close</button>
        </div>
        <div class="dashed my-4"></div>
        <div class="space-y-3">
          <div>
            <label class="label">Line</label>
            <select v-model="refundForm.transactionItemId" class="field">
              <option v-for="line in refundableItems" :key="line.id" :value="line.id">
                {{ line.menuItem?.name
                }}{{
                  line.modifiers?.length
                    ? ` (${line.modifiers.map((m) => m.optionName).join(', ')})`
                    : ''
                }} — {{ remainingQty(line) }} remaining
              </option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="label">Quantity</label>
              <input
                v-model.number="refundForm.quantity"
                class="field mono"
                type="number"
                min="1"
                :max="selectedRefundLine ? remainingQty(selectedRefundLine) : 1"
              />
            </div>
            <div>
              <label class="label">Method</label>
              <select v-model="refundForm.paymentMethod" class="field">
                <option value="">Original ({{ order.paymentMethod || '—' }})</option>
                <option v-for="m in methods" :key="m.code" :value="m.code">
                  {{ m.label }}
                </option>
              </select>
            </div>
          </div>
          <div>
            <label class="label">Reason</label>
            <input
              v-model="refundForm.reason"
              class="field"
              placeholder="Customer returned item"
            />
          </div>
          <div class="flex justify-between text-sm text-ink-2 pt-1">
            <span>Refund amount</span>
            <span class="mono">{{ money(selectedRefundAmount) }}</span>
          </div>
        </div>
        <p v-if="refundError" class="mt-3 text-xs text-ember">{{ refundError }}</p>
        <div class="flex gap-3 mt-6">
          <button
            class="btn-ember flex-1"
            :disabled="busy || !refundForm.reason.trim()"
            @click="submitRefund"
          >
            Refund
          </button>
          <button class="btn" @click="refundOpen = false">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>
