<script setup>
defineProps({
  title: { type: String, required: true },
  topic: { type: String, required: true },
  description: { type: String, required: true },
  minutes: { type: Number, required: true },
  selected: { type: Boolean, default: false },
  number: { type: Number, default: 1 },
})

const emit = defineEmits(['select'])

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
  </article>
</template>