<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import { menu, orders } from '../lib/resources'
import { money } from '../lib/format'

const route = useRoute()
const router = useRouter()

const TAX_RATE = 0.1

const categories = ref([])
const items = ref([])
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
const customerInfo = ref('')
const paymentMethod = ref('CASH')
const tendered = ref('')

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
const tax = computed(() => subtotal.value * TAX_RATE)
const total = computed(() => subtotal.value + tax.value)
const isSettled = computed(() => order.value?.status === 'COMPLETED')
// Only DRAFT orders are mutable server-side; a settled/cancelled pick-up cannot be edited.
const isEditable = computed(() => !order.value || order.value.status === 'DRAFT')
const change = computed(() => {
  const t = Number(tendered.value || 0)
  return Number.isFinite(t) ? t - total.value : 0
})

function syncCartFromOrder() {
  cart.value = (order.value?.items ?? []).map((l) => ({
    menuItemId: l.menuItem?.id,
    name: l.menuItem?.name,
    unitPrice: Number(l.unitPrice),
    quantity: l.quantity,
  }))
}

onMounted(async () => {
  try {
    const [cats, its] = await Promise.all([menu.categories(), menu.items()])
    categories.value = cats
    items.value = its
    // Opened from the floor plan: pick up that table's existing order.
    if (route.query.order) {
      order.value = await orders.get(route.query.order)
      customerInfo.value = order.value.customerInfo || ''
      syncCartFromOrder()
    }
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

function qtyOf(menuItemId) {
  return cart.value.find((l) => l.menuItemId === menuItemId)?.quantity || 0
}

function add(item) {
  if (busy.value || !isEditable.value) return
  notice.value = ''
  const line = cart.value.find((l) => l.menuItemId === item.id)
  if (line) line.quantity += 1
  else
    cart.value.push({
      menuItemId: item.id,
      name: item.name,
      unitPrice: Number(item.price),
      quantity: 1,
    })
  dirty.value = true
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

function removeLine(line) {
  cart.value = cart.value.filter((l) => l !== line)
  dirty.value = true
}

async function persistCart() {
  if (!order.value) {
    order.value = await orders.create(customerInfo.value || null)
  }

  const serverByItem = new Map((order.value.items ?? []).map((l) => [l.menuItem?.id, l]))
  const cartByItem = new Map(cart.value.map((l) => [l.menuItemId, l]))

  for (const line of cart.value) {
    const existing = serverByItem.get(line.menuItemId)
    if (!existing) {
      order.value = await orders.addItem(order.value.id, line.menuItemId, line.quantity)
    } else if (existing.quantity !== line.quantity) {
      order.value = await orders.updateItem(order.value.id, existing.id, line.quantity)
    }
  }

  for (const [menuItemId, line] of serverByItem) {
    if (!cartByItem.has(menuItemId)) {
      order.value = await orders.removeItem(order.value.id, line.id)
    }
  }

  order.value = await orders.get(order.value.id)
  syncCartFromOrder()
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
    order.value = await orders.complete(order.value.id, paymentMethod.value, amount)
    tendered.value = ''
  } catch (e) {
    notice.value = e.message
  } finally {
    busy.value = false
  }
}

function newOrder() {
  if (dirty.value && !window.confirm('Discard unsaved changes to this ticket?')) return
  order.value = null
  cart.value = []
  dirty.value = false
  customerInfo.value = ''
  tendered.value = ''
  notice.value = ''
  paymentMethod.value = 'CASH'
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
          :class="{ 'bg-ink text-paper border-ink': !activeCategory }"
          @click="activeCategory = null"
        >
          All
        </button>
        <button
          v-for="c in categories"
          :key="c.id"
          class="btn btn-sm"
          :class="{ 'bg-ink text-paper border-ink': activeCategory === c.id }"
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
          class="plate text-left p-4 hover:shadow-lift hover:-translate-y-0.5 transition-all disabled:opacity-40 rise"
          :class="`rise-${Math.min(idx + 1, 5)}`"
          :disabled="busy || !isEditable"
          @click="add(item)"
        >
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
              {{ isSettled ? 'Settled' : lines.length ? 'Open ticket' : 'Empty ticket' }}
            </div>
          </div>
          <button v-if="order || dirty" class="btn btn-sm" @click="newOrder">New</button>
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
            <li v-for="line in lines" :key="line.menuItemId" class="flex items-start gap-3">
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium truncate">{{ line.name }}</div>
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
          <div class="flex justify-between text-sm text-ink-2">
            <span>Tax (10%)</span><span class="mono">{{ money(tax) }}</span>
          </div>
          <div class="flex justify-between items-baseline pt-2">
            <span class="display text-lg">Total</span>
            <span class="mono text-2xl font-bold">{{ money(total) }}</span>
          </div>
        </div>

        <div class="px-5 pb-5 space-y-3">
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="m in ['CASH', 'CARD', 'DIGITAL']"
              :key="m"
              class="btn btn-sm"
              :class="{ 'bg-ink text-paper border-ink': paymentMethod === m }"
              :disabled="isSettled"
              @click="paymentMethod = m"
            >
              {{ m }}
            </button>
          </div>

          <div v-if="!isSettled">
            <label class="label" for="tender">Amount tendered</label>
            <input
              id="tender"
              v-model="tendered"
              class="field mono"
              type="number"
              step="0.01"
              :placeholder="total.toFixed(2)"
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
        PRICES IN USD · TAX APPLIED AT CHECKOUT
      </p>
    </aside>
  </div>
</template>
