<script setup>
import Breadcrumbs from '../components/Breadcrumbs.vue'
import { useBreadcrumbs } from '../composables/useBreadcrumbs.js'

const breadcrumbs = useBreadcrumbs()
</script>
<template>
  <section class="about">
<Breadcrumbs :items="breadcrumbs" />
    <h1 class="about__title">Про застосунок</h1>

    <p class="about__text">
      Навчальний каталог товарів із пошуком та автоматичним
      дозавантаженням даних із DummyJSON.
    </p>

    <p class="about__text">
      У лабораторній роботі №7 додано Pinia, вхід користувача та приватний
      редактор товарів. Каталог, огляд і відгуки з попередньої роботи збережено.
    </p>

    <p class="about__text">
      Виконав: Коцур Валерій, група F2.25-2-з.
    </p>
  </section>
</template>

<style scoped>
.about {
  padding: 32px 0;
  min-width: 0;
}

.about__title {
  margin: 0 0 24px;
  font-size: clamp(28px, 5vw, 48px);
  overflow-wrap: anywhere;
}

.about__text {
  max-width: 760px;
  margin: 0 0 16px;
  line-height: 1.6;
}
</style>