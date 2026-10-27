<script setup>
import Breadcrumbs from '../components/Breadcrumbs.vue'
import { useBreadcrumbs } from '../composables/useBreadcrumbs.js'

const breadcrumbs = useBreadcrumbs()
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="not-found">
<Breadcrumbs :items="breadcrumbs" />
    <p class="not-found__code">404</p>

    <h1 class="not-found__title">Сторінку не знайдено</h1>

    <p class="not-found__text">
      Перевірте адресу або поверніться до каталогу товарів.
    </p>

    <RouterLink
      :to="{ name: 'products' }"
      class="not-found__link"
    >
      До каталогу
    </RouterLink>
  </section>
</template>

<style scoped>
.not-found {
  min-width: 0;
  padding: 48px 0;
}

.not-found__code {
  margin: 0 0 12px;
  font-size: 64px;
  font-weight: 700;
}

.not-found__title {
  margin: 0 0 16px;
  font-size: clamp(28px, 5vw, 48px);
  overflow-wrap: anywhere;
}

.not-found__text {
  margin: 0 0 24px;
  line-height: 1.6;
}

.not-found__link {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  color: inherit;
  font-weight: 700;
  text-underline-offset: 4px;
}

.not-found__link:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 4px;
}
</style>