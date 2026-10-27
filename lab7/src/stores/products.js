import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth.js'
import { validProductId, validateDraft } from '../api/productDraft.js'
import { errorMessage } from '../api/http.js'

export const useProductsStore = defineStore('products', () => {
  const auth = useAuthStore()
  const confirmed = ref({})
  const savingId = ref(null)
  const error = ref('')
  const isSaving = computed(() => savingId.value !== null)
  let controller = null
  let operation = 0

  function cancelSave() {
    operation++
    controller?.abort()
    controller = null
    savingId.value = null
    error.value = ''
  }
  function reset() {
    cancelSave()
    confirmed.value = {}
  }
  watch(() => auth.sessionVersion, reset, { flush: 'sync' })

  function displayProduct(product) {
    return product ? { ...product, ...confirmed.value[product.id] } : null
  }

  async function save(id, draft) {
    if (isSaving.value || !auth.isAuthenticated) return null
    const checked = validateDraft({ ...draft })
    if (!validProductId(String(id)) || !checked.valid) {
      error.value = 'Перевірте поля форми.'
      return null
    }
    const current = ++operation
    const version = auth.sessionVersion
    const active = new AbortController()
    controller = active
    savingId.value = String(id)
    error.value = ''
    try {
      const response = await auth.request(`/auth/products/${id}`, {
        method: 'PATCH', body: checked.values, signal: active.signal,
      })
      if (active.signal.aborted || current !== operation ||
          version !== auth.sessionVersion || !auth.isAuthenticated) return null
      const result = validateDraft(response)
      if (!result.valid || Number(response.id) !== Number(id)) throw new Error('Invalid response')
      confirmed.value = { ...confirmed.value, [id]: result.values }
      return result.values
    } catch (cause) {
      if (!active.signal.aborted && current === operation && version === auth.sessionVersion)
        error.value = errorMessage(cause)
      return null
    } finally {
      if (current === operation) {
        savingId.value = null
        controller = null
      }
    }
  }
  return { confirmed, savingId, error, isSaving, displayProduct, save, reset, cancelSave }
})
