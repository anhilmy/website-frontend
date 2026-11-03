<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { nextActiveIndex, selectionLabel, toggleValue } from '../lib/multiselect'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  options: { type: Array, default: () => [] },
  label: { type: String, default: 'items' },
  placeholder: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  id: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

const uid = props.id || `multiselect-${Math.random().toString(36).slice(2, 9)}`
const root = ref(null)
const trigger = ref(null)
const panel = ref(null)
const open = ref(false)
const active = ref(-1)

const selectedCount = computed(() => (props.modelValue || []).length)
const triggerLabel = computed(() =>
  selectionLabel(props.modelValue, props.label, props.placeholder || undefined),
)

function toggle(option) {
  emit('update:modelValue', toggleValue(props.modelValue || [], option.value))
}

function clear() {
  emit('update:modelValue', [])
}

function openPanel() {
  if (props.disabled) return
  open.value = true
  const selected = (props.modelValue || [])[0]
  const index = props.options.findIndex((option) => option.value === selected)
  active.value = index >= 0 ? index : 0
  nextTick(() => panel.value?.focus())
}

function closePanel(returnFocus = true) {
  if (!open.value) return
  open.value = false
  if (returnFocus) nextTick(() => trigger.value?.focus())
}

function optionId(index) {
  return `${uid}-option-${index}`
}

function onTriggerKeydown(event) {
  if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
    event.preventDefault()
    openPanel()
  }
}

function onPanelKeydown(event) {
  if (event.key === 'Escape') {
    event.preventDefault()
    closePanel()
    return
  }
  if (event.key === 'Tab') {
    closePanel(false)
    return
  }
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    active.value = nextActiveIndex(
      active.value,
      props.options.length,
      event.key === 'ArrowDown' ? 1 : -1,
    )
    nextTick(() => document.getElementById(optionId(active.value))?.focus())
    return
  }
  if ((event.key === 'Enter' || event.key === ' ') && active.value >= 0) {
    event.preventDefault()
    toggle(props.options[active.value])
  }
}

function onDocumentClick(event) {
  if (root.value && !root.value.contains(event.target)) closePanel(false)
}

watch(
  () => props.disabled,
  (disabled) => {
    if (disabled) closePanel(false)
  },
)

onMounted(() => document.addEventListener('click', onDocumentClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick))
</script>

<template>
  <div ref="root" class="relative">
    <button
      :id="uid"
      ref="trigger"
      type="button"
      class="field flex w-full items-center gap-2 text-left"
      :class="{ 'text-ink-3': selectedCount === 0 }"
      :disabled="disabled"
      aria-haspopup="listbox"
      :aria-expanded="open"
      :aria-controls="`${uid}-panel`"
      @click.stop="open ? closePanel() : openPanel()"
      @keydown="onTriggerKeydown"
    >
      <span class="flex-1 truncate">{{ triggerLabel }}</span>
      <span class="mono text-[10px] tracking-widest text-ink-3">
        {{ selectedCount ? `${selectedCount}✓` : 'ALL' }}
      </span>
    </button>

    <div
      v-if="open"
      :id="`${uid}-panel`"
      ref="panel"
      class="absolute left-0 top-full z-50 mt-1.5 w-full min-w-[220px] plate py-1.5 shadow-lift"
      role="listbox"
      :aria-label="label"
      :aria-multiselectable="true"
      tabindex="-1"
      @click.stop
      @keydown="onPanelKeydown"
    >
      <button
        type="button"
        class="menu-item w-full justify-between"
        role="option"
        :aria-selected="selectedCount === 0"
        @click="clear"
      >
        <span>All {{ label }}</span>
        <span v-if="selectedCount === 0" class="mono text-[10px] text-sage">CLEAR</span>
      </button>
      <div class="dashed my-1.5 opacity-60"></div>
      <button
        v-for="(option, index) in options"
        :id="optionId(index)"
        :key="option.value"
        type="button"
        class="menu-item w-full justify-between"
        :class="{ 'bg-paper-2': active === index }"
        role="option"
        :aria-selected="(modelValue || []).includes(option.value)"
        @click="toggle(option)"
        @mouseenter="active = index"
      >
        <span class="flex min-w-0 items-center gap-2">
          <span
            class="grid h-4 w-4 shrink-0 place-items-center border hairline mono text-[10px]"
            :class="
              (modelValue || []).includes(option.value)
                ? 'bg-ink text-paper border-ink'
                : 'text-transparent'
            "
            aria-hidden="true"
          >✓</span>
          <span class="truncate">{{ option.label }}</span>
        </span>
        <span v-if="option.meta" class="mono text-[10px] text-ink-3">{{ option.meta }}</span>
      </button>
      <p v-if="!options.length" class="px-3 py-2 text-xs text-ink-3">Nothing to filter.</p>
    </div>
  </div>
</template>
