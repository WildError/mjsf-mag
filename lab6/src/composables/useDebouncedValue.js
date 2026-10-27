import { readonly, ref, toValue, watch } from 'vue'

export function useDebouncedValue(source, delay = 400) {
  const debouncedValue = ref(toValue(source))

  watch(
    () => toValue(source),
    (value, previousValue, onCleanup) => {
      const timer = setTimeout(() => {
        debouncedValue.value = value
      }, delay)

      onCleanup(() => {
        clearTimeout(timer)
      })
    },
    { flush: 'sync' },
  )

  return readonly(debouncedValue)
}