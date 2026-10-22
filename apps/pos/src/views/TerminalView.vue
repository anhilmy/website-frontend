<script setup>
import { computed, onMounted, ref } from 'vue'
import { menu, orders } from '../lib/resources'
import { money } from '../lib/format'

const categories = ref([])
const items = ref([])
const loading = ref(true)
const error = ref('')

const activeCategory = ref(null)
const search = ref('')

const order = ref(null)
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

const lines = computed(() => order.value?.items ?? [])
const subtotal = computed(() =>
  lines.value.reduce((sum, l) => sum + Number(l.totalPrice), 0),
)
const tax = computed(() => Number(order.value?.taxAmount ?? 0))
const total = computed(() => Number(order.value?.totalAmount ?? 0))
const isSettled = computed(() => order.value?.status === 'COMPLETED')
const change = computed(() => {
  const t = Number(tendered.value || 0)
  return Number.isFinite(t) ? t - total.value : 0
})

onMounted(async () => {
  try {
    const [cats, its] = await Promise.all([menu.categories(), menu.items()])
    categories.value = cats
    items.value = its
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

function qtyOf(menuItemId) {
  const line = lines.value.find((l) => l.menuItem?.id === menuItemId)
  return line ? line.quantity : 0
}

async function ensureOrder() {
  if (!order.value) {
    order.value = await orders.create(customerInfo.value || null)
  }
  return order.value
}

async function add(item) {
  busy.value = true
  notice.value = ''
  try {
    const o = await ensureOrder()
    order.value = await orders.addItem(o.id, item.id, 1)
  } catch (e) {
    notice.value = e.message
  } finally {
    busy.value = false
  }
}

async function setQty(line, quantity) {
  if (quantity <= 0) return removeLine(line)
  busy.value = true
  try {
    order.value = await orders.updateItem(order.value.id, line.id, quantity)
  } catch (e) {
    notice.value = e.message
  } finally {
    busy.value = false
  }
}

async function removeLine(line) {
  busy.value = true
  try {
    order.value = await orders.removeItem(order.value.id, line.id)
  } catch (e) {
    notice.value = e.message
  } finally {
    busy.value = false
  }
}

async function settle() {
  busy.value = true
  notice.value = ''
  try {
    const amount = Number(tendered.value || total.value)
    order.value = await orders.complete(order.value.id, paymentMethod.value, amount)
  } catch (e) {
    notice.value = e.message
  } finally {
    busy.value = false
  }
}

function newOrder() {
  order.value = null
  customerInfo.value = ''
  tendered.value = ''
  notice.value = ''
  paymentMethod.value = 'CASH'
}
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
          :disabled="busy || isSettled"
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
            <div class="eyebrow">
              {{ order ? `Order #${String(order.id).padStart(3, '0')}` : 'New order' }}
            </div>
            <div class="display text-xl mt-0.5">
              {{ isSettled ? 'Settled' : order ? 'Open ticket' : 'Empty ticket' }}
            </div>
          </div>
          <button v-if="order" class="btn btn-sm" @click="newOrder">New</button>
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
        </div>

        <div class="px-5">
          <div class="dashed"></div>
        </div>

        <div class="px-5 py-4 max-h-[320px] overflow-y-auto">
          <p v-if="!lines.length" class="text-sm text-ink-3 py-6 text-center">
            Tap a menu item to start the ticket.
          </p>
          <ul class="space-y-3">
            <li v-for="line in lines" :key="line.id" class="flex items-start gap-3">
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium truncate">{{ line.menuItem?.name }}</div>
                <div class="mono text-[11px] text-ink-3 mt-0.5">
                  {{ money(line.unitPrice) }} × {{ line.quantity }}
                </div>
              </div>
              <div class="flex items-center gap-1">
                <button
                  class="h-6 w-6 grid place-items-center border hairline rounded-card text-ink-2 hover:bg-paper-2"
                  :disabled="busy || isSettled"
                  @click="setQty(line, line.quantity - 1)"
                >
                  –
                </button>
                <span class="mono text-sm w-6 text-center">{{ line.quantity }}</span>
                <button
                  class="h-6 w-6 grid place-items-center border hairline rounded-card text-ink-2 hover:bg-paper-2"
                  :disabled="busy || isSettled"
                  @click="setQty(line, line.quantity + 1)"
                >
                  +
                </button>
              </div>
              <div class="mono text-sm w-16 text-right pt-0.5">{{ money(line.totalPrice) }}</div>
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

          <button
            v-if="!isSettled"
            class="btn-ember w-full py-3"
            :disabled="busy || !lines.length"
            @click="settle"
          >
            {{ busy ? 'Working…' : `Settle ${money(total)}` }}
          </button>
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
