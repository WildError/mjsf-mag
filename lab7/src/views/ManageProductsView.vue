<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import Breadcrumbs from '../components/Breadcrumbs.vue'
import { useBreadcrumbs } from '../composables/useBreadcrumbs.js'
import { usePrivateResource } from '../composables/usePrivateResource.js'
import { useProductsStore } from '../stores/products.js'
import { errorMessage } from '../api/http.js'

const store = useProductsStore()
const skip = ref(0)
const limit = 12
const path = computed(() => `/auth/products?limit=${limit}&skip=${skip.value}`)
const { data, error, isLoading, refetch } = usePrivateResource(path)
const products = computed(() => (data.value?.products ?? []).map(store.displayProduct))
const breadcrumbs = useBreadcrumbs()
const money = new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'USD' })
function changePage(direction) {
  if (isLoading.value) return
  if (direction < 0 && skip.value === 0) return
  if (direction > 0 && (!data.value || skip.value + limit >= data.value.total)) return
  skip.value = Math.max(0, skip.value + direction * limit)
}
</script>

<template>
  <Breadcrumbs :items="breadcrumbs" />
  <header class="manage__heading">
    <div>
      <p class="storefront__eyebrow">Керування каталогом</p>
      <h1 class="manage__title">Товари</h1>
    </div>
    <p v-if="data">Показано {{ skip + 1 }}–{{ skip + products.length }} із {{ data.total }}</p>
  </header>
  <p v-if="isLoading" class="manage__state" role="status">Завантажуємо приватний список…</p>
  <div v-else-if="error" class="manage__state" role="alert">
    <p>{{ errorMessage(error) }}</p>
    <button type="button" class="action-button" @click="refetch">Повторити запит</button>
  </div>
  <ul v-else class="manage-list">
    <li v-for="product in products" :key="product.id" class="manage-list__item">
      <div class="manage-list__info">
        <span class="manage-list__id">№ {{ product.id }}</span>
        <h2 class="manage-list__title">{{ product.title }}</h2>
        <p class="manage-list__meta">{{ money.format(product.price) }} · Залишок: {{ product.stock }}</p>
      </div>
      <RouterLink class="action-button action-button--secondary"
        :to="{ name: 'manage-edit', params: { id: product.id } }">Редагувати</RouterLink>
    </li>
  </ul>
  <nav class="manage__pagination" aria-label="Сторінки списку">
    <button class="action-button action-button--secondary" :disabled="isLoading || skip === 0" @click="changePage(-1)">Попередня</button>
    <span>Сторінка {{ Math.floor(skip / limit) + 1 }}</span>
    <button class="action-button action-button--secondary"
      :disabled="isLoading || !data || skip + limit >= data.total" @click="changePage(1)">Наступна</button>
  </nav>
</template>
