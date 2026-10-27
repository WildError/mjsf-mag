<script setup>
import { RouterView } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/auth.js'
const { isAuthenticated } = storeToRefs(useAuthStore())
</script>

<template>
  <section v-if="isAuthenticated" class="manage">
    <p class="manage__notice">
      Навчальний редактор: підтверджені зміни діють до оновлення сторінки або виходу.
      Пошук у каталозі використовує початкові дані сервера.
    </p>
    <RouterView />
  </section>
  <p v-else role="status">Приватний розділ закрито.</p>
</template>
