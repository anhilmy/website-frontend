<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import Pencil from '@primevue/icons/pencil'
import Trash from '@primevue/icons/trash'
import Times from '@primevue/icons/times'
import { categories as catApi, items as itemApi } from '../lib/resources'
import { isManager } from '../lib/session'
import { money } from '../lib/format'

const canEdit = isManager()

const categories = ref([])
const items = ref([])
const search = ref('')
const loading = ref(true)
const notice = ref('')

const catForm = reactive({ name: '', description: '' })
const itemForm = reactive({
  id: null,
  name: '',
  description: '',
  price: '',
  categoryId: null,
  available: true,
})
const editing = ref(false)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return items.value
  return items.value.filter(
    (i) =>
      i.name.toLowerCase().includes(q) ||
      (i.menuCategory?.name || '').toLowerCase().includes(q),
  )
})

async function loadAll() {
  loading.value = true
  try {
    const [c, i] = await Promise.all([catApi.list(), itemApi.list()])
    categories.value = c
    items.value = i
  } catch (e) {
    notice.value = e.message
  } finally {
    loading.value = false
  }
}

async function addCategory() {
  if (!catForm.name.trim()) return
  try {
    await catApi.create({ name: catForm.name.trim(), description: catForm.description })
    catForm.name = ''
    catForm.description = ''
    await loadAll()
  } catch (e) {
    notice.value = e.message
  }
}

async function removeCategory(c) {
  try {
    await catApi.deactivate(c.id)
    await loadAll()
  } catch (e) {
    notice.value = e.message
  }
}

function startCreate() {
  Object.assign(itemForm, {
    id: null,
    name: '',
    description: '',
    price: '',
    categoryId: categories.value[0]?.id ?? null,
    available: true,
  })
  editing.value = true
}

function startEdit(item) {
  Object.assign(itemForm, {
    id: item.id,
    name: item.name,
    description: item.description || '',
    price: String(item.price),
    categoryId: item.menuCategory?.id ?? null,
    available: item.available,
  })
  editing.value = true
}

async function saveItem() {
  const payload = {
    name: itemForm.name.trim(),
    description: itemForm.description,
    price: Number(itemForm.price),
    categoryId: itemForm.categoryId,
    available: itemForm.available,
  }
  try {
    if (itemForm.id) await itemApi.update(itemForm.id, payload)
    else await itemApi.create(payload)
    editing.value = false
    await loadAll()
  } catch (e) {
    notice.value = e.message
  }
}

async function toggleAvailable(item) {
  try {
    await itemApi.update(item.id, { available: !item.available })
    await loadAll()
  } catch (e) {
    notice.value = e.message
  }
}

async function removeItem(item) {
  try {
    await itemApi.deactivate(item.id)
    await loadAll()
  } catch (e) {
    notice.value = e.message
  }
}

onMounted(loadAll)
</script>

<template>
  <div>
    <div class="flex flex-wrap items-end justify-between gap-4 rise rise-1">
      <div>
        <div class="eyebrow">Catalogue</div>
        <h3 class="display text-2xl mt-1">Menu</h3>
      </div>
      <div class="flex items-center gap-3">
        <input v-model="search" class="field max-w-[240px]" placeholder="Search items…" />
        <button v-if="canEdit" class="btn-ember" @click="startCreate">New item</button>
      </div>
    </div>

    <p v-if="!canEdit" class="mt-3 text-xs text-ink-3">
      Read-only — sign in as a manager to change the menu.
    </p>
    <p v-if="notice" class="mt-3 text-sm text-ember">{{ notice }}</p>

    <div class="grid lg:grid-cols-[320px_1fr] gap-8 mt-6">
      <!-- Categories -->
      <section class="rise rise-2">
        <div class="plate p-5">
          <div class="eyebrow mb-4">Categories</div>
          <ul class="space-y-2">
            <li
              v-for="c in categories"
              :key="c.id"
              class="flex items-center justify-between gap-2 py-1.5 border-b hairline last:border-0"
            >
              <div class="min-w-0">
                <div class="text-sm font-medium truncate">{{ c.name }}</div>
                <div class="text-[11px] text-ink-3 truncate">{{ c.description }}</div>
              </div>
              <span
                v-if="!c.active"
                class="tag border-ink/30 text-ink-3 shrink-0"
              >off</span>
              <button
                v-else-if="canEdit"
                class="btn-icon shrink-0"
                type="button"
                title="Retire category"
                aria-label="Retire category"
                @click="removeCategory(c)"
              >
                <Times />
              </button>
            </li>
          </ul>
        </div>

        <div v-if="canEdit" class="plate p-5 mt-4">
          <div class="eyebrow mb-3">Add category</div>
          <input v-model="catForm.name" class="field mb-2" placeholder="Name" />
          <input v-model="catForm.description" class="field mb-3" placeholder="Description" />
          <button class="btn w-full" @click="addCategory">Add</button>
        </div>
      </section>

      <!-- Items -->
      <section class="plate overflow-hidden rise rise-3 self-start">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left eyebrow border-b hairline">
              <th class="px-5 py-3 font-normal">Item</th>
              <th class="px-5 py-3 font-normal">Category</th>
              <th class="px-5 py-3 font-normal text-right">Price</th>
              <th class="px-5 py-3 font-normal text-center">State</th>
              <th v-if="canEdit" class="px-5 py-3 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in filtered"
              :key="item.id"
              class="border-b hairline last:border-0 hover:bg-paper-2/50"
            >
              <td class="px-5 py-3.5">
                <div class="font-medium">{{ item.name }}</div>
                <div class="text-[11px] text-ink-3 truncate max-w-[280px]">
                  {{ item.description }}
                </div>
              </td>
              <td class="px-5 py-3.5 text-ink-2">{{ item.menuCategory?.name }}</td>
              <td class="px-5 py-3.5 mono text-right">{{ money(item.price) }}</td>
              <td class="px-5 py-3.5 text-center">
                <button
                  class="tag"
                  :class="item.available ? 'border-sage/50 text-sage' : 'border-ink/30 text-ink-3'"
                  :disabled="!canEdit"
                  @click="toggleAvailable(item)"
                >
                  {{ item.available ? 'on menu' : 'hidden' }}
                </button>
              </td>
              <td v-if="canEdit" class="px-5 py-3.5 text-right whitespace-nowrap">
                <div class="inline-flex items-center gap-1">
                  <button
                    class="btn-icon"
                    type="button"
                    title="Edit item"
                    aria-label="Edit item"
                    @click="startEdit(item)"
                  >
                    <Pencil />
                  </button>
                  <button
                    class="btn-icon btn-icon-danger"
                    type="button"
                    title="Remove item"
                    aria-label="Remove item"
                    @click="removeItem(item)"
                  >
                    <Trash />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!loading && !filtered.length">
              <td :colspan="canEdit ? 5 : 4" class="px-5 py-12 text-center text-ink-3">
                No items match.
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>

    <!-- Edit / create sheet -->
    <div
      v-if="editing"
      class="fixed inset-0 z-40 grid place-items-center bg-ink/40 p-4"
      @click.self="editing = false"
    >
      <div class="plate w-full max-w-md p-6 rise">
        <div class="flex items-center justify-between">
          <div class="eyebrow">{{ itemForm.id ? 'Edit item' : 'New item' }}</div>
          <button class="btn btn-ghost btn-sm" @click="editing = false">Close</button>
        </div>
        <div class="dashed my-4"></div>
        <div class="space-y-3">
          <div>
            <label class="label">Name</label>
            <input v-model="itemForm.name" class="field" />
          </div>
          <div>
            <label class="label">Description</label>
            <input v-model="itemForm.description" class="field" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="label">Price (USD)</label>
              <input v-model="itemForm.price" class="field mono" type="number" step="0.01" />
            </div>
            <div>
              <label class="label">Category</label>
              <select v-model="itemForm.categoryId" class="field">
                <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>
          </div>
          <label class="flex items-center gap-2 text-sm">
            <input v-model="itemForm.available" type="checkbox" class="accent-ember" />
            Available on the menu
          </label>
        </div>
        <div class="flex gap-3 mt-6">
          <button class="btn-ember flex-1" @click="saveItem">
            {{ itemForm.id ? 'Save changes' : 'Add item' }}
          </button>
          <button class="btn" @click="editing = false">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>
