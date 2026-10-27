import { onBeforeUnmount, onMounted, toValue, watch } from 'vue'

export function useIntersectionObserver(target, callback, options = {}) {
  let observer = null
  let stopWatching = null

  onMounted(() => {
    if (
      typeof window === 'undefined' ||
      !('IntersectionObserver' in window)
    ) {
      return
    }

    observer = new window.IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          callback(entry)
        }
      }
    }, options)

    stopWatching = watch(
      () => toValue(target),
      (element, previousElement) => {
        if (previousElement) {
          observer.unobserve(previousElement)
        }

        if (element) {
          observer.observe(element)
        }
      },
      {
        immediate: true,
        flush: 'post',
      },
    )
  })

  onBeforeUnmount(() => {
    stopWatching?.()
    observer?.disconnect()
    observer = null
  })
}