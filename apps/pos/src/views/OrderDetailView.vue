<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { orders, paymentMethods } from '../lib/resources'
import { money } from '../lib/format'
import { isManager } from '../lib/session'
import { settings as appSettings, ensureSettings } from '../lib/settings'
import StatusTag from '../components/StatusTag.vue'
import ReceiptPaper from '../components/ReceiptPaper.vue'

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
function remainingQty(line) {
  const refunded = (order.value?.refunds ?? [])
    .filter((r) => r.transactionItemId === line.id)
    .reduce((sum, r) => sum + Number(r.quantity), 0)
  return Number(line.quantity) - refunded
}

let loadSeq = 0

async function load(id = route.params.id) {
  const seq = ++loadSeq
  loading.value = true
  error.value = ''
  try {
    const result = await orders.get(id)
    if (seq !== loadSeq) return
    order.value = result
  } catch (e) {
    if (seq !== loadSeq) return
    error.value = e.message
  } finally {
    if (seq === loadSeq) loading.value = false
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

watch(
  () => route.params.id,
  (id) => {
    if (!id) return
    refundOpen.value = false
    refundError.value = ''
    notice.value = ''
    order.value = null
    window.scrollTo({ top: 0 })
    load(id)
  },
)

onMounted(async () => {
  ensureSettings()
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

      <div class="flex justify-center mb-3 rise rise-1">
        <StatusTag :status="order.status" />
      </div>

      <!-- Receipt -->
      <div class="shadow-lift rise rise-1">
        <ReceiptPaper
          :order="order"
          :mode="isSettled ? 'receipt' : 'bill'"
          :settings="appSettings.data"
          show-voided
          show-refunds
          show-unit-price
        >
          <template #line-actions="{ line }">
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
          </template>
        </ReceiptPaper>
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
