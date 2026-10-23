<script setup>
import { computed } from 'vue'
import { statusTone } from '../lib/format'

const props = defineProps({
  status: { type: String, required: true },
})

const toneClass = computed(() => {
  const map = {
    ink: 'border-ink/40 text-ink',
    sage: 'border-sage/50 text-sage',
    mustard: 'border-mustard/60 text-mustard',
    ember: 'border-ember/60 text-ember',
    teal: 'border-teal/50 text-teal',
    muted: 'border-ink/30 text-ink-3',
  }
  return map[statusTone(props.status)] || map.ink
})
</script>

<template>
  <span class="tag" :class="toneClass">
    <span class="h-1.5 w-1.5 rounded-full bg-current"></span>
    {{ status.replace(/_/g, ' ') }}
  </span>
</template>
