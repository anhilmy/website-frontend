<script setup>
import { onMounted, reactive, ref } from 'vue'
import { users } from '../lib/resources'
import { dateOnly } from '../lib/format'
import { session } from '../lib/session'

const rows = ref([])
const loading = ref(true)
const notice = ref('')
const busyId = ref(null)
const form = reactive({ username: '', password: '', role: 'CASHIER' })

const resetOpen = ref(false)
const resetTarget = ref(null)
const resetForm = reactive({ password: '', confirm: '' })
const resetError = ref('')

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

function isSelf(user) {
  return user.id === session.user?.id
}

async function toggleActive(user) {
  const next = user.active === false
  if (!next && !window.confirm(`Disable ${user.username}? They will be signed out immediately.`)) {
    return
  }
  busyId.value = user.id
  notice.value = ''
  try {
    await users.setActive(user.id, next)
    await load()
  } catch (e) {
    notice.value = e.message
  } finally {
    busyId.value = null
  }
}

function startReset(user) {
  resetTarget.value = user
  resetForm.password = ''
  resetForm.confirm = ''
  resetError.value = ''
  resetOpen.value = true
}

async function submitReset() {
  if (!resetTarget.value) return
  if (resetForm.password !== resetForm.confirm) {
    resetError.value = 'Passwords do not match'
    return
  }
  resetError.value = ''
  try {
    await users.resetPassword(resetTarget.value.id, resetForm.password)
    resetOpen.value = false
  } catch (e) {
    resetError.value = e.message
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
              <th class="px-5 py-3 font-normal">Status</th>
              <th class="px-5 py-3 font-normal">Joined</th>
              <th class="px-5 py-3 font-normal text-right">Actions</th>
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
                  <span v-if="isSelf(u)" class="tag border-ink/30 text-ink-3">you</span>
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
              <td class="px-5 py-3.5">
                <span
                  class="tag"
                  :class="
                    u.active === false
                      ? 'border-ink/30 text-ink-3'
                      : 'border-sage/50 text-sage'
                  "
                >
                  {{ u.active === false ? 'Disabled' : 'Enabled' }}
                </span>
              </td>
              <td class="px-5 py-3.5 mono text-[12px] text-ink-3">{{ dateOnly(u.createdAt) }}</td>
              <td class="px-5 py-3.5 text-right whitespace-nowrap">
                <div class="inline-flex items-center gap-1">
                  <button
                    class="btn btn-ghost btn-sm"
                    :disabled="busyId === u.id || isSelf(u)"
                    :title="isSelf(u) ? 'You cannot disable your own account' : undefined"
                    @click="toggleActive(u)"
                  >
                    {{ u.active === false ? 'Enable' : 'Disable' }}
                  </button>
                  <button class="btn btn-ghost btn-sm" @click="startReset(u)">
                    Reset password
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!loading && !rows.length">
              <td colspan="5" class="px-5 py-12 text-center text-ink-3">No users.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="mt-3 text-xs text-ink-3">
        At least one active manager must remain. Disabling an account signs it out immediately.
      </p>
    </section>

    <aside class="rise rise-2">
      <div class="plate p-5">
        <div class="eyebrow mb-4">Add staff</div>
        <div class="space-y-3">
          <div>
            <label class="label" for="new-username">Username</label>
            <input id="new-username" v-model="form.username" class="field" placeholder="jordan" />
          </div>
          <div>
            <label class="label" for="new-password">Password</label>
            <input
              id="new-password"
              v-model="form.password"
              class="field"
              type="password"
              placeholder="8+ chars"
            />
          </div>
          <div>
            <label class="label" for="new-role">Role</label>
            <select id="new-role" v-model="form.role" class="field">
              <option value="CASHIER">Cashier</option>
              <option value="MANAGER">Manager</option>
            </select>
          </div>
          <button class="btn-ember w-full" @click="addUser">Create account</button>
        </div>
        <p v-if="notice" class="mt-3 text-xs text-ember">{{ notice }}</p>
      </div>
    </aside>

    <!-- Reset password dialog -->
    <div
      v-if="resetOpen"
      class="fixed inset-0 z-40 grid place-items-center bg-ink/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-title"
      @click.self="resetOpen = false"
      @keydown.esc="resetOpen = false"
    >
      <div class="plate w-full max-w-sm p-6 rise">
        <div class="flex items-center justify-between">
          <div id="reset-title" class="eyebrow">
            Reset password · {{ resetTarget?.username }}
          </div>
          <button class="btn btn-ghost btn-sm" @click="resetOpen = false">Close</button>
        </div>
        <div class="dashed my-4"></div>
        <div class="space-y-3">
          <div>
            <label class="label" for="reset-password">New password</label>
            <input
              id="reset-password"
              v-model="resetForm.password"
              class="field"
              type="password"
              autofocus
              placeholder="8+ chars"
            />
          </div>
          <div>
            <label class="label" for="reset-confirm">Confirm password</label>
            <input
              id="reset-confirm"
              v-model="resetForm.confirm"
              class="field"
              type="password"
              placeholder="Repeat password"
            />
          </div>
        </div>
        <p v-if="resetError" class="mt-3 text-xs text-ember">{{ resetError }}</p>
        <div class="flex gap-3 mt-6">
          <button
            class="btn-ember flex-1"
            :disabled="!resetForm.password || !resetForm.confirm"
            @click="submitReset"
          >
            Reset password
          </button>
          <button class="btn" @click="resetOpen = false">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>
