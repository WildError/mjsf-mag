<script setup>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  provide,
  readonly,
  ref,
  useId,
  watch,
} from 'vue'
import { tabsKey } from './tabsKey'

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  variant: {
    type: String,
    default: 'underline',
    validator: (value) => ['underline', 'pills', 'boxed'].includes(value),
  },
  title: {
    type: String,
    default: 'Компонент вкладок у Vue',
  },
})

const emit = defineEmits(['update:modelValue'])

const idPrefix = useId()
const tabs = ref([])
const buttons = new Map()

let mounted = false
let destroying = false

const activeSlug = computed(() => props.modelValue)

const availableTabs = computed(() =>
  tabs.value.filter((tab) => !tab.disabled),
)

const variantClasses = computed(() => ({
  'tabs--underline': props.variant === 'underline',
  'tabs--pills': props.variant === 'pills',
  'tabs--boxed': props.variant === 'boxed',
}))

function setActiveTab(slug) {
  const tab = tabs.value.find((item) => item.slug === slug)

  if (tab && !tab.disabled && slug !== activeSlug.value) {
    emit('update:modelValue', slug)
  }
}

function ensureActiveTab() {
  if (!mounted || destroying) return

  const activeExists = availableTabs.value.some(
    (tab) => tab.slug === activeSlug.value,
  )

  if (!activeExists) {
    const nextSlug = availableTabs.value[0]?.slug ?? ''

    if (nextSlug !== activeSlug.value) {
      emit('update:modelValue', nextSlug)
    }
  }
}

function registerTab(tab) {
  if (tabs.value.some((item) => item.slug === tab.slug)) {
    throw new Error(`Вкладка зі slug "${tab.slug}" вже існує.`)
  }

  tabs.value.push(tab)
}

function unregisterTab(slug) {
  tabs.value = tabs.value.filter((tab) => tab.slug !== slug)
}

function saveButton(slug, element) {
  if (element) {
    buttons.set(slug, element)
  } else {
    buttons.delete(slug)
  }
}

async function handleKeydown(event, slug) {
  const supportedKeys = ['ArrowLeft', 'ArrowRight', 'Home', 'End']

  if (!supportedKeys.includes(event.key)) return

  event.preventDefault()

  const available = availableTabs.value
  if (!available.length) return

  let index = available.findIndex((tab) => tab.slug === slug)

  switch (event.key) {
    case 'ArrowRight':
      index = (index + 1) % available.length
      break
    case 'ArrowLeft':
      index = (index - 1 + available.length) % available.length
      break
    case 'Home':
      index = 0
      break
    case 'End':
      index = available.length - 1
      break
  }

  const targetSlug = available[index].slug

  setActiveTab(targetSlug)
  await nextTick()
  buttons.get(targetSlug)?.focus()
}

provide(tabsKey, {
  activeSlug: readonly(activeSlug),
  idPrefix,
  setActiveTab,
  registerTab,
  unregisterTab,
})

watch(
  [
    activeSlug,
    () => availableTabs.value.map((tab) => tab.slug),
  ],
  ensureActiveTab,
  { flush: 'post' },
)

onMounted(() => {
  mounted = true
  ensureActiveTab()
})

onBeforeUnmount(() => {
  destroying = true
})
</script>

<template>
  <div class="tabs" :class="variantClasses">
    <h3 :id="`${idPrefix}-title`" class="tabs__title">
      {{ title }}
    </h3>

    <div
      role="tablist"
      :aria-labelledby="`${idPrefix}-title`"
      class="tabs__list"
    >
      <button
        v-for="tab in tabs"
        :id="`${idPrefix}-tab-${tab.slug}`"
        :key="tab.slug"
        :ref="(element) => saveButton(tab.slug, element)"
        type="button"
        role="tab"
        class="tabs__tab"
        :class="{
          'tabs__tab--active': activeSlug === tab.slug,
        }"
        :aria-selected="activeSlug === tab.slug"
        :aria-controls="`${idPrefix}-panel-${tab.slug}`"
        :tabindex="activeSlug === tab.slug && !tab.disabled ? 0 : -1"
        :disabled="tab.disabled"
        @click="setActiveTab(tab.slug)"
        @keydown="handleKeydown($event, tab.slug)"
      >
        <span class="tabs__label">{{ tab.title }}</span>
      </button>
    </div>

    <slot />
  </div>
</template>

<style scoped lang="scss">
.tabs {
  $self: &;

  @apply min-w-0 overflow-hidden rounded-xl border border-edge bg-paper;

  &__title {
    @apply border-b border-edge px-4 py-3 font-display text-base font-bold text-ink;
  }

  &__list {
    @apply flex flex-wrap gap-x-1 px-2;
  }

  &__tab {
    @apply flex min-h-11 max-w-full items-center px-4 py-2 text-sm font-semibold text-muted;
    @apply transition-colors;

    &:hover:not(:disabled) {
      @apply text-ink;
    }

    &:focus-visible {
      @apply outline-none ring-2 ring-inset ring-ink;
    }

    &:disabled {
      @apply cursor-not-allowed opacity-40;
    }
  }

  &__label {
    @apply break-words text-left;
    overflow-wrap: anywhere;
  }

  &--underline {
    #{$self}__list {
      @apply border-b-2 border-edge;
    }

    #{$self}__tab {
      @apply -mb-0.5 border-b-2 border-transparent;
    }

    #{$self}__tab--active {
      @apply border-accent text-ink;
    }
  }

  &--pills {
    #{$self}__list {
      @apply gap-2 border-b border-edge p-2;
    }

    #{$self}__tab {
      @apply rounded-full;
    }

    #{$self}__tab--active {
      @apply bg-accent text-ink;
    }
  }

  &--boxed {
    #{$self}__list {
      @apply gap-2 border-b border-edge bg-surface p-2;
    }

    #{$self}__tab {
      @apply rounded-lg border border-edge bg-paper;
    }

    #{$self}__tab--active {
      @apply border-accent bg-accent text-ink;
    }
  }
}
</style>