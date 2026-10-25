<script setup>
import { computed, ref, watch } from 'vue'

import ProductCatalog from './components/ProductCatalog.vue'
import ProductSearchForm from './components/ProductSearchForm.vue'
import CatalogLoadMore from './components/CatalogLoadMore.vue'

import { useFetch } from './composables/useFetch.js'
import { useDebouncedValue } from './composables/useDebouncedValue.js'
import {
  API_DELAY,
  PAGE_SIZE,
  createProductsUrl,
} from './api/products.js'

const query = ref('')
const skip = ref(0)
const products = ref([])
const total = ref(0)

const debouncedQuery = useDebouncedValue(query, 400)

const requestUrl = computed(() =>
  createProductsUrl(debouncedQuery.value, skip.value),
)

const {
  data,
  error,
  isLoading,
  abort,
  refetch: loadInitialProducts,
} = useFetch(requestUrl)

// Скасовуємо активний запит одразу при введенні.
watch(query, () => abort(), { flush: 'sync' })

// Новий пошук починається з порожнього списку.
watch(
  debouncedQuery,
  () => {
    skip.value = 0
    products.value = []
    total.value = 0

    // Повторюємо запит навіть якщо змінилися лише пробіли.
    loadInitialProducts()
  },
  { flush: 'sync' },
)

watch(data, (page) => {
  if (!page) return

  total.value = page.total

  if (page.skip === 0) {
    products.value = page.products
  } else {
    const knownIds = new Set(products.value.map((product) => product.id))

    const newProducts = page.products.filter((product) => {
      if (knownIds.has(product.id)) return false

      knownIds.add(product.id)
      return true
    })

    products.value = [...products.value, ...newProducts]
  }
})

const hasMore = computed(() => products.value.length < total.value)

const isDebouncing = computed(
  () => query.value !== debouncedQuery.value,
)

function loadMore() {
  if (
    !hasMore.value ||
    isLoading.value ||
    isDebouncing.value ||
    error.value
  ) {
    return
  }

  skip.value += PAGE_SIZE
}
</script>

<template>
  <main class="storefront">
    <header class="storefront__masthead">
      <a class="storefront__brand" href="#" aria-label="Forma, на початок">
        FORMA<span class="storefront__brand-mark">®</span>
      </a>
      <p class="storefront__edition">Лабораторна / 05</p>
      <p class="storefront__note">Каталог і composables</p>
    </header>

    <section class="storefront__hero">
      <div class="storefront__intro">
        <p class="storefront__eyebrow">Заготовка інтерфейсу</p>
        <h1 class="storefront__title">
          Речі з ясною
          <em class="storefront__title-accent">формою</em>
        </h1>
      </div>

<ProductSearchForm
  v-model="query"
  :is-loading="isLoading"
  :error="error"
  :loaded="products.length"
  :total="total"
  :api-delay="API_DELAY"
/>

    </section>

<section class="catalog" aria-labelledby="catalog-title">
  <div class="catalog__heading">
    <h2 id="catalog-title" class="catalog__title">Початкова добірка</h2>
    <span class="catalog__count">
      {{ products.length.toString().padStart(2, '0') }}
    </span>
  </div>

  <ProductCatalog
    :products="products"
    :is-loading="isLoading"
    :error="error"
    @retry="loadInitialProducts"
  />

<CatalogLoadMore
  v-if="products.length"
  :loaded="products.length"
  :total="total"
  :is-loading="isLoading"
  :error="error"
  :has-more="hasMore"
  @load-more="loadMore"
  @retry="loadInitialProducts"
/>


</section>
    <footer class="storefront__footer">
      <p>Студент: Коцур Валерій · F2.25-2-з</p>
      <p>Середовище: Windows · Node.js · Vue 3 · Vite · Notepad++</p>
    </footer>
  </main>
</template>