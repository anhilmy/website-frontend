<script setup>
import { onMounted, reactive, ref } from 'vue'
import { users } from '../lib/resources'
import { dateOnly } from '../lib/format'

const rows = ref([])
const loading = ref(true)
const notice = ref('')
const form = reactive({ username: '', password: '', role: 'CASHIER' })

async function load() {
  loading.value = true
  try {
    rows.value = await users.list()
  } catch (e) {
    notice.value = e.message
  } finally {
    loading.value = false
  }
}

async function addUser() {
  notice.value = ''
  try {
    await users.create({
      username: form.username.trim(),
      password: form.password,
      role: form.role,
    })
    form.username = ''
    form.password = ''
    form.role = 'CASHIER'
    await load()
  } catch (e) {
    notice.value = e.message
  }
}

onMounted(load)
</script>

<template>
  <div class="grid lg:grid-cols-[1fr_340px] gap-8">
    <section class="rise rise-1">
      <div class="eyebrow">Team</div>
      <h3 class="display text-2xl mt-1 mb-6">Staff accounts</h3>

      <div class="plate overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left eyebrow border-b hairline">
              <th class="px-5 py-3 font-normal">User</th>
              <th class="px-5 py-3 font-normal">Role</th>
              <th class="px-5 py-3 font-normal">Joined</th>
              <th class="px-5 py-3 font-normal text-right">ID</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="u in rows"
              :key="u.id"
              class="border-b hairline last:border-0 hover:bg-paper-2/50"
            >
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-3">
                  <div
                    class="h-8 w-8 rounded-full bg-ink text-paper grid place-items-center mono text-[10px] font-bold"
                  >
                    {{ (u.username || '?').slice(0, 2).toUpperCase() }}
                  </div>
                  <span class="font-medium">{{ u.username }}</span>
                </div>
              </td>
              <td class="px-5 py-3.5">
                <span
                  class="tag"
                  :class="u.role === 'MANAGER' ? 'border-ember/60 text-ember' : 'border-ink/30 text-ink-2'"
                >
                  {{ u.role }}
                </span>
              </td>
              <td class="px-5 py-3.5 mono text-[12px] text-ink-3">{{ dateOnly(u.createdAt) }}</td>
              <td class="px-5 py-3.5 mono text-right text-ink-3">{{ u.id }}</td>
            </tr>
            <tr v-if="!loading && !rows.length">
              <td colspan="4" class="px-5 py-12 text-center text-ink-3">No users.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <aside class="rise rise-2">
      <div class="plate p-5">
        <div class="eyebrow mb-4">Add staff</div>
        <div class="space-y-3">
          <div>
            <label class="label">Username</label>
            <input v-model="form.username" class="field" placeholder="jordan" />
          </div>
          <div>
            <label class="label">Password</label>
            <input v-model="form.password" class="field" type="password" placeholder="8+ chars" />
          </div>
          <div>
            <label class="label">Role</label>
            <select v-model="form.role" class="field">
              <option value="CASHIER">Cashier</option>
              <option value="MANAGER">Manager</option>
            </select>
          </div>
          <button class="btn-ember w-full" @click="addUser">Create account</button>
        </div>
        <p v-if="notice" class="mt-3 text-xs text-ember">{{ notice }}</p>
      </div>
    </aside>
  </div>
</template>
