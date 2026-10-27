<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import Breadcrumbs from '../components/Breadcrumbs.vue'
import ProductCatalog from '../components/ProductCatalog.vue'
import ProductSearchForm from '../components/ProductSearchForm.vue'
import CatalogLoadMore from '../components/CatalogLoadMore.vue'

import { useBreadcrumbs } from '../composables/useBreadcrumbs.js'
import { useFetch } from '../composables/useFetch.js'
import { useDebouncedValue } from '../composables/useDebouncedValue.js'

import {
  API_DELAY,
  PAGE_SIZE,
  createProductsUrl,
} from '../api/products.js'

const route = useRoute()
const router = useRouter()
const breadcrumbs = useBreadcrumbs()

function readSearch() {
  return typeof route.query.q === 'string' ? route.query.q : ''
}

// Підтверджений пошук з адреси та чернетка поля.
const confirmedQuery = ref(readSearch())
const query = ref(confirmedQuery.value)

const skip = ref(0)
const products = ref([])
const total = ref(0)
const isDebouncing = ref(false)

let restoring = false
let revision = 0

// Новий об’єкт позначає кожне редагування,
// навіть якщо користувач повернув попередній текст.
const edit = ref({
  text: query.value,
  revision,
})

const debouncedEdit = useDebouncedValue(edit, 400)

const requestUrl = computed(() =>
  createProductsUrl(confirmedQuery.value, skip.value),
)

const {
  data,
  error,
  isLoading,
  abort,
  refetch,
} = useFetch(requestUrl)

function restoreInput(value) {
  restoring = true
  query.value = value
  restoring = false
}

// Реагуємо лише на введення користувача.
watch(
  query,
  (value) => {
    if (restoring) return

    abort()
    isDebouncing.value = true

    edit.value = {
      text: value,
      revision: ++revision,
    }
  },
  { flush: 'sync' },
)

// Після паузи записуємо пошук у поточну адресу.
watch(debouncedEdit, (value) => {
  if (value.revision !== revision || !isDebouncing.value) return

  const search = value.text.trim()

  if (search !== confirmedQuery.value) {
    const nextQuery = { ...route.query }

    if (search) {
      nextQuery.q = search
    } else {
      delete nextQuery.q
    }

    router.replace({
      name: 'products',
      query: nextQuery,
    })
  } else {
    restoreInput(search)
    isDebouncing.value = false

    // URL не змінився, але попередній запит уже скасовано.
    refetch()
  }
})

// Адреса керує підтвердженим пошуком.
// Старий таймер після навігації не перепише URL.
watch(
  () => route.fullPath,
  () => {
    if (route.name !== 'products') return

    const search = readSearch()
    const hadPendingEdit = isDebouncing.value

    revision++
    isDebouncing.value = false
    restoreInput(search)

    if (search !== confirmedQuery.value) {
      abort()
      skip.value = 0
      products.value = []
      total.value = 0
      confirmedQuery.value = search
    } else if (hadPendingEdit) {
      refetch()
    }
  },
  { flush: 'sync' },
)

watch(data, (page) => {
  if (!page) return

  total.value = page.total

  if (page.skip === 0) {
    products.value = page.products
  } else {
    const knownIds = new Set(
      products.value.map((product) => product.id),
    )

    const newProducts = page.products.filter((product) => {
      if (knownIds.has(product.id)) return false

      knownIds.add(product.id)
      return true
    })

    products.value = [...products.value, ...newProducts]
  }
})

const hasMore = computed(
  () => products.value.length < total.value,
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

// Зберігаємо назву обробника повтору, яку використовує шаблон.
function loadInitialProducts() {
  if (!isDebouncing.value) {
    refetch()
  }
}

onBeforeUnmount(() => {
  revision++
})
</script>

<template>
<div>
<Breadcrumbs :items="breadcrumbs" />
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
 </div>
</template>