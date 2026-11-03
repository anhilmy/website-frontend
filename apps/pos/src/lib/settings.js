import { reactive } from 'vue'
import { settings as api } from './resources'
import { syncBrandingFromSettings } from './branding'
import { DEFAULT_SETTINGS } from './settings-defaults'

export const settings = reactive({
  data: { ...DEFAULT_SETTINGS },
  loaded: false,
  loading: null,
})

export async function ensureSettings(force = false) {
  if (settings.loaded && !force) return settings.data
  if (settings.loading) return settings.loading
  settings.loading = api
    .get()
    .then((data) => {
      applySettings(data)
      return settings.data
    })
    .catch(() => settings.data)
    .finally(() => {
      settings.loading = null
    })
  return settings.loading
}

export function applySettings(data) {
  if (!data) return
  Object.assign(settings.data, data)
  settings.loaded = true
}

export async function saveSettings(payload) {
  const data = await api.update(payload)
  applySettings(data)
  syncBrandingFromSettings(data)
  return settings.data
}
