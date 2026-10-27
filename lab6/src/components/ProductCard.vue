<script setup>
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()
defineProps({
  product: {
    type: Object,
    required: true,
  },
})

const priceFormatter = new Intl.NumberFormat('uk-UA', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})
</script>

<template>
  <article class="product-card">
    <div class="product-card__visual">
      <span
        v-if="product.discountPercentage >= 10"
        class="product-card__discount"
      >
        −{{ Math.round(product.discountPercentage) }}%
      </span>

      <img
        class="product-card__image"
        :src="product.thumbnail"
        :alt="product.title"
        loading="lazy"
        width="420"
        height="320"
      />
    </div>

    <div class="product-card__body">
      <div class="product-card__meta">
        <span class="product-card__category">{{ product.category }}</span>
        <span class="product-card__rating">
          {{ product.rating.toFixed(1) }} / 5
        </span>
      </div>

<h2 class="product-card__title">
  <RouterLink
    :to="{
      name: 'product-overview',
      params: { id: product.id },
      query: route.query,
    }"
    class="product-card__link"
  >
    {{ product.title }}
  </RouterLink>
</h2>
      <p class="product-card__description">{{ product.description }}</p>

      <div class="product-card__footer">
        <strong class="product-card__price">
          {{ priceFormatter.format(product.price) }}
        </strong>
        <span class="product-card__stock">
          {{ product.stock > 0 ? `У наявності · ${product.stock}` : 'Немає в наявності' }}
        </span>
      </div>
    </div>
  </article>
</template>
<style scoped>
.product-card__link {
  color: inherit;
  text-decoration: none;
}

.product-card__link:hover {
  text-decoration: underline;
}

.product-card__link:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 4px;
}
</style>