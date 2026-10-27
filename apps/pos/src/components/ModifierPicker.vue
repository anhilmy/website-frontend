<script setup>
import { computed, ref, watch } from 'vue'
import { money } from '../lib/format'
import {
  clearSelection,
  selectedCount,
  toggleSelection,
} from '../lib/modifier-selection'

const props = defineProps({
  item: { type: Object, required: true },
  groups: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
})

const emit = defineEmits(['add', 'close'])

const selected = ref([])
const note = ref('')
const quantity = ref(1)

function setQuantity(next) {
  quantity.value = Math.min(Math.max(1, Math.round(next) || 1), 99)
}

watch(
  () => props.groups,
  (groups) => {
    const defaults = []
    for (const group of groups) {
      const availableDefaults = (group.options || []).filter(
        (option) => option.isDefault && option.available,
      )
      if (group.selectionType === 'SINGLE') {
        if (availableDefaults[0]) defaults.push(availableDefaults[0].id)
      } else {
        const max = Number(group.maxSelect ?? 1)
        availableDefaults.slice(0, max).forEach((option) => defaults.push(option.id))
      }
    }
    selected.value = defaults
  },
  { immediate: true },
)

const optionById = computed(() => {
  const map = new Map()
  for (const group of props.groups) {
    for (const option of group.options || []) map.set(option.id, { group, option })
  }
  return map
})

const chosen = computed(() =>
  selected.value.map((id) => optionById.value.get(id)).filter(Boolean),
)

function countFor(group) {
  return selectedCount(selected.value, group)
}

function minFor(group) {
  const min = Number(group.minSelect ?? 0)
  return group.required && min < 1 ? 1 : min
}

function groupError(group) {
  const count = countFor(group)
  if (count < minFor(group)) return `Choose at least ${minFor(group)}`
  if (count > Number(group.maxSelect ?? 1)) {
    return `Choose at most ${group.maxSelect}`
  }
  if (group.selectionType === 'SINGLE' && count > 1) return 'Choose one'
  return ''
}

const valid = computed(() => props.groups.every((group) => !groupError(group)))

function toggle(group, option) {
  selected.value = toggleSelection(selected.value, group, option)
}

function clearGroup(group) {
  selected.value = clearSelection(selected.value, group)
}

const unitPrice = computed(() => {
  const base = Number(props.item.price || 0)
  const deltas = chosen.value.reduce(
    (sum, { option }) => sum + Number(option.priceDelta || 0),
    0,
  )
  return base + deltas
})

const lineTotal = computed(() => unitPrice.value * quantity.value)

function add() {
  if (!valid.value || props.loading || props.error) return
  emit('add', {
    optionIds: [...selected.value],
    modifiers: chosen.value.map(({ group, option }) => ({
      modifierOptionId: option.id,
      groupName: group.name,
      optionName: option.name,
      priceDelta: Number(option.priceDelta || 0),
    })),
    unitPrice: unitPrice.value,
    note: note.value.trim(),
    quantity: quantity.value,
  })
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4"
    @click.self="emit('close')"
  >
    <div class="plate w-full max-w-lg p-6 rise">
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="eyebrow">Customize</div>
          <h3 class="display text-2xl mt-1">{{ item.name }}</h3>
          <p class="mono text-[11px] text-ink-3 mt-1">
            BASE {{ money(item.price) }}
          </p>
        </div>
        <button class="btn btn-ghost btn-sm" type="button" @click="emit('close')">
          Close
        </button>
      </div>

      <div class="dashed my-4"></div>

      <p v-if="loading" class="text-sm text-ink-3 py-6 text-center">
        Loading options…
      </p>
      <p v-else-if="error" class="text-sm text-ember py-6 text-center">{{ error }}</p>

      <div v-else class="space-y-5 max-h-[52vh] overflow-y-auto pr-1">
        <section v-for="group in groups" :key="group.id">
          <div class="flex items-baseline justify-between gap-2">
            <div class="flex items-baseline gap-2 min-w-0">
              <span class="eyebrow">{{ group.name }}</span>
              <span v-if="group.required" class="tag border-ember/50 text-ember">
                required
              </span>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <span class="mono text-[10px] text-ink-3">
                {{
                  group.selectionType === 'SINGLE'
                    ? 'choose one'
                    : `${group.minSelect ?? 0}–${group.maxSelect ?? 1}`
                }}
              </span>
              <button
                v-if="countFor(group) > 0 && !group.required"
                type="button"
                class="btn btn-ghost btn-sm"
                @click="clearGroup(group)"
              >
                Clear
              </button>
            </div>
          </div>

          <div class="mt-2 space-y-1.5">
            <label
              v-for="option in group.options"
              :key="option.id"
              class="flex items-center gap-3 rounded-card border hairline px-3 py-2"
              :class="[
                option.available ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed',
                selected.includes(option.id) ? 'border-ember/60 bg-ember/5' : '',
              ]"
            >
              <input
                :type="group.selectionType === 'SINGLE' ? 'radio' : 'checkbox'"
                :name="`modifier-group-${group.id}`"
                :checked="selected.includes(option.id)"
                :disabled="
                  !option.available ||
                  (group.selectionType === 'MULTI' &&
                    !selected.includes(option.id) &&
                    countFor(group) >= Number(group.maxSelect ?? 1))
                "
                class="accent-ember"
                @change="toggle(group, option)"
              />
              <span class="flex-1 text-sm">{{ option.name }}</span>
              <span
                v-if="Number(option.priceDelta)"
                class="mono text-xs text-ink-3 whitespace-nowrap"
              >
                {{ Number(option.priceDelta) > 0 ? '+' : '' }}{{ money(option.priceDelta) }}
              </span>
              <span v-if="!option.available" class="mono text-[10px] text-ink-3">
                unavailable
              </span>
            </label>
            <p v-if="!group.options?.length" class="text-xs text-ink-3">
              No options configured.
            </p>
          </div>

          <p v-if="groupError(group)" class="mt-1.5 text-[11px] text-ember">
            {{ groupError(group) }}
          </p>
          <p
            v-else-if="
              group.selectionType === 'MULTI' &&
              countFor(group) >= Number(group.maxSelect ?? 1)
            "
            class="mt-1.5 text-[11px] text-ink-3"
          >
            Maximum {{ group.maxSelect }} selected.
          </p>
        </section>

        <div>
          <label class="label" for="modifier-note">Note for the kitchen</label>
          <input
            id="modifier-note"
            v-model="note"
            class="field"
            maxlength="255"
            placeholder="no sugar, extra hot…"
          />
        </div>
      </div>

      <div class="dashed my-4"></div>

      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <span class="text-sm text-ink-2">Quantity</span>
          <button
            type="button"
            class="h-7 w-7 grid place-items-center border hairline rounded-card text-ink-2 hover:bg-paper-2 disabled:opacity-40"
            :disabled="quantity <= 1"
            @click="setQuantity(quantity - 1)"
          >
            –
          </button>
          <span class="mono text-sm w-6 text-center">{{ quantity }}</span>
          <button
            type="button"
            class="h-7 w-7 grid place-items-center border hairline rounded-card text-ink-2 hover:bg-paper-2 disabled:opacity-40"
            :disabled="quantity >= 99"
            @click="setQuantity(quantity + 1)"
          >
            +
          </button>
        </div>
        <span class="mono text-xs text-ink-3">{{ money(unitPrice) }} each</span>
      </div>

      <div class="flex items-baseline justify-between mt-2">
        <span class="text-sm text-ink-2">Line total</span>
        <span class="mono text-xl font-bold">{{ money(lineTotal) }}</span>
      </div>

      <div class="flex gap-3 mt-5">
        <button
          class="btn-ember flex-1 py-3"
          type="button"
          :disabled="loading || !!error || !valid"
          @click="add"
        >
          Add to ticket
        </button>
        <button class="btn" type="button" @click="emit('close')">Cancel</button>
      </div>
    </div>
  </div>
</template>
