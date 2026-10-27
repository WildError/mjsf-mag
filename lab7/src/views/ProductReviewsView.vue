<script setup>
import { computed } from 'vue'

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
})

const reviews = computed(() => props.product.reviews ?? [])

function formatDate(value) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return ''

  return date.toLocaleDateString('uk-UA')
}
</script>

<template>
  <section class="product-reviews">
    <h2 class="product-reviews__title">Відгуки покупців</h2>

    <ul v-if="reviews.length" class="product-reviews__list">
      <li
        v-for="(review, index) in reviews"
        :key="index"
        class="product-reviews__item"
      >
        <div class="product-reviews__header">
          <strong>{{ review.reviewerName }}</strong>
          <span>Оцінка: {{ review.rating }} / 5</span>
        </div>

        <p class="product-reviews__comment">
          {{ review.comment }}
        </p>

        <span class="product-reviews__date">
          {{ formatDate(review.date) }}
        </span>
      </li>
    </ul>

    <p v-else class="product-reviews__empty">
      Для цього товару ще немає відгуків.
    </p>
  </section>
</template>

<style scoped>
.product-reviews {
  min-width: 0;
  padding: 24px 0;
  overflow-wrap: anywhere;
}

.product-reviews__title {
  margin: 0 0 24px;
  font-size: 24px;
}

.product-reviews__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.product-reviews__item {
  padding: 20px 0;
  border-bottom: 1px solid #dce0e5;
}

.product-reviews__header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px 16px;
}

.product-reviews__comment {
  margin: 12px 0;
  line-height: 1.6;
}

.product-reviews__date {
  font-size: 14px;
}

.product-reviews__empty {
  margin: 0;
  line-height: 1.6;
}
</style>