<script setup>
import { ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/auth.js'
import { safeRedirect } from '../router/guards.js'
import Breadcrumbs from '../components/Breadcrumbs.vue'
import { useBreadcrumbs } from '../composables/useBreadcrumbs.js'

const auth = useAuthStore()
const { status, error, isBusy, isAuthenticated } = storeToRefs(auth)
const route = useRoute()
const router = useRouter()
const breadcrumbs = useBreadcrumbs()
const username = ref('')
const password = ref('')

async function signIn() {
  if (isBusy.value) return
  const pending = auth.login(username.value.trim(), password.value)
  password.value = ''
  if (await pending) await router.replace(safeRedirect(router, route.query.redirect))
}
async function retrySession() {
  if (await auth.restore(true)) await router.replace(safeRedirect(router, route.query.redirect))
}
</script>

<template>
  <section class="auth-page">
    <Breadcrumbs :items="breadcrumbs" />
    <div class="auth-page__intro">
      <p class="storefront__eyebrow">Приватний розділ</p>
      <h1 class="auth-page__title">Вхід до керування</h1>
      <p>Увійдіть навчальним обліковим записом DummyJSON, щоб редагувати товари.</p>
    </div>
    <p v-if="error" class="editor-form__error" role="alert">{{ error }}</p>
    <div v-if="status === 'unavailable'" class="auth-page__recovery">
      <p>Приватні дані закрито. Збережений сеанс можна перевірити повторно.</p>
      <button class="action-button" type="button" @click="retrySession">Повторити перевірку сеансу</button>
      <button class="action-button action-button--secondary" type="button" @click="auth.logout()">Скинути сеанс</button>
    </div>
    <p v-else-if="isAuthenticated">
      Ви вже увійшли. <RouterLink :to="safeRedirect(router, route.query.redirect)">Відкрити керування</RouterLink>
    </p>
    <form v-else class="editor-form auth-page__form" @submit.prevent="signIn">
      <fieldset :disabled="isBusy" class="editor-form__fieldset">
        <div class="editor-form__field">
          <label for="login-name">Ім’я користувача</label>
          <input id="login-name" v-model="username" class="editor-form__input" autocomplete="username" required />
        </div>
        <div class="editor-form__field">
          <label for="login-password">Пароль</label>
          <input id="login-password" v-model="password" class="editor-form__input" type="password" autocomplete="current-password" required />
        </div>
        <button class="action-button" type="submit">{{ isBusy ? 'Перевіряємо…' : 'Увійти' }}</button>
      </fieldset>
      <p role="status" aria-live="polite">{{ isBusy ? 'Триває перевірка. Зачекайте.' : '' }}</p>
    </form>
  </section>
</template>
