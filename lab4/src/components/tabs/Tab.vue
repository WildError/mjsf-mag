<script setup>
import { computed, inject, onBeforeUnmount, onMounted } from 'vue'
import { tabsKey } from './tabsKey'

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  panel: {
    type: Object,
    default: null,
  },
  panelProps: {
    type: Object,
    default: () => ({}),
  },
})

const context = inject(tabsKey, null)

if (!context) {
  throw new Error('Компонент Tab потрібно розміщувати всередині Tabs.')
}

const {
  activeSlug,
  idPrefix,
  registerTab,
  unregisterTab,
} = context

const isActive = computed(() => activeSlug.value === props.slug)

const registeredSlug = props.slug
let registered = false

onMounted(() => {
  registerTab({
    slug: registeredSlug,
    get title() {
      return props.title
    },
    get disabled() {
      return props.disabled
    },
  })
  registered = true
})

onBeforeUnmount(() => {
  if (registered) {
    unregisterTab(registeredSlug)
  }
})
</script>

<template>
  <section
    v-show="isActive"
    :id="`${idPrefix}-panel-${slug}`"
    class="tabs__panel"
    role="tabpanel"
    :aria-labelledby="`${idPrefix}-tab-${slug}`"
    tabindex="0"
  >
    <KeepAlive>
      <slot
        v-if="isActive && $slots.default"
        :is-active="isActive"
      />
      <component
        :is="panel"
        v-else-if="isActive && panel"
        v-bind="panelProps"
      />
    </KeepAlive>
  </section>
</template>

<style scoped lang="scss">
.tabs__panel {
  @apply min-w-0 px-4 py-4 text-ink;

  &:focus-visible {
    @apply outline-none ring-2 ring-inset ring-ink;
  }
}
</style>