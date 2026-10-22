<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { session, logout, isManager } from '../lib/session'
import { api } from '../lib/api'

const route = useRoute()
const router = useRouter()

const nav = computed(() => {
  const links = [
    { name: 'terminal', label: 'Terminal', hint: 'New order' },
    { name: 'orders', label: 'Orders', hint: 'History' },
    { name: 'menu', label: 'Menu', hint: 'Catalogue' },
  ]
  if (isManager()) links.push({ name: 'users', label: 'Staff', hint: 'Accounts' })
  return links
})

const activeName = computed(() => {
  if (route.name === 'order') return 'orders'
  return route.name
})

const title = computed(() => {
  const map = { terminal: 'Terminal', orders: 'Orders', order: 'Order', menu: 'Menu', users: 'Staff' }
  return map[route.name] || 'Counter'
})

const apiOnline = ref(false)
onMounted(async () => {
  try {
    await api.get('/healthcheck', { auth: false })
    apiOnline.value = true
  } catch {
    apiOnline.value = false
  }
})

async function signOut() {
  await logout()
  router.push({ name: 'login' })
}

const initials = computed(() => (session.user?.username || '?').slice(0, 2).toUpperCase())
</script>

<template>
  <div class="min-h-screen flex">
    <!-- Sidebar -->
    <aside class="w-[248px] shrink-0 border-r hairline bg-paper-2/60 flex flex-col">
      <div class="px-6 pt-7 pb-6">
        <RouterLink to="/terminal" class="block group">
          <div class="eyebrow text-ember">Est. 2026</div>
          <h1 class="display text-3xl leading-none mt-1 group-hover:text-ember transition-colors">
            Counter
          </h1>
          <div class="mono text-[10px] tracking-[0.2em] text-ink-3 mt-1.5">POINT OF SALE</div>
        </RouterLink>
      </div>

      <div class="px-4">
        <div class="dashed mb-4"></div>
        <nav class="space-y-1">
          <RouterLink
            v-for="link in nav"
            :key="link.name"
            :to="{ name: link.name }"
            class="nav-item"
            :class="{ 'nav-item-active': activeName === link.name }"
          >
            <span class="flex-1">{{ link.label }}</span>
            <span
              class="mono text-[10px] tracking-wider"
              :class="activeName === link.name ? 'text-paper/60' : 'text-ink-3'"
            >
              {{ link.hint }}
            </span>
          </RouterLink>
        </nav>
      </div>

      <div class="mt-auto px-4 pb-5">
        <div class="dashed mb-4"></div>
        <div class="flex items-center gap-3 px-1">
          <div
            class="h-9 w-9 rounded-full bg-ink text-paper grid place-items-center mono text-xs font-bold"
          >
            {{ initials }}
          </div>
          <div class="min-w-0 flex-1">
            <div class="text-sm font-semibold truncate">{{ session.user?.username }}</div>
            <div class="mono text-[10px] tracking-widest text-ink-3">
              {{ session.user?.role }}
            </div>
          </div>
        </div>
        <button class="btn btn-sm w-full mt-3" @click="signOut">Close shift</button>
      </div>
    </aside>

    <!-- Main -->
    <div class="flex-1 min-w-0 flex flex-col">
      <header class="h-16 border-b hairline flex items-center gap-6 px-8 bg-paper/80 backdrop-blur-sm">
        <h2 class="display text-xl">{{ title }}</h2>
        <div class="flex-1"></div>
        <div class="flex items-center gap-2 mono text-[11px] tracking-widest text-ink-3">
          <span
            class="h-2 w-2 rounded-full"
            :class="apiOnline ? 'bg-sage' : 'bg-ember'"
          ></span>
          {{ apiOnline ? 'API ONLINE' : 'API OFFLINE' }}
        </div>
      </header>

      <main class="flex-1 px-8 py-8">
        <slot />
      </main>
    </div>
  </div>
</template>
