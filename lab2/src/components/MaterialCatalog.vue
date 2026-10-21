<script setup>
import { computed, reactive, ref } from 'vue'
import MaterialFilterForm from './MaterialFilterForm.vue'
import MaterialCard from './MaterialCard.vue'
import { materials } from '../data/materials.js'

const appliedFilters = reactive({
  query: '',
  topic: 'all',
})

const selectedTitle = ref(materials[0].title)

const filteredMaterials = computed(() => {
  const query = appliedFilters.query.toLowerCase()

  return materials.filter((material) => {
    const matchesTitle = material.title.toLowerCase().includes(query)
    const matchesTopic =
      appliedFilters.topic === 'all' ||
      material.topic === appliedFilters.topic

    return matchesTitle && matchesTopic
  })
})

const totalMinutes = computed(() =>
  filteredMaterials.value.reduce((sum, material) => sum + material.minutes, 0),
)

function applyFilters(filters) {
  appliedFilters.query = filters.query.trim()
  appliedFilters.topic = filters.topic
}

function clearFilters() {
  appliedFilters.query = ''
  appliedFilters.topic = 'all'
  selectedTitle.value = materials[0].title
}
</script>

<template>
  <section class="material-catalog" aria-labelledby="catalog-title">
    <div class="material-catalog__heading">
      <div>
        <h2 class="material-catalog__title" id="catalog-title">
          Каталог матеріалів
        </h2>
      </div>

      <p class="material-catalog__summary">
        <strong class="material-catalog__count">
          Знайдено: {{ filteredMaterials.length }}
        </strong>
        <span aria-hidden="true">·</span>
        Загальна тривалість: {{ totalMinutes }} хв
      </p>
    </div>

    <MaterialFilterForm
      @apply="applyFilters"
      @clear="clearFilters"
    />

    <p class="selection-status" aria-live="polite">
      <span class="selection-status__label">Обраний матеріал</span>
      <strong class="selection-status__value">{{ selectedTitle }}</strong>
    </p>

    <div v-if="filteredMaterials.length > 0" class="material-list">
      <MaterialCard
        v-for="material in filteredMaterials"
        :key="material.id"
        :number="material.id"
        :title="material.title"
        :topic="material.topic"
        :description="material.description"
        :minutes="material.minutes"
        :selected="material.title === selectedTitle"
        @select="selectedTitle = $event"
      />
    </div>

    <p v-else class="empty-state">
      За заданими умовами матеріалів немає.
    </p>
  </section>
</template>