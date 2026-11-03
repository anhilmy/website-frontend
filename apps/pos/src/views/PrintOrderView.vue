<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { orders } from '../lib/resources'
import { settings as appSettings, ensureSettings } from '../lib/settings'
import ReceiptPaper from '../components/ReceiptPaper.vue'

const route = useRoute()
const router = useRouter()

const order = ref(null)
const loading = ref(true)
const error = ref('')

const mode = computed(() => (route.query.mode === 'receipt' ? 'receipt' : 'bill'))
const format = computed(() => (route.query.format === 'a4' ? 'a4' : '80mm'))
const isReceipt = computed(() => mode.value === 'receipt')

onMounted(async () => {
  ensureSettings()
  try {
    order.value = await orders.get(route.params.id)
    const number = order.value.receiptNumber || `#${String(order.value.id).padStart(3, '0')}`
    document.title = `${isReceipt.value ? 'Receipt' : 'Bill'} ${number}`
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
      <ReceiptPaper :order="order" :mode="mode" :settings="appSettings.data" />
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
