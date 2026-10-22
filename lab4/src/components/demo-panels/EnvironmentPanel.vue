<script setup>
import { ref } from 'vue'
import ModalDialog from '../ModalDialog.vue'

defineProps({
  heading: {
    type: String,
    default: 'Середовище розробки',
  },
})

const isModalOpen = ref(false)
const openCount = ref(0)

function openModal() {
  openCount.value++
  isModalOpen.value = true
}
</script>

<template>
  <div class="environment-panel">
    <h3 class="environment-panel__title">{{ heading }}</h3>

    <ul class="environment-panel__list">
      <li>Фреймворк: Vue 3</li>
      <li>Збірка: Vite</li>
      <li>Стилі: Tailwind CSS та SCSS</li>
      <li>Редактор: Notepad++</li>
    </ul>

    <button
      type="button"
      class="environment-panel__button"
      @click="openModal"
    >
      Відкрити інформацію
    </button>

    <p class="environment-panel__count">
      Кількість відкриттів: {{ openCount }}
    </p>

    <ModalDialog
      v-model="isModalOpen"
      title="Інформація про середовище"
    >
      <p>
        Лабораторна робота №4: вкладки з використанням
        Slots, Provide/Inject, динамічних компонентів та KeepAlive.
      </p>
    </ModalDialog>
  </div>
</template>

<style scoped lang="scss">
.environment-panel {
  @apply min-w-0 space-y-4;

  &__title {
    @apply text-xl font-bold;
  }

  &__list {
    @apply list-disc space-y-2 pl-5 text-slate-600;
  }

  &__button {
    @apply min-h-11 rounded-lg bg-blue-600 px-4 py-2 text-white;

    &:hover {
      @apply bg-blue-700;
    }

    &:focus-visible {
      @apply outline outline-2 outline-offset-2 outline-blue-600;
    }
  }

  &__count {
    @apply text-sm text-slate-500;
  }
}
</style>