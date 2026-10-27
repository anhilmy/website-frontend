<script setup>
import { onMounted, reactive, ref } from 'vue'
import Plus from '@primevue/icons/plus'
import Pencil from '@primevue/icons/pencil'
import Trash from '@primevue/icons/trash'
import Check from '@primevue/icons/check'
import { modifiers as modifierApi } from '../lib/resources'
import { money } from '../lib/format'

const props = defineProps({
  item: { type: Object, required: true },
})

const emit = defineEmits(['close'])

const groups = ref([])
const loading = ref(true)
const error = ref('')
const busy = ref(false)

const showGroupForm = ref(false)
const groupForm = reactive({
  id: null,
  name: '',
  selectionType: 'SINGLE',
  required: false,
  minSelect: 0,
  maxSelect: 1,
  sortOrder: 0,
  active: true,
})

const showOptionForm = ref(false)
const optionForm = reactive({
  id: null,
  groupId: null,
  name: '',
  priceDelta: '',
  isDefault: false,
  available: true,
  sortOrder: 0,
})

async function load() {
  loading.value = true
  error.value = ''
  try {
    groups.value = await modifierApi.list(props.item.id)
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function resetGroupForm() {
  Object.assign(groupForm, {
    id: null,
    name: '',
    selectionType: 'SINGLE',
    required: false,
    minSelect: 0,
    maxSelect: 1,
    sortOrder: 0,
    active: true,
  })
}

function startGroupCreate() {
  resetGroupForm()
  showOptionForm.value = false
  showGroupForm.value = true
}

function startGroupEdit(group) {
  Object.assign(groupForm, {
    id: group.id,
    name: group.name,
    selectionType: group.selectionType,
    required: !!group.required,
    minSelect: Number(group.minSelect ?? 0),
    maxSelect: Number(group.maxSelect ?? 1),
    sortOrder: Number(group.sortOrder ?? 0),
    active: !!group.active,
  })
  showOptionForm.value = false
  showGroupForm.value = true
}

async function saveGroup() {
  if (busy.value || !groupForm.name.trim()) return
  busy.value = true
  error.value = ''
  try {
    const payload = {
      menuItemId: props.item.id,
      name: groupForm.name.trim(),
      selectionType: groupForm.selectionType,
      required: groupForm.required,
      minSelect: Number(groupForm.minSelect || 0),
      maxSelect: Number(groupForm.maxSelect || 1),
      sortOrder: Number(groupForm.sortOrder || 0),
      active: groupForm.active,
    }
    if (groupForm.id) await modifierApi.updateGroup(groupForm.id, payload)
    else await modifierApi.createGroup(payload)
    showGroupForm.value = false
    resetGroupForm()
    await load()
  } catch (e) {
    error.value = e.message
  } finally {
    busy.value = false
  }
}

async function deactivateGroup(group) {
  if (
    !window.confirm(
      `Deactivate “${group.name}”? It will disappear from the till for new orders.`,
    )
  ) {
    return
  }
  busy.value = true
  error.value = ''
  try {
    await modifierApi.deactivateGroup(group.id)
    await load()
  } catch (e) {
    error.value = e.message
  } finally {
    busy.value = false
  }
}

async function reactivateGroup(group) {
  busy.value = true
  error.value = ''
  try {
    await modifierApi.updateGroup(group.id, { active: true })
    await load()
  } catch (e) {
    error.value = e.message
  } finally {
    busy.value = false
  }
}

function resetOptionForm(groupId) {
  Object.assign(optionForm, {
    id: null,
    groupId,
    name: '',
    priceDelta: '',
    isDefault: false,
    available: true,
    sortOrder: 0,
  })
}

function startOptionCreate(group) {
  resetOptionForm(group.id)
  showGroupForm.value = false
  showOptionForm.value = true
}

function startOptionEdit(group, option) {
  Object.assign(optionForm, {
    id: option.id,
    groupId: group.id,
    name: option.name,
    priceDelta: String(option.priceDelta ?? ''),
    isDefault: !!option.isDefault,
    available: !!option.available,
    sortOrder: Number(option.sortOrder ?? 0),
  })
  showGroupForm.value = false
  showOptionForm.value = true
}

async function saveOption() {
  if (busy.value || !optionForm.name.trim() || !optionForm.groupId) return
  busy.value = true
  error.value = ''
  try {
    const payload = {
      name: optionForm.name.trim(),
      priceDelta: Number(optionForm.priceDelta || 0),
      isDefault: optionForm.isDefault,
      available: optionForm.available,
      sortOrder: Number(optionForm.sortOrder || 0),
    }
    if (optionForm.id) await modifierApi.updateOption(optionForm.id, payload)
    else await modifierApi.createOption(optionForm.groupId, payload)
    showOptionForm.value = false
    await load()
  } catch (e) {
    error.value = e.message
  } finally {
    busy.value = false
  }
}

async function toggleOption(option) {
  if (
    option.available &&
    !window.confirm(`Mark “${option.name}” unavailable for new orders?`)
  ) {
    return
  }
  busy.value = true
  error.value = ''
  try {
    await modifierApi.updateOption(option.id, { available: !option.available })
    await load()
  } catch (e) {
    error.value = e.message
  } finally {
    busy.value = false
  }
}

onMounted(load)
</script>

<template>
  <div
    class="fixed inset-0 z-40 grid place-items-center bg-ink/40 p-4"
    @click.self="emit('close')"
  >
    <div class="plate w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 rise">
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="eyebrow">Modifiers</div>
          <h3 class="display text-2xl mt-1">{{ item.name }}</h3>
          <p class="mono text-[11px] text-ink-3 mt-1">
            BASE {{ money(item.price) }}
          </p>
        </div>
        <div class="flex items-center gap-1">
          <button class="btn btn-sm" type="button" @click="startGroupCreate">
            New group
          </button>
          <button class="btn btn-ghost btn-sm" type="button" @click="emit('close')">
            Close
          </button>
        </div>
      </div>

      <div class="dashed my-4"></div>

      <p v-if="error" class="mb-3 text-xs text-ember">{{ error }}</p>

      <!-- Group form -->
      <div v-if="showGroupForm" class="plate-2 p-4 mb-4">
        <div class="eyebrow mb-3">{{ groupForm.id ? 'Edit group' : 'New group' }}</div>
        <div class="grid sm:grid-cols-2 gap-3">
          <div class="sm:col-span-2">
            <label class="label">Name</label>
            <input v-model="groupForm.name" class="field" placeholder="Temperature" />
          </div>
          <div>
            <label class="label">Selection</label>
            <select v-model="groupForm.selectionType" class="field">
              <option value="SINGLE">Single choice</option>
              <option value="MULTI">Multiple choices</option>
            </select>
          </div>
          <div>
            <label class="label">Sort order</label>
            <input v-model.number="groupForm.sortOrder" class="field mono" type="number" step="1" />
          </div>
          <div>
            <label class="label">Min select</label>
            <input
              v-model.number="groupForm.minSelect"
              class="field mono"
              type="number"
              min="0"
              step="1"
            />
          </div>
          <div>
            <label class="label">Max select</label>
            <input
              v-model.number="groupForm.maxSelect"
              class="field mono"
              type="number"
              min="1"
              step="1"
            />
          </div>
          <label class="flex items-center gap-2 text-sm">
            <input v-model="groupForm.required" type="checkbox" class="accent-ember" />
            Required
          </label>
          <label class="flex items-center gap-2 text-sm">
            <input v-model="groupForm.active" type="checkbox" class="accent-ember" />
            Active
          </label>
        </div>
        <div class="flex gap-2 mt-4">
          <button class="btn-ember btn-sm" :disabled="busy" @click="saveGroup">
            {{ groupForm.id ? 'Save group' : 'Create group' }}
          </button>
          <button class="btn btn-sm" @click="showGroupForm = false">Cancel</button>
        </div>
      </div>

      <!-- Option form -->
      <div v-if="showOptionForm" class="plate-2 p-4 mb-4">
        <div class="eyebrow mb-3">{{ optionForm.id ? 'Edit option' : 'New option' }}</div>
        <div class="grid sm:grid-cols-2 gap-3">
          <div>
            <label class="label">Name</label>
            <input v-model="optionForm.name" class="field" placeholder="Iced" />
          </div>
          <div>
            <label class="label">Price delta (IDR)</label>
            <input v-model="optionForm.priceDelta" class="field mono" type="number" step="1" />
          </div>
          <div>
            <label class="label">Sort order</label>
            <input
              v-model.number="optionForm.sortOrder"
              class="field mono"
              type="number"
              step="1"
            />
          </div>
          <div class="flex items-end gap-4 pb-2">
            <label class="flex items-center gap-2 text-sm">
              <input v-model="optionForm.isDefault" type="checkbox" class="accent-ember" />
              Default
            </label>
            <label class="flex items-center gap-2 text-sm">
              <input v-model="optionForm.available" type="checkbox" class="accent-ember" />
              Available
            </label>
          </div>
        </div>
        <div class="flex gap-2 mt-4">
          <button class="btn-ember btn-sm" :disabled="busy" @click="saveOption">
            {{ optionForm.id ? 'Save option' : 'Create option' }}
          </button>
          <button class="btn btn-sm" @click="showOptionForm = false">Cancel</button>
        </div>
      </div>

      <p v-if="loading" class="text-sm text-ink-3 py-6 text-center">Loading groups…</p>
      <p v-else-if="!groups.length" class="text-sm text-ink-3 py-6 text-center">
        No modifier groups yet. Add one to let the till customize this item.
      </p>

      <div v-else class="space-y-3">
        <section
          v-for="group in groups"
          :key="group.id"
          class="plate-2 p-4"
          :class="{ 'opacity-60': !group.active }"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="display text-lg">{{ group.name }}</span>
                <span class="tag">
                  {{ group.selectionType === 'SINGLE' ? 'single' : 'multi' }}
                </span>
                <span v-if="group.required" class="tag border-ember/50 text-ember">
                  required
                </span>
                <span v-if="!group.active" class="tag border-ink/30 text-ink-3">off</span>
              </div>
              <div class="mono text-[10px] text-ink-3 mt-1">
                MIN {{ group.minSelect }} · MAX {{ group.maxSelect }} · SORT {{ group.sortOrder }}
              </div>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              <button
                v-if="group.active"
                class="btn-icon"
                type="button"
                title="Add option"
                aria-label="Add option"
                @click="startOptionCreate(group)"
              >
                <Plus />
              </button>
              <button
                class="btn-icon"
                type="button"
                title="Edit group"
                aria-label="Edit group"
                @click="startGroupEdit(group)"
              >
                <Pencil />
              </button>
              <button
                v-if="group.active"
                class="btn-icon btn-icon-danger"
                type="button"
                title="Deactivate group"
                aria-label="Deactivate group"
                :disabled="busy"
                @click="deactivateGroup(group)"
              >
                <Trash />
              </button>
              <button
                v-else
                class="btn-icon"
                type="button"
                title="Reactivate group"
                aria-label="Reactivate group"
                :disabled="busy"
                @click="reactivateGroup(group)"
              >
                <Check />
              </button>
            </div>
          </div>

          <div class="mt-3 space-y-1.5">
            <div
              v-for="option in group.options"
              :key="option.id"
              class="flex items-center gap-3 rounded-card border hairline px-3 py-2"
              :class="{ 'opacity-50': !option.available }"
            >
              <span class="flex-1 text-sm min-w-0 truncate">
                {{ option.name }}
                <span v-if="option.isDefault" class="tag ml-2">default</span>
                <span v-if="!option.available" class="tag border-ink/30 text-ink-3 ml-2">
                  unavailable
                </span>
              </span>
              <span v-if="Number(option.priceDelta)" class="mono text-xs text-ink-3">
                {{ Number(option.priceDelta) > 0 ? '+' : '' }}{{ money(option.priceDelta) }}
              </span>
              <button
                class="btn-icon"
                type="button"
                title="Edit option"
                aria-label="Edit option"
                @click="startOptionEdit(group, option)"
              >
                <Pencil />
              </button>
              <button
                class="btn-icon"
                :class="{ 'btn-icon-danger': option.available }"
                type="button"
                :title="option.available ? 'Mark unavailable' : 'Mark available'"
                :aria-label="option.available ? 'Mark unavailable' : 'Mark available'"
                :disabled="busy"
                @click="toggleOption(option)"
              >
                <Trash v-if="option.available" />
                <Check v-else />
              </button>
            </div>
            <p v-if="!group.options?.length" class="text-xs text-ink-3">
              No options yet.
            </p>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
