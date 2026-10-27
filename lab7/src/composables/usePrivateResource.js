import { ref, toValue, watch } from 'vue'
import { useAuthStore } from '../stores/auth.js'

export function usePrivateResource(source) {
  const auth = useAuthStore()
  const data = ref(null)
  const error = ref(null)
  const isLoading = ref(false)
  const revision = ref(0)
  function refetch() { revision.value++ }

  watch(
    [() => toValue(source), () => auth.isAuthenticated, () => auth.sessionVersion, revision],
    async ([path, allowed], previous, onCleanup) => {
      data.value = null
      error.value = null
      isLoading.value = false
      if (!path || !allowed) return
      const controller = new AbortController()
      onCleanup(() => controller.abort())
      isLoading.value = true
      try {
        const result = await auth.request(path, { signal: controller.signal })
        if (!controller.signal.aborted) data.value = result
      } catch (cause) {
        if (!controller.signal.aborted && auth.isAuthenticated) error.value = cause
      } finally {
        if (!controller.signal.aborted) isLoading.value = false
      }
    },
    { immediate: true, flush: 'sync' },
  )
  return { data, error, isLoading, refetch }
}
