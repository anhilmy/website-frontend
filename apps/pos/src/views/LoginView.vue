<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { login } from '../lib/session'

const route = useRoute()
const router = useRouter()

const username = ref('')
const password = ref('')
const error = ref('')
const busy = ref(false)

function fill(u, p) {
  username.value = u
  password.value = p
  error.value = ''
}

async function submit() {
  error.value = ''
  busy.value = true
  try {
    await login(username.value.trim(), password.value)
    router.push(route.query.next || { name: 'terminal' })
  } catch (e) {
    error.value = e.message
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="min-h-screen grid lg:grid-cols-[1.15fr_1fr]">
    <!-- Brand panel -->
    <section class="relative hidden lg:flex flex-col justify-between bg-ink text-paper p-12 overflow-hidden">
      <div class="rise rise-1">
        <h2 class="text-[clamp(3.5rem,7vw,6.5rem)] text-ember">Point of Sale</h2>
        <h1 class="display text-[clamp(3.5rem,7vw,6.5rem)] leading-[0.92] mt-4 font-black">
          ChocoCaffe
        </h1>
        <p class="mt-5 max-w-md text-paper/70 text-lg leading-relaxed">
        </p>
      </div>

      <!-- Receipt motif -->
      <div class="relative max-w-sm rise rise-3">
        <div class="recv text-ink px-6 py-6 shadow-lift">
          <div class="flex items-center justify-between mono text-[11px] tracking-widest">
            <span>OPENING HOURS</span><span>01</span>
          </div>
          <div class="dashed my-3"></div>
          <ul class="mono text-[12px] space-y-1.5 text-ink-2">
            <li class="flex justify-between"><span>MON — THU</span><span>08:00 – 22:00</span></li>
            <li class="flex justify-between"><span>FRI — SAT</span><span>08:00 – 00:00</span></li>
            <li class="flex justify-between"><span>SUN</span><span>09:00 – 20:00</span></li>
          </ul>
          <div class="dashed my-3"></div>
          <div class="mono text-[11px] tracking-widest text-ink-3">
            THANK YOU · PLEASE COME AGAIN
          </div>
        </div>
      </div>

      <div class="eyebrow text-paper/40 rise rise-4">Powered by website-backend · Go to the counter</div>
    </section>

    <!-- Form -->
    <section class="flex items-center justify-center p-8">
      <div class="w-full max-w-sm">
        <div class="lg:hidden mb-8 rise rise-1">
          <div class="eyebrow text-ember">Point of sale</div>
          <h1 class="display text-5xl mt-2">Counter</h1>
        </div>

        <h2 class="display text-3xl rise rise-1">Open your shift</h2>
        <p class="text-ink-2 text-sm mt-2 rise rise-2">
          Sign in to start taking orders.
        </p>

        <form class="mt-8 space-y-4 rise rise-3" @submit.prevent="submit">
          <div>
            <label class="label" for="username">Cashier</label>
            <input
              id="username"
              v-model="username"
              class="field"
              autocomplete="username"
              placeholder="manager"
              required
            />
          </div>
          <div>
            <label class="label" for="password">Passcode</label>
            <input
              id="password"
              v-model="password"
              type="password"
              class="field"
              autocomplete="current-password"
              placeholder="••••••••"
              required
            />
          </div>

          <div
            v-if="error"
            class="plate-2 border-ember/50 px-3.5 py-2.5 text-sm text-ember flex items-center gap-2"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-ember"></span>
            {{ error }}
          </div>

          <button class="btn-ember w-full py-3 text-base" type="submit" :disabled="busy">
            {{ busy ? 'Opening…' : 'Open shift' }}
          </button>
        </form>

        <div class="mt-8 rise rise-4">
          <div class="eyebrow mb-2">Demo accounts</div>
          <div class="flex gap-2">
            <button class="btn btn-sm flex-1" type="button" @click="fill('manager', 'manager123')">
              Manager
            </button>
            <button class="btn btn-sm flex-1" type="button" @click="fill('cashier', 'cashier123')">
              Cashier
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
