<script setup>
import { computed, onMounted, ref } from 'vue'
import { orders } from '../lib/resources'
import { money, dateTime } from '../lib/format'
import StatusTag from '../components/StatusTag.vue'

const loading = ref(true)
const error = ref('')
const rows = ref([])
const status = ref('')

const filters = [
  { label: 'All', value: '' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'In progress', value: 'IN_PROGRESS' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
]

const totals = computed(() => {
  const completed = rows.value.filter((r) => r.status === 'COMPLETED')
  const revenue = completed.reduce((s, r) => s + Number(r.totalAmount), 0)
  return { count: rows.value.length, revenue }
})

async function load() {
  loading.value = true
  error.value = ''
  try {
    const page = await orders.list({ status: status.value, size: 50 })
    rows.value = page.items ?? page
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div>
    <div class="flex flex-wrap items-end justify-between gap-4 rise rise-1">
      <div>
        <div class="eyebrow">Ledger</div>
        <h3 class="display text-2xl mt-1">Order history</h3>
      </div>
      <div class="flex gap-6">
        <div class="text-right">
          <div class="eyebrow">Orders</div>
          <div class="mono text-xl">{{ totals.count }}</div>
        </div>
        <div class="text-right">
          <div class="eyebrow">Settled value</div>
          <div class="mono text-xl text-sage">{{ money(totals.revenue) }}</div>
        </div>
      </div>
    </div>

    <div class="flex flex-wrap gap-2 mt-6 rise rise-2">
      <button
        v-for="f in filters"
        :key="f.value"
        class="btn btn-sm"
        :class="{ 'bg-ink text-paper border-ink': status === f.value }"
        @click="status = f.value; load()"
      >
        {{ f.label }}
      </button>
    </div>

    <div class="plate mt-6 overflow-hidden rise rise-3">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left eyebrow border-b hairline">
            <th class="px-5 py-3 font-normal">Order</th>
            <th class="px-5 py-3 font-normal">Customer</th>
            <th class="px-5 py-3 font-normal">Items</th>
            <th class="px-5 py-3 font-normal">Cashier</th>
            <th class="px-5 py-3 font-normal">Opened</th>
            <th class="px-5 py-3 font-normal">Status</th>
            <th class="px-5 py-3 font-normal text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="o in rows"
            :key="o.id"
            class="border-b hairline last:border-0 hover:bg-paper-2/60 cursor-pointer transition-colors"
            @click="$router.push({ name: 'order', params: { id: o.id } })"
          >
            <td class="px-5 py-3.5 mono font-medium">#{{ String(o.id).padStart(3, '0') }}</td>
            <td class="px-5 py-3.5">{{ o.customerInfo || 'Walk-in' }}</td>
            <td class="px-5 py-3.5 mono text-ink-2">{{ (o.items || []).length }}</td>
            <td class="px-5 py-3.5 text-ink-2">{{ o.cashier?.username }}</td>
            <td class="px-5 py-3.5 mono text-[12px] text-ink-3">{{ dateTime(o.createdAt) }}</td>
            <td class="px-5 py-3.5"><StatusTag :status="o.status" /></td>
            <td class="px-5 py-3.5 mono text-right font-medium">{{ money(o.totalAmount) }}</td>
          </tr>
          <tr v-if="!loading && !rows.length">
            <td colspan="7" class="px-5 py-12 text-center text-ink-3">
              No orders here yet.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="error" class="mt-4 text-sm text-ember">{{ error }}</p>
    <p v-else-if="loading" class="mt-4 text-sm text-ink-3">Loading the ledger…</p>
  </div>
</template>
