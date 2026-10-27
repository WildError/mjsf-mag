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

    abort()
    data.value = null
    error.value = null

    // Некоректний id дасть null замість URL.
    if (!currentUrl) return

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

    try {
      const response = await fetch(currentUrl, {
        signal: controller.signal,
      })

      if (!response.ok) {
        const requestError = new Error(`HTTP ${response.status}`)
        requestError.status = response.status
        throw requestError
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