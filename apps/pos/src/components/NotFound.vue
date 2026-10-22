<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="min-h-screen grid place-items-center p-6">
    <div class="recv px-10 py-12 max-w-md text-center shadow-lift rise rise-1">
      <div class="eyebrow">Counter · Error</div>
      <h1 class="display text-7xl font-black mt-3">404</h1>
      <div class="dashed my-6"></div>
      <p class="text-sm text-ink-2">
        That page isn't on the menu. It may have been removed, or the link is stale.
      </p>
      <div class="flex gap-3 justify-center mt-8">
        <button class="btn-ember" @click="router.push({ name: 'terminal' })">Back to terminal</button>
        <button class="btn" @click="router.back()">Go back</button>
      </div>
      <div class="dashed my-6"></div>
      <div class="mono text-[10px] tracking-[0.2em] text-ink-3">NOT FOUND</div>
    </div>
  </div>
</template>
