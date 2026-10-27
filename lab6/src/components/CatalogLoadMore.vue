<script setup>
import { ref } from 'vue'
import { useIntersectionObserver } from '../composables/useIntersectionObserver.js'

defineProps({
  loaded: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: Object,
    default: null,
  },
  hasMore: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['load-more', 'retry'])
const marker = ref(null)

useIntersectionObserver(
  marker,
  () => emit('load-more'),
  {
    rootMargin: '280px 0px',
    threshold: 0.01,
  },
)
</script>

<template>
<div ref="marker" class="catalog__load-more" aria-live="polite">
    <span class="catalog__load-progress">
      {{ loaded }} / {{ total }}
    </span>

    <div class="catalog__load-copy">
      <template v-if="isLoading">
        <strong class="catalog__load-title">
          Завантажуємо товари…
        </strong>
        <span class="catalog__load-text">
          Зачекайте на відповідь сервера
        </span>
      </template>

      <template v-else-if="error">
        <strong class="catalog__load-title">
          Не вдалося завантажити наступну сторінку
        </strong>
        <span class="catalog__load-text">{{ error.message }}</span>
        <button
          class="catalog__retry"
          type="button"
          @click="$emit('retry')"
        >
          Повторити запит
        </button>
      </template>

      <template v-else-if="hasMore">
        <strong class="catalog__load-title">
         Прокрутіть, щоб побачити більше
        </strong>
        <span class="catalog__load-text">
          Наступні товари завантажаться автоматично
        </span>
        <button
          class="catalog__retry"
          type="button"
          @click="$emit('load-more')"
        >
          Завантажити ще
        </button>
      </template>

      <template v-else>
        <strong class="catalog__load-title">
          Усі товари завантажено
        </strong>
        <span class="catalog__load-text">
          Показано всі доступні результати
        </span>
      </template>
    </div>
  </div>
</template>