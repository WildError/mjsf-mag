<script setup>
import { ref, useId } from 'vue'

defineProps({
  heading: {
    type: String,
    default: 'Огляд',
  },
})

const note = ref('')
const noteId = useId()
</script>

<template>
  <div class="overview-panel">
    <h3 class="overview-panel__title">{{ heading }}</h3>

    <p class="overview-panel__description">
      Введіть нотатку. Після перемикання вкладки та повернення
      текст має зберегтися завдяки KeepAlive.
    </p>

    <label :for="noteId" class="overview-panel__label">
      Моя нотатка
    </label>

    <textarea
      :id="noteId"
      v-model="note"
      rows="4"
      class="overview-panel__input"
      placeholder="Напишіть щось для перевірки..."
    />

    <p class="overview-panel__count">
      Кількість символів: {{ note.length }}
    </p>
  </div>
</template>

<style scoped lang="scss">
.overview-panel {
  @apply min-w-0 space-y-3;

  &__title {
    @apply text-xl font-bold;
  }

  &__description {
    @apply text-slate-600;
  }

  &__label {
    @apply block font-medium;
  }

  &__input {
    @apply block box-border w-full min-w-0 resize-y rounded-lg
      border border-slate-300 bg-white p-3 text-slate-900;

    &:focus-visible {
      @apply outline outline-2 outline-offset-2 outline-blue-600;
    }
  }

  &__count {
    @apply text-sm text-slate-500;
  }
}
</style>