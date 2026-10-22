<script setup>
import { computed, ref } from 'vue'

const requirements = [
  'Перевірити перемикання вкладок',
  'Перевірити керування клавіатурою',
  'Перевірити збереження стану',
]

const checked = ref([])
const checks = ref(0)

const completedCount = computed(() => checked.value.length)
</script>

<template>
  <div class="requirements-panel">
    <h3 class="requirements-panel__title">Вимоги до роботи</h3>

    <label
      v-for="(requirement, index) in requirements"
      :key="index"
      class="requirements-panel__item"
    >
      <input
        v-model="checked"
        type="checkbox"
        :value="index"
        class="requirements-panel__checkbox"
      />
      <span>{{ requirement }}</span>
    </label>

    <p>Виконано: {{ completedCount }} з {{ requirements.length }}</p>

    <button
      type="button"
      class="requirements-panel__button"
      @click="checks++"
    >
      Перевірити виконання
    </button>

    <p class="requirements-panel__count">
      Кількість перевірок: {{ checks }}
    </p>
  </div>
</template>

<style scoped lang="scss">
.requirements-panel {
  @apply min-w-0 space-y-4;

  &__title {
    @apply text-xl font-bold;
  }

  &__item {
    @apply flex cursor-pointer items-start gap-3;
  }

  &__checkbox {
    @apply mt-1 h-5 w-5 shrink-0 accent-blue-600;

    &:focus-visible {
      @apply outline outline-2 outline-offset-2 outline-blue-600;
    }
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