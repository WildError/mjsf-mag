<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="products-layout">
    <RouterView />
  </div>
</template>

<style scoped>
.products-layout {
  min-width: 0;
}
</style>