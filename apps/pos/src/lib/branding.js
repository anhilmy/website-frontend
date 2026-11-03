import { reactive } from 'vue'
import { branding as api } from './resources'
import { DEFAULT_BRANDING } from './settings-defaults'

export const branding = reactive({
  data: { ...DEFAULT_BRANDING },
  loaded: false,
  loading: null,
})

export async function ensureBranding(force = false) {
  if (branding.loaded && !force) return branding.data
  if (branding.loading) return branding.loading
  branding.loading = api
    .get()
    .then((data) => {
      applyBranding(data)
      return branding.data
    })
    .catch(() => branding.data)
    .finally(() => {
      branding.loading = null
    })
  return branding.loading
}

export function applyBranding(data) {
  if (!data) return
  Object.assign(branding.data, data)
  branding.loaded = true
}

export function syncBrandingFromSettings(data) {
  if (!data) return
  branding.data.systemName = data.systemName
  branding.data.companyName = data.companyName
  branding.data.location = data.location
  branding.loaded = true
}
