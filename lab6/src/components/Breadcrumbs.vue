<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  items: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <nav
    v-if="items.length"
    class="breadcrumbs"
    aria-label="Хлібні крихти"
  >
    <ol class="breadcrumbs__list">
      <li
        v-for="(item, index) in items"
        :key="index"
        class="breadcrumbs__item"
      >
        <span
          v-if="index > 0"
          class="breadcrumbs__separator"
          aria-hidden="true"
        >
          /
        </span>

        <RouterLink
          v-if="index < items.length - 1"
          :to="item.to"
          class="breadcrumbs__link"
        >
          {{ item.label }}
        </RouterLink>

        <span
          v-else
          class="breadcrumbs__current"
          aria-current="page"
        >
          {{ item.label }}
        </span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.breadcrumbs {
  min-width: 0;
  padding: 16px 0;
}

.breadcrumbs__list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.breadcrumbs__item {
  display: flex;
  align-items: baseline;
  gap: 12px;
  min-width: 0;
  max-width: 100%;
}

.breadcrumbs__separator {
  flex-shrink: 0;
}

.breadcrumbs__link,
.breadcrumbs__current {
  min-width: 0;
  overflow-wrap: anywhere;
  line-height: 1.5;
}

.breadcrumbs__link {
  color: inherit;
  text-underline-offset: 4px;
}

.breadcrumbs__link:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 4px;
}

.breadcrumbs__current {
  font-weight: 700;
}
</style>