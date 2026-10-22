<script setup>
defineProps({
  title: { type: String, required: true },
  topic: { type: String, required: true },
  description: { type: String, required: true },
  minutes: { type: Number, required: true },
  selected: { type: Boolean, default: false },
  number: { type: Number, default: 1 },
})

const emit = defineEmits(['select', 'edit', 'delete'])

const topicLabels = {
  vue: 'Vue',
  html: 'HTML',
  css: 'CSS',
  javascript: 'JavaScript',
}
</script>

<template>

  <article
    class="material-card"
    :class="[
      `material-card--${topic}`,
      { 'material-card--selected': selected },
    ]"
  >
    <div class="material-card__meta">
      <span class="material-card__number">
        {{ String(number).padStart(2, '0') }}
      </span>
      <span class="material-card__topic">
        {{ topicLabels[topic] || topic }}
      </span>
    </div>

    <h3 class="material-card__title">{{ title }}</h3>
    <p class="material-card__description">{{ description }}</p>

    <div class="material-card__footer">
      <span class="material-card__duration">{{ minutes }} хв</span>
      <button
        class="material-card__action"
        type="button"
        :aria-pressed="selected"
        @click="emit('select', title)"
      >
        {{ selected ? 'Обрано' : 'Обрати' }}
        <span aria-hidden="true">{{ selected ? '✓' : '↗' }}</span>
      </button>
    </div>
	<div class="mt-3 flex flex-wrap gap-2">
  <button
    type="button"
    class="min-h-11 cursor-pointer rounded-lg border-0 bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2"
    @click="emit('edit')"
  >
    Редагувати
  </button>

  <button
    type="button"
    class="min-h-11 cursor-pointer rounded-lg border-0 bg-red-600 px-3 py-2 text-white hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-600 focus-visible:outline-offset-2"
    @click="emit('delete')"
  >
    Видалити
  </button>
</div>
  </article>
</template>