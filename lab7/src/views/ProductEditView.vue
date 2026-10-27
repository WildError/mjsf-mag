<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'
import { storeToRefs } from 'pinia'
import Breadcrumbs from '../components/Breadcrumbs.vue'
import { useBreadcrumbs } from '../composables/useBreadcrumbs.js'
import { usePrivateResource } from '../composables/usePrivateResource.js'
import { useAuthStore } from '../stores/auth.js'
import { useProductsStore } from '../stores/products.js'
import { makeDraft, validateDraft, validProductId, EDIT_FIELDS } from '../api/productDraft.js'
import { errorMessage } from '../api/http.js'

const route = useRoute()
const auth = useAuthStore()
const store = useProductsStore()
const { isSaving, error: saveError } = storeToRefs(store)
const id = computed(() => String(route.params.id ?? ''))
const validId = computed(() => validProductId(id.value))
const path = computed(() => validId.value ? `/auth/products/${id.value}` : null)
const { data, error, isLoading, refetch } = usePrivateResource(path)
const product = computed(() => store.displayProduct(data.value))
const notFound = computed(() => !validId.value || error.value?.status === 404)
const breadcrumbs = useBreadcrumbs(() =>
  notFound.value ? 'Товар не знайдено' : product.value?.title || `Товар №${id.value}`)
const draft = ref(makeDraft(null))
const baseline = ref(makeDraft(null))
const errors = ref({})
const success = ref('')
const form = ref(null)
let alive = true

function resetDraft() {
  draft.value = makeDraft(product.value)
  baseline.value = { ...draft.value }
  errors.value = {}
  success.value = ''
}
watch(data, resetDraft, { immediate: true })
watch(id, () => { store.cancelSave(); success.value = ''; errors.value = {} }, { flush: 'sync' })
const dirty = computed(() => EDIT_FIELDS.some(key => draft.value[key] !== baseline.value[key]))
watch(draft, () => { success.value = '' }, { deep: true, flush: 'sync' })

function cancelChanges() {
  store.cancelSave()
  resetDraft()
}
async function submit() {
  if (isSaving.value || !product.value || !auth.isAuthenticated) return
  const checked = validateDraft({ ...draft.value })
  errors.value = checked.errors
  success.value = ''
  if (!checked.valid) {
    await nextTick()
    form.value?.querySelector('[aria-invalid="true"]')?.focus()
    return
  }
  const targetId = id.value
  const result = await store.save(targetId, { ...draft.value })
  if (result && alive && id.value === targetId && auth.isAuthenticated) {
    resetDraft()
    success.value = 'Зміни збережено. Список, каталог і хлібні крихти оновлено.'
  }
}
function canLeave() {
  // Вихід або 401 завжди мають закривати приватний редактор.
  return !auth.isAuthenticated || !dirty.value || window.confirm('Є незбережені зміни. Залишити сторінку та втратити їх?')
}
onBeforeRouteLeave(() => canLeave())
onBeforeRouteUpdate((to, from) => to.params.id === from.params.id || canLeave())
function beforeUnload(event) {
  if (!auth.isAuthenticated || !dirty.value) return
  event.preventDefault()
  event.returnValue = ''
}
onMounted(() => window.addEventListener('beforeunload', beforeUnload))
onBeforeUnmount(() => {
  alive = false
  store.cancelSave()
  window.removeEventListener('beforeunload', beforeUnload)
})
</script>

<template>
  <Breadcrumbs :items="breadcrumbs" />
  <div v-if="notFound" class="manage__state">
    <h1>Товар не знайдено</h1>
    <p>Перевірте ідентифікатор товару.</p>
    <RouterLink class="action-button action-button--secondary" :to="{ name: 'manage-products' }">До списку</RouterLink>
  </div>
  <p v-else-if="isLoading" class="manage__state" role="status">Завантажуємо товар №{{ id }}…</p>
  <div v-else-if="error" class="manage__state" role="alert">
    <p>{{ errorMessage(error) }}</p>
    <button class="action-button" type="button" @click="refetch">Повторити запит</button>
  </div>
  <template v-else-if="product">
    <header class="manage__heading">
      <div>
        <p class="storefront__eyebrow">Редактор · товар №{{ id }}</p>
        <h1 class="manage__title">{{ product.title }}</h1>
      </div>
      <RouterLink class="action-button action-button--secondary"
        :to="{ name: 'product-overview', params: { id } }">Переглянути товар</RouterLink>
    </header>
    <form ref="form" class="editor-form" novalidate @submit.prevent="submit">
      <fieldset class="editor-form__fieldset" :disabled="isSaving">
        <legend class="editor-form__legend">Дані товару</legend>
        <div class="editor-form__field">
          <label for="edit-title">Назва</label>
          <input id="edit-title" v-model="draft.title" class="editor-form__input"
            :aria-invalid="Boolean(errors.title)" aria-describedby="title-help title-error" />
          <span id="title-help" class="editor-form__help">Від 1 до 120 символів.</span>
          <span v-if="errors.title" id="title-error" class="editor-form__error">{{ errors.title }}</span>
        </div>
        <div class="editor-form__row">
          <div class="editor-form__field">
            <label for="edit-price">Ціна, USD</label>
            <input id="edit-price" v-model="draft.price" class="editor-form__input" type="number" step="any"
              :aria-invalid="Boolean(errors.price)" aria-describedby="price-error" />
            <span v-if="errors.price" id="price-error" class="editor-form__error">{{ errors.price }}</span>
          </div>
          <div class="editor-form__field">
            <label for="edit-stock">Залишок, шт.</label>
            <input id="edit-stock" v-model="draft.stock" class="editor-form__input" type="number" step="1"
              :aria-invalid="Boolean(errors.stock)" aria-describedby="stock-error" />
            <span v-if="errors.stock" id="stock-error" class="editor-form__error">{{ errors.stock }}</span>
          </div>
        </div>
        <div class="editor-form__field">
          <label for="edit-description">Опис</label>
          <textarea id="edit-description" v-model="draft.description" class="editor-form__input editor-form__input--area"
            rows="5" :aria-invalid="Boolean(errors.description)" aria-describedby="description-help description-error"></textarea>
          <span id="description-help" class="editor-form__help">Від 1 до 2000 символів.</span>
          <span v-if="errors.description" id="description-error" class="editor-form__error">{{ errors.description }}</span>
        </div>
        <div class="editor-form__actions">
          <button class="action-button" type="submit">{{ isSaving ? 'Зберігаємо…' : 'Зберегти зміни' }}</button>
          <button class="action-button action-button--secondary" type="button" @click="cancelChanges">Скасувати зміни</button>
        </div>
      </fieldset>
      <p v-if="saveError" class="editor-form__error" role="alert">{{ saveError }}</p>
      <p class="editor-form__status" role="status" aria-live="polite">
        {{ isSaving ? 'Очікуємо підтвердження сервера…' : success || (dirty ? 'Є незбережені зміни.' : 'Незбережених змін немає.') }}
      </p>
    </form>
  </template>
</template>
