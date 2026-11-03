<script setup>
import { computed, onMounted, ref } from 'vue'
import { orders, reports, users } from '../lib/resources'
import { money, dateTime } from '../lib/format'
import { isManager } from '../lib/session'
import StatusTag from '../components/StatusTag.vue'
import MultiSelect from '../components/MultiSelect.vue'

const manager = isManager()

const loading = ref(true)
const error = ref('')
const reportError = ref('')
const rows = ref([])
const statuses = ref([])
const cashierIds = ref([])
const cashiers = ref([])
const fromDate = ref('')
const toDate = ref('')
const report = ref(null)
const page = ref(1)
const total = ref(0)
const pageSize = 50

const statusOptions = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'PARTIALLY_REFUNDED', label: 'Partially refunded' },
  { value: 'REFUNDED', label: 'Refunded' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'AMENDED', label: 'Amended' },
]

const cashierOptions = computed(() =>
  cashiers.value.map((u) => ({
    value: u.id,
    label: u.username,
    meta: u.active === false ? 'disabled' : u.role,
  })),
)

const summary = computed(() => ({
  orders: report.value?.orderCount ?? total.value,
  gross: report.value?.totals?.gross ?? 0,
  refunded: report.value?.totals?.refunded ?? 0,
  net: report.value?.totals?.net ?? 0,
}))

function rangeParams() {
  return {
    from: fromDate.value
      ? new Date(`${fromDate.value}T00:00:00`).toISOString()
      : undefined,
    to: toDate.value
      ? new Date(`${toDate.value}T23:59:59.999`).toISOString()
      : undefined,
  }
}

function filterParams() {
  return {
    status: statuses.value,
    cashierId: cashierIds.value,
    ...rangeParams(),
  }
}

async function loadReport() {
  if (!manager) return
  reportError.value = ''
  try {
    report.value = await reports.payments(filterParams())
  } catch (e) {
    reportError.value = e.message
  }
}

async function load(targetPage = page.value) {
  loading.value = true
  error.value = ''
  try {
    const result = await orders.list({
      ...filterParams(),
      page: targetPage,
      size: pageSize,
    })
    rows.value = result.items ?? result
    total.value = result.total ?? rows.value.length
    page.value = result.page ?? targetPage
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
  await loadReport()
}

function applyFilters() {
  page.value = 1
  load(1)
}

async function exportCsv() {
  error.value = ''
  try {
    await reports.exportOrders(filterParams())
  } catch (e) {
    error.value = e.message
  }
}

function clearRange() {
  fromDate.value = ''
  toDate.value = ''
  applyFilters()
}

onMounted(async () => {
  if (manager) {
    cashiers.value = await users.list().catch(() => [])
  }
  await load()
})
</script>

<template>
  <div>
    <div class="flex flex-wrap items-end justify-between gap-4 rise rise-1">
      <div>
        <div class="eyebrow">Ledger</div>
        <h3 class="display text-2xl mt-1">Order history</h3>
      </div>
    </div>

    <div class="relative z-20 flex flex-wrap items-end gap-3 mt-6 rise rise-2">
      <div class="min-w-[190px]">
        <label class="label" :for="'order-status-filter'">Status</label>
        <MultiSelect
          id="order-status-filter"
          v-model="statuses"
          :options="statusOptions"
          label="statuses"
          placeholder="All statuses"
          @update:model-value="applyFilters"
        />
      </div>
      <div v-if="manager" class="min-w-[190px]">
        <label class="label" :for="'order-cashier-filter'">Cashier</label>
        <MultiSelect
          id="order-cashier-filter"
          v-model="cashierIds"
          :options="cashierOptions"
          label="cashiers"
          placeholder="All cashiers"
          @update:model-value="applyFilters"
        />
      </div>
      <div>
        <label class="label" for="from">From</label>
        <input
          id="from"
          v-model="fromDate"
          type="date"
          class="field mono"
          @change="applyFilters"
        />
      </div>
      <div>
        <label class="label" for="to">To</label>
        <input
          id="to"
          v-model="toDate"
          type="date"
          class="field mono"
          @change="applyFilters"
        />
      </div>
      <button v-if="fromDate || toDate" class="btn btn-sm" @click="clearRange">
        Clear range
      </button>
      <button v-if="manager" class="btn btn-sm ml-auto" @click="exportCsv">
        Export CSV
      </button>
    </div>

    <!-- Summary -->
    <section v-if="manager" class="plate mt-6 p-5 rise rise-3">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div class="eyebrow">Summary</div>
          <h4 class="display text-lg mt-1">By payment method</h4>
        </div>
        <div class="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
          <div class="text-right">
            <div class="eyebrow">Orders</div>
            <div class="mono text-xl">{{ summary.orders }}</div>
          </div>
          <div class="text-right">
            <div class="eyebrow">Gross</div>
            <div class="mono text-xl">{{ money(summary.gross) }}</div>
          </div>
          <div class="text-right">
            <div class="eyebrow">Refunded</div>
            <div class="mono text-xl text-ember">{{ money(summary.refunded) }}</div>
          </div>
          <div class="text-right">
            <div class="eyebrow">Net</div>
            <div class="mono text-xl text-sage">{{ money(summary.net) }}</div>
          </div>
        </div>
      </div>
      <div class="dashed my-4"></div>
      <p v-if="reportError" class="text-sm text-ember">{{ reportError }}</p>
      <table v-else-if="report" class="w-full text-sm">
        <thead>
          <tr class="text-left eyebrow">
            <th class="pb-2 font-normal">Method</th>
            <th class="pb-2 font-normal text-right">Bills</th>
            <th class="pb-2 font-normal text-right">Gross</th>
            <th class="pb-2 font-normal text-right">Refunded</th>
            <th class="pb-2 font-normal text-right">Net</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in report.rows" :key="row.method" class="border-t hairline">
            <td class="py-2 mono">{{ row.method }}</td>
            <td class="py-2 mono text-right">{{ row.count || '—' }}</td>
            <td class="py-2 mono text-right">{{ money(row.gross) }}</td>
            <td class="py-2 mono text-right text-ember">{{ money(row.refunded) }}</td>
            <td class="py-2 mono text-right font-medium">{{ money(row.net) }}</td>
          </tr>
          <tr v-if="!report.rows.length">
            <td colspan="5" class="py-6 text-center text-ink-3">
              No settled bills in this range.
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else class="text-sm text-ink-3">Loading summary…</p>
    </section>

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
            <th class="px-5 py-3 font-normal text-right">Refunded</th>
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
            <td class="px-5 py-3.5 mono font-medium">
              {{ o.receiptNumber || `#${String(o.id).padStart(3, '0')}` }}
            </td>
            <td class="px-5 py-3.5">{{ o.customerInfo || 'Walk-in' }}</td>
            <td class="px-5 py-3.5 mono text-ink-2">
              {{ (o.items || []).filter((i) => i.status !== 'VOIDED').length }}
            </td>
            <td class="px-5 py-3.5 text-ink-2">{{ o.cashier?.username }}</td>
            <td class="px-5 py-3.5 mono text-[12px] text-ink-3">{{ dateTime(o.createdAt) }}</td>
            <td class="px-5 py-3.5"><StatusTag :status="o.status" /></td>
            <td class="px-5 py-3.5 mono text-right text-ember">
              {{ Number(o.refundedAmount || 0) ? `−${money(o.refundedAmount)}` : '—' }}
            </td>
            <td class="px-5 py-3.5 mono text-right font-medium">{{ money(o.totalAmount) }}</td>
          </tr>
          <tr v-if="!loading && !rows.length">
            <td colspan="8" class="px-5 py-12 text-center text-ink-3">
              No orders here yet.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="total > pageSize" class="flex items-center justify-between mt-4">
      <span class="mono text-xs text-ink-3">
        Page {{ page }} of {{ Math.ceil(total / pageSize) }}
      </span>
      <div class="flex gap-2">
        <button class="btn btn-sm" :disabled="page <= 1" @click="load(page - 1)">
          Previous
        </button>
        <button
          class="btn btn-sm"
          :disabled="page >= Math.ceil(total / pageSize)"
          @click="load(page + 1)"
        >
          Next
        </button>
      </div>
    </div>

    <p v-if="error" class="mt-4 text-sm text-ember">{{ error }}</p>
    <p v-else-if="loading" class="mt-4 text-sm text-ink-3">Loading the ledger…</p>
  </div>
</template>
