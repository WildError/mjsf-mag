<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, required: true },
  initialFocus: { default: null },
  fallbackFocus: { default: null },
})

const emit = defineEmits(['update:modelValue'])
const panel = ref(null)

let opener = null
let background = null
let previousInert = false
let previousOverflow = ''
let backgroundLocked = false
let openingId = 0

function close() {
  emit('update:modelValue', false)
}

function isAvailable(element) {
  return (
    element instanceof HTMLElement &&
    element.isConnected &&
    !element.matches(':disabled') &&
    !element.closest('[inert]') &&
    element.getClientRects().length > 0 &&
    getComputedStyle(element).visibility !== 'hidden'
  )
}

function focusInside() {
  if (!props.modelValue || !panel.value) return

  const target = props.initialFocus

  if (isAvailable(target) && panel.value.contains(target)) {
    target.focus({ preventScroll: true })
  } else {
    panel.value.focus({ preventScroll: true })
  }
}

function lockBackground() {
  if (backgroundLocked) return

  background = document.getElementById('app')
  previousInert = background?.inert ?? false
  previousOverflow = document.body.style.overflow

  if (background) background.inert = true
  document.body.style.overflow = 'hidden'
  backgroundLocked = true
}

function restoreBackground() {
  if (!backgroundLocked) return

  if (background) background.inert = previousInert
  document.body.style.overflow = previousOverflow
  backgroundLocked = false

  const target = isAvailable(opener) ? opener : props.fallbackFocus

  if (isAvailable(target)) {
    target.focus({ preventScroll: true })
  }

  opener = null
  background = null
}

function afterLeave() {
  // Не розблоковуємо фон, якщо вікно вже відкрили повторно.
  if (!props.modelValue) restoreBackground()
}

function handleKeydown(event) {
  if (event.key === 'Escape') {
    event.preventDefault()
    event.stopPropagation()
    close()
    return
  }

  if (event.key !== 'Tab' || !panel.value) return

  const elements = Array.from(
    panel.value.querySelectorAll(
      'a[href], button, input, select, textarea, [tabindex], [contenteditable="true"]',
    ),
  ).filter((element) => isAvailable(element) && element.tabIndex >= 0)

  if (elements.length === 0) {
    event.preventDefault()
    panel.value.focus()
    return
  }

  const first = elements[0]
  const last = elements[elements.length - 1]
  const current = document.activeElement
  const outsideList = !elements.includes(current)

  if (event.shiftKey && (current === first || outsideList)) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && (current === last || outsideList)) {
    event.preventDefault()
    first.focus()
  }
}

watch(
  () => props.modelValue,
  async (isOpen) => {
    const currentOpening = ++openingId
    if (!isOpen) return

    if (!backgroundLocked) {
      opener = document.activeElement
    }

    await nextTick()

    if (!props.modelValue || currentOpening !== openingId) return

    focusInside()
    lockBackground()
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  openingId++
  restoreBackground()
})
</script>

<template>
@after-enter="focusInside"
@after-leave="afterLeave"
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-500 motion-reduce:transition-none"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-500 motion-reduce:transition-none"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 box-border flex items-center justify-center bg-black/50 p-4"
        @click.self="close"
      >
        <section
		ref="panel"
tabindex="-1"
@keydown="handleKeydown"
          role="dialog"
          aria-modal="true"
          aria-labelledby="material-dialog-title"
          class="box-border flex w-full max-w-screen-sm max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-xl bg-white text-slate-900 shadow-xl"
        >
          <header class="flex shrink-0 items-start justify-between gap-4 p-4">
            <h2
              id="material-dialog-title"
              class="m-0 min-w-0 break-words text-xl font-bold"
            >
              {{ title }}
            </h2>

            <button
              type="button"
              aria-label="Закрити вікно"
              class="min-h-11 min-w-11 shrink-0 cursor-pointer rounded-lg border-0 bg-slate-100 text-xl text-slate-900 hover:bg-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
              @click="close"
            >
              ×
            </button>
          </header>

          <div class="min-h-0 overflow-y-auto break-words p-4">
            <slot />
          </div>

          <footer
            class="flex shrink-0 flex-col gap-3 p-4 sm:flex-row sm:justify-end"
          >
            <slot name="footer">
              <button
                type="button"
                class="min-h-11 min-w-11 cursor-pointer rounded-lg border-0 bg-slate-200 px-4 py-2 text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
                @click="close"
              >
                Закрити
              </button>
            </slot>
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>