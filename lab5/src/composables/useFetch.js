import { ref, toValue, watchEffect } from 'vue'

export function useFetch(url) {
  const data = ref(null)
  const error = ref(null)
  const isLoading = ref(false)
  const retryCount = ref(0)

  let activeController = null

  function abort() {
    activeController?.abort()
    activeController = null
    isLoading.value = false
  }

  function refetch() {
    retryCount.value++
  }

  watchEffect(async (onCleanup) => {
    const currentUrl = toValue(url)
    retryCount.value

    activeController?.abort()

    const controller = new AbortController()
    activeController = controller

    onCleanup(() => {
      controller.abort()

      if (activeController === controller) {
        activeController = null
        isLoading.value = false
      }
    })

    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(currentUrl, {
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()

      if (
        !controller.signal.aborted &&
        activeController === controller
      ) {
        data.value = result
      }
    } catch (cause) {
      if (
        !controller.signal.aborted &&
        activeController === controller
      ) {
        error.value = cause
      }
    } finally {
      if (activeController === controller) {
        isLoading.value = false
        activeController = null
      }
    }
  })

  return { data, error, isLoading, abort, refetch }
}