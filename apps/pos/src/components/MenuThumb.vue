<script setup>
import { ref, watch } from 'vue'
import { API_BASE } from '../lib/api'
import { resolveMediaUrl } from '../lib/media'

const props = defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: '' },
  variant: { type: String, default: 'square' },
})

const failed = ref(false)
const initial = () => (props.alt || '?').trim().charAt(0).toUpperCase()

watch(
  () => props.src,
  () => {
    failed.value = false
  },
)
</script>

<template>
  <div
    class="menu-thumb"
    :class="variant === 'banner' ? 'menu-thumb-banner' : 'menu-thumb-square'"
  >
    <img
      v-if="src && !failed"
      :src="resolveMediaUrl(src, API_BASE)"
      :alt="alt"
      loading="lazy"
      @error="failed = true"
    />
    <span v-else class="display" aria-hidden="true">{{ initial() }}</span>
  </div>
</template>
