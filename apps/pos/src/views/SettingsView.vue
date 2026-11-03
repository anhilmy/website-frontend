<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { settings as settingsStore, ensureSettings, saveSettings } from '../lib/settings'
import { DEFAULT_SETTINGS } from '../lib/settings-defaults'
import { formatTokens, validateFormat } from '../lib/document'

const form = reactive({ ...DEFAULT_SETTINGS })

const notice = ref('')
const error = ref('')
const saving = ref(false)

const formatError = computed(() => validateFormat(form.receiptNumberFormat))
const preview = computed(() =>
  formatTokens(form.receiptNumberFormat || '{:order_no}', {
    date: new Date(),
    orderNumber: 42,
    padding: form.receiptNumberPadding,
  }),
)

const textFields = [
  ['systemName', 'POS system name', 'Counter'],
  ['companyName', 'Company name', 'ChocoCaffe'],
  ['location', 'Location', 'Jakarta'],
  ['taxNumber', 'Tax number (NPWP)', 'Optional'],
  ['receiptFooter', 'Receipt footer', 'Thank you for your visit'],
  ['billFooter', 'Bill footer', 'Please settle at the counter'],
]

const visibility = [
  ['showSystemName', 'System name'],
  ['showCompanyName', 'Company name'],
  ['showLocation', 'Location'],
  ['showTaxNumber', 'Tax number (NPWP)'],
  ['showDate', 'Date value'],
  ['showCustomer', 'Customer value'],
  ['showCashier', 'Cashier value'],
  ['showPaymentMethod', 'Payment method group'],
  ['showReference', 'Payment reference'],
  ['showTendered', 'Tendered (receipt only)'],
  ['showChange', 'Change (receipt only)'],
  ['showFooter', 'Configured footer'],
]

function payload() {
  return {
    systemName: form.systemName.trim(),
    companyName: form.companyName.trim(),
    location: form.location,
    taxNumber: form.taxNumber,
    receiptFooter: form.receiptFooter,
    billFooter: form.billFooter,
    receiptNumberFormat: form.receiptNumberFormat.trim(),
    receiptNumberPadding: Number(form.receiptNumberPadding),
    receiptSequenceReset: form.receiptSequenceReset,
    showSystemName: form.showSystemName,
    showCompanyName: form.showCompanyName,
    showLocation: form.showLocation,
    showTaxNumber: form.showTaxNumber,
    showDate: form.showDate,
    showCustomer: form.showCustomer,
    showCashier: form.showCashier,
    showPaymentMethod: form.showPaymentMethod,
    showReference: form.showReference,
    showTendered: form.showTendered,
    showChange: form.showChange,
    showFooter: form.showFooter,
  }
}

async function save() {
  error.value = ''
  notice.value = ''
  if (formatError.value) {
    error.value = formatError.value
    return
  }
  saving.value = true
  try {
    await saveSettings(payload())
    notice.value = 'Settings saved'
  } catch (e) {
    error.value = e.message
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await ensureSettings()
  Object.assign(form, settingsStore.data)
})
</script>

<template>
  <div class="max-w-4xl">
    <div class="rise rise-1">
      <div class="eyebrow">System</div>
      <h3 class="display text-2xl mt-1">Settings</h3>
      <p class="text-sm text-ink-2 mt-2">
        Branding and document presentation. Order totals and stored receipt numbers are never
        rewritten.
      </p>
    </div>

    <section class="plate p-5 mt-6 rise rise-2">
      <div class="eyebrow">Identity</div>
      <div class="grid sm:grid-cols-2 gap-4 mt-4">
        <div v-for="[key, label, placeholder] in textFields" :key="key">
          <label class="label" :for="`settings-${key}`">{{ label }}</label>
          <input
            :id="`settings-${key}`"
            v-model="form[key]"
            class="field"
            :placeholder="placeholder"
          />
        </div>
      </div>
    </section>

    <section class="plate p-5 mt-4 rise rise-2">
      <div class="eyebrow">Receipt number</div>
      <div class="grid sm:grid-cols-[1fr_140px_180px] gap-4 mt-4 items-start">
        <div>
          <label class="label" for="settings-format">Format</label>
          <input
            id="settings-format"
            v-model="form.receiptNumberFormat"
            class="field mono"
            placeholder="{:year}{:month}-{:order_no}"
          />
          <p class="mt-1 text-[11px] text-ink-3">
            Tokens: {:date} · {:year} · {:month} · {:order_no}
          </p>
        </div>
        <div>
          <label class="label" for="settings-padding">Order padding</label>
          <input
            id="settings-padding"
            v-model.number="form.receiptNumberPadding"
            class="field mono"
            type="number"
            min="1"
            max="10"
          />
        </div>
        <div>
          <label class="label" for="settings-reset">Sequence resets</label>
          <select id="settings-reset" v-model="form.receiptSequenceReset" class="field">
            <option value="YEARLY">Yearly</option>
            <option value="MONTHLY">Monthly</option>
            <option value="NEVER">Never</option>
          </select>
        </div>
      </div>
      <div class="plate-2 px-4 py-3 mt-4 flex items-center justify-between gap-3">
        <span class="eyebrow">Example</span>
        <span class="mono text-sm">{{ preview }}</span>
      </div>
      <p v-if="formatError" class="mt-2 text-xs text-ember">{{ formatError }}</p>
      <p v-else class="mt-2 text-xs text-ink-3">
        Existing receipts keep their stored number; changes apply to new orders.
      </p>
    </section>

    <section class="plate p-5 mt-4 rise rise-3">
      <div class="eyebrow">Bill &amp; receipt visibility</div>
      <p class="mt-1 text-xs text-ink-3">
        Tendered and change are always hidden on bills. The status line is always printed.
      </p>
      <div class="grid sm:grid-cols-2 gap-x-6 gap-y-2 mt-4">
        <label
          v-for="[key, label] in visibility"
          :key="key"
          class="flex items-center gap-2 text-sm"
        >
          <input v-model="form[key]" type="checkbox" class="accent-ember" />
          {{ label }}
        </label>
      </div>
    </section>

    <div class="flex flex-wrap items-center gap-3 mt-6 rise rise-4">
      <button class="btn-ember" :disabled="saving || Boolean(formatError)" @click="save">
        {{ saving ? 'Saving…' : 'Save settings' }}
      </button>
      <span v-if="notice" class="text-sm text-sage">{{ notice }}</span>
      <span v-if="error" class="text-sm text-ember">{{ error }}</span>
    </div>
  </div>
</template>
