<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { tables } from '../lib/resources'
import { money } from '../lib/format'
import { isManager } from '../lib/session'
import StatusTag from '../components/StatusTag.vue'

const router = useRouter()
const canEdit = isManager()

const list = ref([])
const loading = ref(true)
const notice = ref('')
const busyId = ref(null)
const activeArea = ref('')
const openMenuId = ref(null)

const joinFor = ref(null)
const joinTarget = ref(null)
const dialogError = ref('')

const releaseFor = ref(null)
const releaseError = ref('')

const formOpen = ref(false)
const editId = ref(null)
const form = reactive({ name: '', area: '' })

const STATUS_META = {
  AVAILABLE: { hint: 'Free', dot: 'bg-sage' },
  RESERVED: { hint: 'Held', dot: 'bg-mustard' },
  OCCUPIED: { hint: 'Seated', dot: 'bg-ember' },
  JOINED: { hint: 'Merged', dot: 'bg-teal' },
  CLEANING: { hint: 'Turnaround', dot: 'bg-ink-3' },
  OUT_OF_SERVICE: { hint: 'Closed', dot: 'bg-ink-3' },
}

const areas = computed(() => [...new Set(list.value.map((t) => t.area))].sort())

const grouped = computed(() => {
  const shown = activeArea.value ? list.value.filter((t) => t.area === activeArea.value) : list.value
  const byArea = {}
  for (const t of shown) (byArea[t.area] ||= []).push(t)
  return Object.entries(byArea).sort(([a], [b]) => a.localeCompare(b))
})

const counts = computed(() => {
  const c = {}
  for (const t of list.value) c[t.status] = (c[t.status] || 0) + 1
  return c
})

const joinCandidates = computed(() => {
  if (!joinFor.value) return []
  return list.value.filter(
    (t) =>
      t.id !== joinFor.value.id &&
      !t.joinedToId &&
      !['OUT_OF_SERVICE', 'CLEANING'].includes(t.status),
  )
})

const canRename = (t) =>
  canEdit && !t.currentTransactionId && ['AVAILABLE', 'RESERVED', 'CLEANING'].includes(t.status)

async function load() {
  loading.value = true
  notice.value = ''
  try {
    list.value = await tables.list()
  } catch (e) {
    notice.value = e.message
  } finally {
    loading.value = false
  }
}

async function run(table, fn) {
  busyId.value = table.id
  notice.value = ''
  try {
    await fn()
    await load()
    return true
  } catch (e) {
    notice.value = e.message
    return false
  } finally {
    busyId.value = null
  }
}

const openTable = (t) =>
  run(t, async () => {
    const updated = await tables.open(t.id)
    if (updated?.currentTransactionId) {
      router.push({ name: 'terminal', query: { order: updated.currentTransactionId } })
    }
  })

const takeOrder = (t) => router.push({ name: 'terminal', query: { order: t.currentTransactionId } })

function printBill(t) {
  if (!t.currentTransactionId) return
  const target = router.resolve({
    name: 'print-order',
    params: { id: t.currentTransactionId },
    query: { mode: 'bill' },
  })
  window.open(target.href, '_blank', 'noopener')
}
const unjoin = (t) => run(t, () => tables.unjoin(t.id))
const setStatus = (t, status) => run(t, () => tables.setStatus(t.id, status))

function toggleMenu(t) {
  openMenuId.value = openMenuId.value === t.id ? null : t.id
}

function runMenu(t, fn) {
  openMenuId.value = null
  return fn()
}

function askRelease(t) {
  releaseFor.value = t
  releaseError.value = ''
}

async function confirmRelease() {
  const t = releaseFor.value
  if (!t) return
  releaseError.value = ''
  busyId.value = t.id
  try {
    await tables.release(t.id)
    releaseFor.value = null
    await load()
  } catch (e) {
    releaseError.value = e.message
  } finally {
    busyId.value = null
  }
}

function startJoin(t) {
  joinFor.value = t
  joinTarget.value = null
  dialogError.value = ''
}

async function confirmJoin() {
  if (!joinTarget.value) return
  dialogError.value = ''
  busyId.value = joinFor.value.id
  try {
    await tables.join(joinFor.value.id, joinTarget.value)
    joinFor.value = null
    joinTarget.value = null
    await load()
  } catch (e) {
    dialogError.value = e.message // keep the dialog open so the reason is visible
  } finally {
    busyId.value = null
  }
}

function startCreate() {
  editId.value = null
  form.name = ''
  form.area = ''
  dialogError.value = ''
  formOpen.value = true
}

function startEdit(t) {
  editId.value = t.id
  form.name = t.name
  form.area = t.area
  dialogError.value = ''
  formOpen.value = true
}

async function saveTable() {
  if (!form.name.trim() || !form.area.trim()) return
  dialogError.value = ''
  try {
    const body = { name: form.name.trim(), area: form.area.trim() }
    if (editId.value) await tables.update(editId.value, body)
    else await tables.create(body)
    formOpen.value = false
    await load()
  } catch (e) {
    dialogError.value = e.message
  }
}

async function removeTable(t) {
  if (!window.confirm(`Remove table ${t.name}? This cannot be undone.`)) return
  await run(t, () => tables.remove(t.id))
}

function closeMenus() {
  openMenuId.value = null
}

function onKeydown(e) {
  if (e.key === 'Escape') closeMenus()
}

onMounted(() => {
  load()
  document.addEventListener('click', closeMenus)
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', closeMenus)
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div>
    <div class="flex flex-wrap items-end justify-between gap-4 rise rise-1">
      <div>
        <div class="eyebrow">Floor plan</div>
        <h3 class="display text-2xl mt-1">Tables</h3>
      </div>
      <div class="flex items-center gap-4">
        <div class="hidden md:flex flex-wrap justify-end items-center gap-x-5 gap-y-2">
          <span
            v-for="(meta, key) in STATUS_META"
            :key="key"
            class="flex items-center gap-2 mono text-sm tracking-wide text-ink-2"
          >
            <span class="h-3 w-3 rounded-full" :class="meta.dot"></span>
            {{ key.replaceAll('_', ' ') }} · {{ counts[key] || 0 }}
          </span>
        </div>
        <button v-if="canEdit" class="btn-ember" @click="startCreate">Add table</button>
      </div>
    </div>

    <div class="flex flex-wrap gap-2 mt-5 rise rise-2">
      <button
        class="btn btn-sm"
        :class="{ 'btn-active': !activeArea }"
        @click="activeArea = ''"
      >
        All areas
      </button>
      <button
        v-for="a in areas"
        :key="a"
        class="btn btn-sm"
        :class="{ 'btn-active': activeArea === a }"
        @click="activeArea = a"
      >
        {{ a }}
      </button>
    </div>

    <p v-if="notice" class="mt-4 text-sm text-ember">{{ notice }}</p>
    <p v-else-if="loading" class="mt-6 text-sm text-ink-3">Reading the floor…</p>

    <section v-for="([area, tablesInArea], idx) in grouped" :key="area" class="mt-8">
      <div class="flex items-center gap-3">
        <h4 class="display text-lg">{{ area }}</h4>
        <div class="flex-1 dashed"></div>
        <span class="eyebrow">{{ tablesInArea.length }} tables</span>
      </div>

      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
        <article
          v-for="t in tablesInArea"
          :key="t.id"
          class="plate relative p-5 flex flex-col transition-all hover:shadow-lift rise"
          :class="[
            `rise-${Math.min(idx + 1, 5)}`,
            t.status === 'OUT_OF_SERVICE' ? 'opacity-60' : '',
            openMenuId === t.id ? 'z-20' : '',
          ]"
        >
          <div class="flex items-start justify-between gap-2">
            <div>
              <div class="display text-4xl leading-none">{{ t.name }}</div>
              <div class="mono text-[11px] tracking-widest text-ink-3 mt-2">
                {{ STATUS_META[t.status]?.hint?.toUpperCase() }}
              </div>
            </div>
            <StatusTag :status="t.status" />
          </div>

          <div class="mt-4 pt-4 border-t hairline flex-1">
            <RouterLink
              v-if="t.currentTransactionId"
              :to="{ name: 'order', params: { id: t.currentTransactionId } }"
              class="flex items-baseline justify-between group"
            >
              <span class="mono text-base text-ink-2 group-hover:text-ember transition-colors">
                #{{ String(t.currentTransactionId).padStart(3, '0') }}
              </span>
              <span class="mono text-base font-medium">{{ money(t.currentTransactionTotal) }}</span>
            </RouterLink>
            <p v-else class="text-base text-ink-3">No open bill</p>

            <p v-if="t.joinedToName" class="mono text-[11px] text-teal mt-1.5">
              JOINED TO {{ t.joinedToName }}
            </p>
          </div>

          <div class="flex items-center gap-2 mt-5">
            <button
              v-if="['AVAILABLE', 'RESERVED'].includes(t.status)"
              class="btn btn-sm"
              :disabled="busyId === t.id"
              @click="openTable(t)"
            >
              Open table
            </button>
            <button
              v-if="t.status === 'AVAILABLE'"
              class="btn btn-ghost btn-sm"
              :disabled="busyId === t.id"
              @click="setStatus(t, 'RESERVED')"
            >
              Reserve
            </button>
            <button
              v-if="['AVAILABLE', 'RESERVED', 'CLEANING'].includes(t.status)"
              class="btn btn-ghost btn-sm"
              :disabled="busyId === t.id"
              @click="setStatus(t, 'OUT_OF_SERVICE')"
            >
              Close
            </button>

            <div class="relative ml-auto">
              <button
                class="btn-icon"
                type="button"
                title="More actions"
                aria-label="More actions"
                aria-haspopup="menu"
                :aria-expanded="openMenuId === t.id"
                @click.stop="toggleMenu(t)"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <circle cx="8" cy="3" r="1.4" />
                  <circle cx="8" cy="8" r="1.4" />
                  <circle cx="8" cy="13" r="1.4" />
                </svg>
              </button>

              <div
                v-if="openMenuId === t.id"
                class="absolute right-0 top-full mt-1.5 z-30 min-w-[190px] plate py-1.5 shadow-lift"
                role="menu"
                @click.stop
              >
                <button
                  v-if="t.status === 'RESERVED'"
                  class="menu-item"
                  role="menuitem"
                  :disabled="busyId === t.id"
                  @click="runMenu(t, () => setStatus(t, 'AVAILABLE'))"
                >
                  Unreserve
                </button>
                <button
                  v-if="['OCCUPIED', 'JOINED'].includes(t.status) && t.currentTransactionId"
                  class="menu-item"
                  role="menuitem"
                  :disabled="busyId === t.id"
                  @click="runMenu(t, () => takeOrder(t))"
                >
                  Take order
                </button>
                <button
                  v-if="['OCCUPIED', 'JOINED'].includes(t.status) && t.currentTransactionId"
                  class="menu-item"
                  role="menuitem"
                  :disabled="busyId === t.id"
                  @click="runMenu(t, () => printBill(t))"
                >
                  Print bill
                </button>
                <button
                  v-if="['AVAILABLE', 'RESERVED', 'OCCUPIED'].includes(t.status)"
                  class="menu-item"
                  role="menuitem"
                  :disabled="busyId === t.id"
                  @click="runMenu(t, () => startJoin(t))"
                >
                  Join…
                </button>
                <button
                  v-if="t.status === 'JOINED'"
                  class="menu-item"
                  role="menuitem"
                  :disabled="busyId === t.id"
                  @click="runMenu(t, () => unjoin(t))"
                >
                  Unjoin
                </button>
                <button
                  v-if="t.status === 'OCCUPIED'"
                  class="menu-item"
                  role="menuitem"
                  :disabled="busyId === t.id"
                  @click="runMenu(t, () => askRelease(t))"
                >
                  Release
                </button>
                <button
                  v-if="t.status === 'CLEANING'"
                  class="menu-item"
                  role="menuitem"
                  :disabled="busyId === t.id"
                  @click="runMenu(t, () => setStatus(t, 'AVAILABLE'))"
                >
                  Mark ready
                </button>
                <button
                  v-if="t.status === 'OUT_OF_SERVICE'"
                  class="menu-item"
                  role="menuitem"
                  :disabled="busyId === t.id"
                  @click="runMenu(t, () => setStatus(t, 'AVAILABLE'))"
                >
                  Return to service
                </button>
                <template v-if="canRename(t)">
                  <div class="dashed my-1.5 opacity-60"></div>
                  <button
                    class="menu-item"
                    role="menuitem"
                    :disabled="busyId === t.id"
                    @click="runMenu(t, () => startEdit(t))"
                  >
                    Rename
                  </button>
                  <button
                    class="menu-item text-ember hover:text-ember"
                    role="menuitem"
                    :disabled="busyId === t.id"
                    @click="runMenu(t, () => removeTable(t))"
                  >
                    Remove
                  </button>
                </template>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>

    <p v-if="!loading && !grouped.length" class="mt-8 text-sm text-ink-3">
      No tables yet. {{ canEdit ? 'Add one to get started.' : 'Ask a manager to set up the floor.' }}
    </p>

    <!-- Join dialog -->
    <div
      v-if="joinFor"
      class="fixed inset-0 z-40 grid place-items-center bg-ink/40 p-4"
      @click.self="joinFor = null"
    >
      <div class="plate w-full max-w-md p-6 rise">
        <div class="flex items-center justify-between">
          <div class="eyebrow">Join table</div>
          <button class="btn btn-ghost btn-sm" @click="joinFor = null">Close</button>
        </div>
        <div class="dashed my-4"></div>
        <p class="text-sm text-ink-2">
          Merge <strong>{{ joinFor.name }}</strong> into another table. Both then share one bill.
        </p>
        <div class="mt-4">
          <label class="label">Join into</label>
          <select v-model="joinTarget" class="field">
            <option :value="null" disabled>Select a host table…</option>
            <option v-for="c in joinCandidates" :key="c.id" :value="c.id">
              {{ c.name }} — {{ c.area }} ({{ c.status.replace('_', ' ').toLowerCase() }})
            </option>
          </select>
          <p v-if="!joinCandidates.length" class="mt-2 text-xs text-ink-3">
            No table available to join into.
          </p>
        </div>
        <p v-if="dialogError" class="mt-3 text-xs text-ember">{{ dialogError }}</p>
        <div class="flex gap-3 mt-6">
          <button class="btn-ember flex-1" :disabled="!joinTarget" @click="confirmJoin">Join tables</button>
          <button class="btn" @click="joinFor = null">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Release confirmation -->
    <div
      v-if="releaseFor"
      class="fixed inset-0 z-40 grid place-items-center bg-ink/40 p-4"
      @click.self="releaseFor = null"
    >
      <div class="plate w-full max-w-sm p-6 rise">
        <div class="flex items-center justify-between">
          <div class="eyebrow">Release table</div>
          <button class="btn btn-ghost btn-sm" @click="releaseFor = null">Close</button>
        </div>
        <div class="dashed my-4"></div>
        <p class="text-sm text-ink-2">
          Release <strong>{{ releaseFor.name }}</strong>?
          <template v-if="releaseFor.currentTransactionId">
            Its open bill will be cancelled
          </template>
          <template v-else> The table will be freed</template>
          and sent to cleaning.
        </p>
        <p v-if="releaseError" class="mt-3 text-xs text-ember">{{ releaseError }}</p>
        <div class="flex gap-3 mt-6">
          <button
            class="btn-ember flex-1"
            :disabled="busyId === releaseFor.id"
            @click="confirmRelease"
          >
            Release table
          </button>
          <button class="btn" @click="releaseFor = null">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Add / rename dialog -->
    <div
      v-if="formOpen"
      class="fixed inset-0 z-40 grid place-items-center bg-ink/40 p-4"
      @click.self="formOpen = false"
    >
      <div class="plate w-full max-w-sm p-6 rise">
        <div class="flex items-center justify-between">
          <div class="eyebrow">{{ editId ? 'Edit table' : 'Add table' }}</div>
          <button class="btn btn-ghost btn-sm" @click="formOpen = false">Close</button>
        </div>
        <div class="dashed my-4"></div>
        <div class="space-y-3">
          <div>
            <label class="label">Name</label>
            <input v-model="form.name" class="field" placeholder="T7" />
          </div>
          <div>
            <label class="label">Area</label>
            <input v-model="form.area" class="field" placeholder="Indoor" />
          </div>
        </div>
        <p v-if="dialogError" class="mt-3 text-xs text-ember">{{ dialogError }}</p>
        <div class="flex gap-3 mt-6">
          <button class="btn-ember flex-1" @click="saveTable">
            {{ editId ? 'Save changes' : 'Create table' }}
          </button>
          <button class="btn" @click="formOpen = false">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>
