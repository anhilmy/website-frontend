<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import {
  chargeTemplates as chargeApi,
  menu,
  modifiers as modifierApi,
  orders,
  paymentMethods as methodApi,
} from '../lib/resources'
import { money } from '../lib/format'
import MenuThumb from '../components/MenuThumb.vue'
import ModifierPicker from '../components/ModifierPicker.vue'

const route = useRoute()
const router = useRouter()

const TAX_RATE = 0.1

const FALLBACK_METHODS = [
  { code: 'CASH', label: 'Cash', isCash: true },
  { code: 'CARD', label: 'Card', isCash: false },
]

const categories = ref([])
const items = ref([])
const methods = ref(FALLBACK_METHODS)
const templates = ref([])
const loading = ref(true)
const error = ref('')

const activeCategory = ref(null)
const search = ref('')

// The ticket is staged locally and only written to the backend on Save.
const order = ref(null)
const cart = ref([])
const dirty = ref(false)
const busy = ref(false)
const notice = ref('')
const voidReasons = ref({})
const pickerItem = ref(null)
const pickerGroups = ref([])
const pickerLoading = ref(false)
const pickerError = ref('')
const customerInfo = ref('')
const paymentMethod = ref('CASH')
const paymentReference = ref('')
const tendered = ref('')

const selectedMethod = computed(() =>
  methods.value.find((m) => m.code === paymentMethod.value),
)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return items.value.filter((i) => {
    const byCat = !activeCategory.value || i.menuCategory?.id === activeCategory.value
    const byText = !q || i.name.toLowerCase().includes(q)
    return byCat && byText
  })
})

const lines = computed(() => cart.value)
const subtotal = computed(() => lines.value.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0))

// Mirrors TransactionService.recalcTotals: evaluate in sort order, round each charge once.
const localCharges = computed(() => {
  const definitions = templates.value.length
    ? templates.value
    : [
        {
          code: 'TAX',
          label: 'Tax',
          calcType: 'PERCENTAGE',
          value: TAX_RATE,
          basis: 'SUBTOTAL',
          taxable: false,
          isTax: true,
          sortOrder: 10,
        },
      ]
  let runningBase = subtotal.value
  return definitions.map((t) => {
    const base = t.basis === 'RUNNING_TOTAL' ? runningBase : subtotal.value
    const raw = t.calcType === 'FIXED' ? Number(t.value) : base * Number(t.value)
    const amount = Math.round(raw * 100) / 100
    if (t.taxable) runningBase += amount
    return { ...t, computedAmount: amount }
  })
})

// A saved, untouched order shows its own snapshot; an edited ticket re-evaluates locally.
const displayCharges = computed(() =>
  !dirty.value && order.value?.charges?.length ? order.value.charges : localCharges.value,
)
const chargesTotal = computed(() =>
  displayCharges.value.reduce((sum, c) => sum + Number(c.computedAmount), 0),
)
const total = computed(() => subtotal.value + chargesTotal.value)
const isSettled = computed(() =>
  ['COMPLETED', 'PARTIALLY_REFUNDED', 'REFUNDED'].includes(order.value?.status),
)
// Only DRAFT orders are mutable server-side; a settled/cancelled pick-up cannot be edited.
const isEditable = computed(() => !order.value || order.value.status === 'DRAFT')
const change = computed(() => {
  const t = Number(tendered.value || 0)
  return Number.isFinite(t) ? t - total.value : 0
})

// Line identity: item + sorted option ids + note. Options whose menu record was deleted have a
// null id, so fall back to the snapshotted option names to keep distinct variants apart.
function lineSignature(menuItemId, modifiers, note) {
  const list = modifiers || []
  const ids = list
    .map((m) => m.modifierOptionId)
    .filter((id) => id != null)
    .sort((a, b) => a - b)
  const signature =
    list.length && ids.length === list.length
      ? ids.join(',')
      : list
          .map((m) => m.optionName)
          .sort()
          .join('+')
  return `${menuItemId}|${signature}|${note || ''}`
}

function snapshotModifiers(item) {
  return (item.modifiers || []).map((m) => ({
    modifierOptionId: m.modifierOptionId,
    groupName: m.groupName,
    optionName: m.optionName,
    priceDelta: Number(m.priceDelta),
  }))
}

function syncCartFromOrder() {
  cart.value = (order.value?.items ?? [])
    .filter((l) => l.status !== 'VOIDED')
    .map((l) => {
      const modifiers = snapshotModifiers(l)
      const note = l.note || ''
      return {
        key: lineSignature(l.menuItem?.id, modifiers, note),
        orderItemId: l.id,
        menuItemId: l.menuItem?.id,
        name: l.menuItem?.name,
        unitPrice: Number(l.unitPrice),
        quantity: l.quantity,
        note,
        modifiers,
      }
    })
}

onMounted(async () => {
  try {
    const [cats, its, availableMethods, chargeDefs] = await Promise.all([
      menu.categories(),
      menu.items(),
      methodApi.list(true),
      chargeApi.list(true).catch(() => []),
    ])
    categories.value = cats
    items.value = its
    if (availableMethods?.length) methods.value = availableMethods
    templates.value = chargeDefs ?? []

    const preferred =
      methods.value.find((m) => m.code === 'CASH') || methods.value[0]
    if (preferred) paymentMethod.value = preferred.code

    // Opened from the floor plan: pick up that table's existing order.
    if (route.query.order) {
      order.value = await orders.get(route.query.order)
      customerInfo.value = order.value.customerInfo || ''
      if (order.value.paymentMethod) paymentMethod.value = order.value.paymentMethod
      paymentReference.value = order.value.paymentReference || ''
      syncCartFromOrder()
    }
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

function qtyOf(menuItemId) {
  return cart.value
    .filter((l) => l.menuItemId === menuItemId)
    .reduce((sum, l) => sum + l.quantity, 0)
}

function addLine(line) {
  const key = lineSignature(line.menuItemId, line.modifiers, line.note)
  const existing = cart.value.find((l) => l.key === key)
  if (existing) {
    existing.quantity += line.quantity
  } else {
    cart.value.push({ ...line, key })
  }
  dirty.value = true
}

async function openPicker(item) {
  if (busy.value || !isEditable.value) return
  notice.value = ''
  pickerItem.value = item
  pickerGroups.value = []
  pickerError.value = ''
  pickerLoading.value = true
  try {
    pickerGroups.value = await modifierApi.forItem(item.id)
  } catch (e) {
    pickerError.value = e.message
  } finally {
    pickerLoading.value = false
  }
}

function closePicker() {
  pickerItem.value = null
  pickerGroups.value = []
  pickerError.value = ''
}

function handlePickerAdd(payload) {
  if (!pickerItem.value) return
  addLine({
    menuItemId: pickerItem.value.id,
    name: pickerItem.value.name,
    unitPrice: payload.unitPrice,
    quantity: payload.quantity,
    note: payload.note || '',
    modifiers: payload.modifiers,
  })
  closePicker()
}

function add(item) {
  if (busy.value || !isEditable.value) return
  if (item.hasModifiers) {
    openPicker(item)
    return
  }
  notice.value = ''
  addLine({
    menuItemId: item.id,
    name: item.name,
    unitPrice: Number(item.price),
    quantity: 1,
    note: '',
    modifiers: [],
  })
}

/**
 * A manager can add a required group while this terminal is open. The next save then rejects
 * the old plain line; refresh the catalogue and let the cashier configure it instead of
 * leaving them stuck with an unsellable ticket.
 */
async function recoverFromMenuChange(error) {
  if (!/option|modifier/i.test(error?.message || '')) return
  const stale = error?.line || cart.value.find((line) => !line.modifiers.length)
  if (!stale) return
  try {
    items.value = await menu.items()
  } catch {
    return
  }
  const item = items.value.find((i) => i.id === stale.menuItemId)
  if (!item?.hasModifiers) return
  cart.value = cart.value.filter((line) => line !== stale)
  dirty.value = true
  await openPicker(item)
  notice.value = `${item.name} now requires options — choose them and save again.`
}

function setQty(line, quantity) {
  if (busy.value || !isEditable.value) return
  notice.value = ''
  if (quantity <= 0) removeLine(line)
  else {
    line.quantity = quantity
    dirty.value = true
  }
}

function serverLineKey(line) {
  return lineSignature(line.menuItem?.id, snapshotModifiers(line), line.note || '')
}

function removeLine(line) {
  const saved = (order.value?.items ?? []).some(
    (l) => l.status !== 'VOIDED' && serverLineKey(l) === line.key,
  )
  if (saved) {
    const reason = window.prompt('Reason for removing this item?', 'Removed at till')
    if (!reason || !reason.trim()) return
    voidReasons.value[line.key] = reason.trim()
  }
  cart.value = cart.value.filter((l) => l !== line)
  dirty.value = true
}

async function persistCart() {
  if (!order.value) {
    order.value = await orders.create(customerInfo.value || null)
  }

  const serverByKey = new Map(
    (order.value.items ?? [])
      .filter((l) => l.status !== 'VOIDED')
      .map((l) => [serverLineKey(l), l]),
  )
  const cartByKey = new Map(cart.value.map((l) => [l.key, l]))

  for (const line of cart.value) {
    const existing = serverByKey.get(line.key)
    if (!existing) {
      try {
        order.value = await orders.addItem(order.value.id, {
          menuItemId: line.menuItemId,
          quantity: line.quantity,
          modifierOptionIds: line.modifiers
            .map((m) => m.modifierOptionId)
            .filter((id) => id != null),
          note: line.note || null,
        })
      } catch (error) {
        error.line = line
        throw error
      }
    } else if (existing.quantity !== line.quantity) {
      order.value = await orders.updateItem(order.value.id, existing.id, {
        quantity: line.quantity,
      })
    }
  }

  for (const [key, line] of serverByKey) {
    if (!cartByKey.has(key)) {
      order.value = await orders.voidItem(
        order.value.id,
        line.id,
        voidReasons.value[key] || 'Removed at till',
      )
    }
  }

  order.value = await orders.get(order.value.id)
  syncCartFromOrder()
  voidReasons.value = {}
  dirty.value = false
}

async function saveCart() {
  if (busy.value) return false
  notice.value = ''
  // Nothing to write: an emptied ticket that was never saved.
  if (!order.value && !cart.value.length) {
    dirty.value = false
    return false
  }
  busy.value = true
  try {
    await persistCart()
    return true
  } catch (e) {
    notice.value = e.message
    busy.value = false
    await recoverFromMenuChange(e)
    return false
  } finally {
    busy.value = false
  }
}

async function settle() {
  if (busy.value || !lines.value.length || !isEditable.value) return
  notice.value = ''
  busy.value = true
  try {
    if (!order.value || dirty.value) await persistCart()
    const amount = Number(tendered.value || order.value.totalAmount)
    order.value = await orders.complete(
      order.value.id,
      paymentMethod.value,
      amount,
      paymentReference.value || null,
    )
    tendered.value = ''
  } catch (e) {
    notice.value = e.message
    busy.value = false
    await recoverFromMenuChange(e)
  } finally {
    busy.value = false
  }
}

function printOrder(mode) {
  if (!order.value || dirty.value) {
    notice.value = 'Save the ticket before printing.'
    return
  }
  const target = router.resolve({
    name: 'print-order',
    params: { id: order.value.id },
    query: { mode },
  })
  window.open(target.href, '_blank', 'noopener')
}

function newOrder() {
  if (dirty.value && !window.confirm('Discard unsaved changes to this ticket?')) return
  order.value = null
  cart.value = []
  dirty.value = false
  customerInfo.value = ''
  voidReasons.value = {}
  closePicker()
  tendered.value = ''
  paymentReference.value = ''
  notice.value = ''
  paymentMethod.value = methods.value[0]?.code || 'CASH'
  if (route.query.order) {
    router.replace({ name: 'terminal' })
  }
}

function beforeUnload(e) {
  if (!dirty.value) return
  e.preventDefault()
  e.returnValue = ''
}

onMounted(() => window.addEventListener('beforeunload', beforeUnload))
onUnmounted(() => window.removeEventListener('beforeunload', beforeUnload))

onBeforeRouteLeave(() => {
  if (dirty.value && !window.confirm('Leave with unsaved changes? They will be lost.')) return false
})
</script>

<template>
  <div class="grid xl:grid-cols-[1fr_400px] gap-8">
    <!-- Catalogue -->
    <section>
      <div class="flex flex-wrap items-end justify-between gap-4 rise rise-1">
        <div>
          <div class="eyebrow">Menu</div>
          <h3 class="display text-2xl mt-1">What are we serving?</h3>
        </div>
        <input v-model="search" class="field max-w-[240px]" placeholder="Search the menu…" />
      </div>

      <div class="flex flex-wrap gap-2 mt-5 rise rise-2">
        <button
          class="btn btn-sm"
          :class="{ 'btn-active': !activeCategory }"
          @click="activeCategory = null"
        >
          All
        </button>
        <button
          v-for="c in categories"
          :key="c.id"
          class="btn btn-sm"
          :class="{ 'btn-active': activeCategory === c.id }"
          @click="activeCategory = c.id"
        >
          {{ c.name }}
        </button>
      </div>

      <p v-if="error" class="mt-6 text-sm text-ember">{{ error }}</p>
      <p v-else-if="loading" class="mt-6 text-sm text-ink-3">Loading catalogue…</p>

      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        <button
          v-for="(item, idx) in filtered"
          :key="item.id"
          class="plate text-left overflow-hidden hover:shadow-lift hover:-translate-y-0.5 transition-all disabled:opacity-40 rise"
          :class="`rise-${Math.min(idx + 1, 5)}`"
          :disabled="busy || !isEditable"
          @click="add(item)"
        >
          <MenuThumb :src="item.imageUrl" :alt="item.name" variant="banner" />
          <div class="p-4">
            <div class="flex items-start justify-between gap-2">
              <h4 class="display text-lg leading-tight">{{ item.name }}</h4>
              <span v-if="qtyOf(item.id)" class="tag border-ember/60 text-ember">{{ qtyOf(item.id) }}</span>
            </div>
            <p class="text-xs text-ink-3 mt-1.5 line-clamp-2 min-h-[2rem]">
              {{ item.description || item.menuCategory?.name }}
            </p>
            <div class="flex items-center justify-between mt-3 pt-3 border-t hairline">
              <span class="mono text-sm font-medium">{{ money(item.price) }}</span>
              <span class="eyebrow">{{ item.menuCategory?.name }}</span>
            </div>
            <div v-if="item.hasModifiers" class="mono text-[9px] tracking-[0.2em] text-ember mt-1.5">
              CUSTOMIZABLE
            </div>
          </div>
        </button>
      </div>

      <p v-if="!loading && !filtered.length && !error" class="mt-6 text-sm text-ink-3">
        Nothing on the menu matches that.
      </p>
    </section>

    <!-- Ticket / cart -->
    <aside class="xl:sticky xl:top-8 self-start rise rise-2">
      <div class="plate overflow-hidden">
        <div class="flex items-center justify-between px-5 py-4 border-b hairline">
          <div>
            <div class="eyebrow flex items-center gap-2">
              {{ order ? `Order #${String(order.id).padStart(3, '0')}` : 'New order' }}
              <span v-if="dirty" class="tag border-mustard/60 text-mustard">unsaved</span>
            </div>
            <div class="display text-xl mt-0.5">
              {{
                isSettled
                  ? order?.status?.replaceAll('_', ' ')
                  : lines.length
                    ? 'Open ticket'
                    : 'Empty ticket'
              }}
            </div>
          </div>
          <div class="flex items-center gap-1">
            <button
              v-if="order"
              class="btn-icon"
              type="button"
              :title="isSettled ? 'Print receipt' : 'Print bill'"
              :aria-label="isSettled ? 'Print receipt' : 'Print bill'"
              @click="printOrder(isSettled ? 'receipt' : 'bill')"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M4 1h8v4H4V1zm-2 5h12a1 1 0 0 1 1 1v5h-3v-3H4v3H1V7a1 1 0 0 1 1-1zm4 4h4v4H6v-4z" />
              </svg>
            </button>
            <button v-if="order || dirty" class="btn btn-sm" @click="newOrder">New</button>
          </div>
        </div>

        <div class="px-5 py-4">
          <label class="label" for="cust">Customer / table</label>
          <input
            id="cust"
            v-model="customerInfo"
            class="field"
            placeholder="Walk-in"
            :disabled="!!order"
          />
          <p v-if="dirty && !order" class="mono text-[10px] tracking-widest text-ink-3 mt-1.5">
            SAVED WHEN YOU SAVE THE TICKET
          </p>
        </div>

        <div class="px-5">
          <div class="dashed"></div>
        </div>

        <div class="px-5 py-4 max-h-[320px] overflow-y-auto">
          <p v-if="!lines.length" class="text-sm text-ink-3 py-6 text-center">
            Tap a menu item to start the ticket.
          </p>
          <ul class="space-y-3">
            <li v-for="line in lines" :key="line.key" class="flex items-start gap-3">
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium truncate">{{ line.name }}</div>
                <div
                  v-if="line.modifiers.length"
                  class="text-[11px] text-ink-3 mt-0.5 truncate"
                >
                  {{ line.modifiers.map((m) => m.optionName).join(' · ') }}
                </div>
                <div
                  v-if="line.note"
                  class="text-[11px] italic text-ink-3 mt-0.5 truncate"
                >
                  “{{ line.note }}”
                </div>
                <div class="mono text-[11px] text-ink-3 mt-0.5">
                  {{ money(line.unitPrice) }} × {{ line.quantity }}
                </div>
              </div>
              <div class="flex items-center gap-1">
                <button
                  class="h-6 w-6 grid place-items-center border hairline rounded-card text-ink-2 hover:bg-paper-2"
                  :disabled="busy || !isEditable"
                  @click="setQty(line, line.quantity - 1)"
                >
                  –
                </button>
                <span class="mono text-sm w-6 text-center">{{ line.quantity }}</span>
                <button
                  class="h-6 w-6 grid place-items-center border hairline rounded-card text-ink-2 hover:bg-paper-2"
                  :disabled="busy || !isEditable"
                  @click="setQty(line, line.quantity + 1)"
                >
                  +
                </button>
              </div>
              <div class="mono text-sm w-16 text-right pt-0.5">
                {{ money(line.unitPrice * line.quantity) }}
              </div>
            </li>
          </ul>
        </div>

        <div class="px-5">
          <div class="dashed"></div>
        </div>

        <div class="px-5 py-4 space-y-2">
          <div class="flex justify-between text-sm text-ink-2">
            <span>Subtotal</span><span class="mono">{{ money(subtotal) }}</span>
          </div>
          <div
            v-for="c in displayCharges"
            :key="c.code"
            class="flex justify-between text-sm text-ink-2"
          >
            <span>{{ c.label }}</span><span class="mono">{{ money(c.computedAmount) }}</span>
          </div>
          <div class="flex justify-between items-baseline pt-2">
            <span class="display text-lg">Total</span>
            <span class="mono text-2xl font-bold">{{ money(total) }}</span>
          </div>
        </div>

        <div class="px-5 pb-5 space-y-3">
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="m in methods"
              :key="m.code"
              class="btn btn-sm"
              :class="{ 'btn-active': paymentMethod === m.code }"
              :disabled="isSettled"
              @click="paymentMethod = m.code"
            >
              {{ m.label }}
            </button>
          </div>

          <div v-if="!isSettled && selectedMethod && !selectedMethod.isCash">
            <label class="label" for="reference">Reference (optional)</label>
            <input
              id="reference"
              v-model="paymentReference"
              class="field mono"
              placeholder="Card / QRIS transaction id"
            />
          </div>

          <div v-if="isSettled && order?.paymentReference" class="mono text-[11px] text-ink-3">
            REF {{ order.paymentReference }}
          </div>

          <div v-if="!isSettled">
            <label class="label" for="tender">Amount tendered</label>
            <input
              id="tender"
              v-model="tendered"
              class="field mono"
              type="number"
              step="1"
              :placeholder="String(Math.round(total))"
            />
            <div v-if="tendered && change >= 0" class="mono text-[11px] text-ink-3 mt-1.5">
              Change due {{ money(change) }}
            </div>
          </div>

          <div
            v-if="notice"
            class="plate-2 border-ember/50 px-3 py-2 text-xs text-ember"
          >
            {{ notice }}
          </div>

          <div v-if="!isSettled" class="flex gap-2">
            <button
              class="btn py-3"
              :disabled="busy || !dirty || !isEditable"
              @click="saveCart"
            >
              {{ busy ? '…' : 'Save' }}
            </button>
            <button
              class="btn-ember flex-1 py-3"
              :disabled="busy || !lines.length || !isEditable"
              @click="settle"
            >
              {{ busy ? 'Working…' : dirty ? `Save & settle ${money(total)}` : `Settle ${money(total)}` }}
            </button>
          </div>
          <button v-else class="btn-ink w-full py-3" @click="newOrder">
            Start next order
          </button>
        </div>
      </div>

      <p class="mono text-[10px] tracking-widest text-ink-3 mt-3 text-center">
        PRICES IN IDR · TAX APPLIED AT CHECKOUT
      </p>
    </aside>

    <ModifierPicker
      v-if="pickerItem"
      :item="pickerItem"
      :groups="pickerGroups"
      :loading="pickerLoading"
      :error="pickerError"
      @add="handlePickerAdd"
      @close="closePicker"
    />
  </div>
</template>
