<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { orders } from '../lib/resources'
import { money, dateTime } from '../lib/format'
import StatusTag from '../components/StatusTag.vue'

const route = useRoute()
const router = useRouter()

const order = ref(null)
const loading = ref(true)
const error = ref('')
const notice = ref('')
const busy = ref(false)

const items = computed(() => order.value?.items ?? [])
const subtotal = computed(() =>
  items.value.reduce((s, l) => s + Number(l.totalPrice ?? l.unitPrice * l.quantity), 0),
)
const isOpen = computed(() => order.value && order.value.status === 'DRAFT')

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

async function settle() {
  busy.value = true
  notice.value = ''
  try {
    order.value = await orders.complete(
      order.value.id,
      order.value.paymentMethod || 'CASH',
      order.value.totalAmount,
    )
  } catch (e) {
    notice.value = e.message
  } finally {
    busy.value = false
  }
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

onMounted(load)
</script>

<template>
  <div class="max-w-2xl">
    <button class="btn btn-sm mb-6" @click="router.push({ name: 'orders' })">← Ledger</button>

    <p v-if="loading" class="text-sm text-ink-3">Loading order…</p>
    <p v-else-if="error" class="text-sm text-ember">{{ error }}</p>

    <template v-else-if="order">
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
        </dl>

        <div class="dashed my-6"></div>

        <ul class="space-y-3">
          <li v-for="line in items" :key="line.id" class="flex items-baseline gap-3 text-sm">
            <span class="mono text-ink-3 w-8">{{ line.quantity }}×</span>
            <span class="flex-1">{{ line.menuItem?.name }}</span>
            <span class="mono text-[12px] text-ink-3">{{ money(line.unitPrice) }}</span>
            <span class="mono w-20 text-right">{{ money(line.totalPrice) }}</span>
          </li>
        </ul>

        <div class="dashed my-6"></div>

        <div class="space-y-2">
          <div class="flex justify-between text-sm text-ink-2">
            <span>Subtotal</span><span class="mono">{{ money(subtotal) }}</span>
          </div>
          <div class="flex justify-between text-sm text-ink-2">
            <span>Tax</span><span class="mono">{{ money(order.taxAmount) }}</span>
          </div>
          <div class="flex justify-between items-baseline pt-2 border-t hairline mt-2">
            <span class="display text-lg">Total</span>
            <span class="mono text-2xl font-bold">{{ money(order.totalAmount) }}</span>
          </div>
        </div>

        <div class="dashed my-6"></div>
        <div class="text-center mono text-[11px] tracking-[0.2em] text-ink-3">
          {{ order.status === 'COMPLETED' ? 'PAID IN FULL · THANK YOU' : 'NOT YET SETTLED' }}
        </div>
      </div>

      <!-- Actions -->
      <div class="mt-6 flex gap-3 rise rise-2">
        <button v-if="isOpen" class="btn-ember" :disabled="busy" @click="settle">
          Settle {{ money(order.totalAmount) }}
        </button>
        <button v-if="isOpen" class="btn" :disabled="busy" @click="cancel">Cancel order</button>
        <button v-else class="btn" @click="router.push({ name: 'terminal' })">
          New order at terminal
        </button>
      </div>

      <p v-if="notice" class="mt-4 text-sm text-ember">{{ notice }}</p>
    </template>
  </div>
</template>
