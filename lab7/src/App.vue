<script setup>
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from './stores/auth.js'
import { useProductsStore } from './stores/products.js'
const auth = useAuthStore()
useProductsStore()
const { user, isAuthenticated, isBusy } = storeToRefs(auth)
const router = useRouter()
function logout() {
  auth.logout()
  router.replace({ name: 'products' })
}
</script>

<template>
  <main class="storefront">
    <header class="storefront__masthead">
      <RouterLink
        class="storefront__brand"
        :to="{ name: 'products' }"
        aria-label="Forma, до каталогу"
      >
        FORMA<span class="storefront__brand-mark">®</span>
      </RouterLink>

      <p class="storefront__edition">Лабораторна / 07</p>
      <p class="storefront__note">Каталог і Pinia</p>
    </header>

    <nav class="site-nav" aria-label="Основна навігація">
      <RouterLink
        :to="{ name: 'products' }"
        class="site-nav__link"
      >
        Каталог
      </RouterLink>

      <RouterLink
        :to="{ name: 'about' }"
        class="site-nav__link"
      >
        Про застосунок
      </RouterLink>
      <RouterLink :to="{ name: 'manage-products' }" class="site-nav__link">Керування</RouterLink>
      <div class="session-bar">
        <template v-if="isAuthenticated">
          <span class="session-bar__name">{{ user.firstName }} {{ user.lastName }}</span>
          <button type="button" class="action-button action-button--secondary" @click="logout">Вийти</button>
        </template>
        <span v-else-if="isBusy" role="status">Перевіряємо сеанс…</span>
        <RouterLink v-else :to="{ name: 'login' }" class="action-button action-button--secondary">Увійти</RouterLink>
      </div>
    </nav>

    <RouterView />

    <footer class="storefront__footer">
      <p>Студент: Коцур Валерій · F2.25-2-з</p>
      <p>
        Середовище: Windows · Node.js · Vue 3 ·
        Vue Router · Pinia · Vite · Notepad++
      </p>
    </footer>
  </main>
</template>

<style scoped>
.site-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 24px;
  padding: 16px 0;
}

.site-nav__link {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  color: inherit;
  text-decoration: none;
}

.site-nav__link.router-link-exact-active {
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 6px;
}

.site-nav__link:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 4px;
}
</style>