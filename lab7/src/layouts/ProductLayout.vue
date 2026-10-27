<script setup>
import Breadcrumbs from '../components/Breadcrumbs.vue'
import { useBreadcrumbs } from '../composables/useBreadcrumbs.js'
import { useProductsStore } from '../stores/products.js'
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useFetch } from '../composables/useFetch.js'

const route = useRoute()

const productId = computed(() => route.params.id)

const isValidId = computed(() =>
  typeof productId.value === 'string' &&
  /^[1-9]\d*$/.test(productId.value),
)

const requestUrl = computed(() => {
  if (!isValidId.value) return null

  return `https://dummyjson.com/products/${productId.value}?delay=800`
})

const {
  data: rawProduct,
  error,
  isLoading,
  refetch,
 } = useFetch(requestUrl)
const productsStore = useProductsStore()
const product = computed(() => productsStore.displayProduct(rawProduct.value))

const isNotFound = computed(() =>
  !isValidId.value || error.value?.status === 404,
)

const priceFormatter = new Intl.NumberFormat('uk-UA', {
  style: 'currency',
  currency: 'USD',
})

const breadcrumbTitle = computed(() => {
  if (isNotFound.value) return 'Товар не знайдено'

  if (isLoading.value || error.value) {
    return `Товар №${productId.value}`
  }

  return product.value?.title || `Товар №${productId.value}`
})

const breadcrumbs = useBreadcrumbs(breadcrumbTitle)

</script>

<template>
  <section class="product-layout">
<Breadcrumbs :items="breadcrumbs" />
    <div v-if="isNotFound" class="product-layout__message">
      <h1>Товар не знайдено</h1>
      <p>Перевірте ідентифікатор товару в адресі.</p>
    </div>

    <div
      v-else-if="isLoading"
      class="product-layout__message"
      role="status"
    >
      Завантажуємо товар №{{ productId }}…
    </div>

    <div
      v-else-if="error"
      class="product-layout__message"
      role="alert"
    >
      <h1>Не вдалося завантажити товар</h1>
      <p>{{ error.message }}</p>

      <button
        type="button"
        class="product-layout__retry"
        @click="refetch"
      >
        Повторити запит
      </button>
    </div>

    <div v-else-if="product" class="product-layout__summary">
      <img
        class="product-layout__image"
        :src="product.thumbnail"
        :alt="product.title"
      />

      <div class="product-layout__info">
        <p class="product-layout__category">
          {{ product.category }}
        </p>

        <h1 class="product-layout__title">
          {{ product.title }}
        </h1>

        <p class="product-layout__price">
          {{ priceFormatter.format(product.price) }}
        </p>

        <p>Рейтинг: {{ product.rating }} / 5</p>

        <p>
          {{
            product.stock > 0
              ? `У наявності: ${product.stock}`
              : 'Немає в наявності'
          }}
        </p>
      </div>
    </div>
<div v-if="product && !isLoading && !error && isValidId">
  <nav class="product-layout__nav" aria-label="Розділи товару">
    <RouterLink
      :to="{
        name: 'product-overview',
        params: { id: productId },
        query: route.query,
      }"
      class="product-layout__link"
    >
      Огляд
    </RouterLink>

    <RouterLink
      :to="{
        name: 'product-reviews',
        params: { id: productId },
        query: route.query,
      }"
      class="product-layout__link"
    >
      Відгуки
    </RouterLink>
  </nav>

  <RouterView v-slot="{ Component }">
    <component
      :is="Component"
      :product="product"
    />
  </RouterView>
</div>
  </section>
</template>

<style scoped>
.product-layout {
  min-width: 0;
  padding: 24px 0;
  overflow-wrap: anywhere;
}

.product-layout__message {
  padding: 24px 0;
  line-height: 1.6;
}

.product-layout__summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 32px;
  align-items: center;
}

.product-layout__image {
  display: block;
  width: 100%;
  max-height: 420px;
  object-fit: contain;
}

.product-layout__info {
  min-width: 0;
}

.product-layout__category {
  margin: 0 0 12px;
}

.product-layout__title {
  margin: 0 0 20px;
  font-size: clamp(28px, 4vw, 48px);
}

.product-layout__price {
  margin: 0 0 20px;
  font-size: 28px;
  font-weight: 700;
}

.product-layout__retry {
  min-height: 44px;
  padding: 10px 20px;
  cursor: pointer;
}

.product-layout__retry:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 4px;
}

@media (max-width: 640px) {
  .product-layout__summary {
    grid-template-columns: minmax(0, 1fr);
    gap: 20px;
  }
}

.product-layout__nav {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 24px;
  margin-top: 32px;
  border-bottom: 1px solid #dce0e5;
}

.product-layout__link {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 8px 0;
  color: inherit;
  text-decoration: none;
}

.product-layout__link.router-link-exact-active {
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 6px;
}

.product-layout__link:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 4px;
}
</style>