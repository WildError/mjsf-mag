<script setup>
import { computed, reactive, ref } from 'vue'
import MaterialFilterForm from './MaterialFilterForm.vue'
import MaterialCard from './MaterialCard.vue'
import ModalDialog from './ModalDialog.vue'
import { materials } from '../data/materials.js'

// Робоча копія даних. Початковий масив не змінюємо.
const items = ref(materials.map((material) => ({ ...material })))
const selectedId = ref(items.value[0]?.id ?? null)

const appliedFilters = reactive({
  query: '',
  topic: 'all',
})

const filteredMaterials = computed(() => {
  const query = appliedFilters.query.toLowerCase()

  return items.value.filter((material) => {
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

const selectedTitle = computed(() =>
  items.value.find((material) => material.id === selectedId.value)?.title
  ?? 'Матеріал не обрано',
)

function applyFilters(filters) {
  appliedFilters.query = filters.query.trim()
  appliedFilters.topic = filters.topic
}

function clearFilters() {
  appliedFilters.query = ''
  appliedFilters.topic = 'all'
  selectedId.value = items.value[0]?.id ?? null
}

// Стан єдиного модального вікна.
const isOpen = ref(false)
const mode = ref('edit')
const activeId = ref(null)
const draft = ref({ title: '', minutes: '' })
const errorMessage = ref('')

const nameInput = ref(null)
const cancelButton = ref(null)
const catalogHeading = ref(null)

const dialogTitle = computed(() =>
  mode.value === 'edit'
    ? 'Редагування матеріалу'
    : 'Підтвердження видалення',
)

function openEdit(material) {
  mode.value = 'edit'
  activeId.value = material.id
  draft.value = {
    title: material.title,
    minutes: material.minutes,
  }
  errorMessage.value = ''
  isOpen.value = true
}

function openDelete(material) {
  mode.value = 'delete'
  activeId.value = material.id
  draft.value = {
    title: material.title,
    minutes: material.minutes,
  }
  errorMessage.value = ''
  isOpen.value = true
}

function closeDialog() {
  isOpen.value = false
}

function saveMaterial() {
  const title = draft.value.title.trim()
  const minutes = Number(draft.value.minutes)

  if (!title) {
    errorMessage.value = 'Введіть назву матеріалу.'
    return
  }

  if (!Number.isInteger(minutes) || minutes <= 0) {
    errorMessage.value = 'Тривалість має бути цілим числом, більшим за нуль.'
    return
  }

  const index = items.value.findIndex(
    (material) => material.id === activeId.value,
  )

  if (index === -1) {
    errorMessage.value = 'Матеріал не знайдено.'
    return
  }

  items.value[index] = {
    ...items.value[index],
    title,
    minutes,
  }

  closeDialog()
}

function deleteMaterial() {
  items.value = items.value.filter(
    (material) => material.id !== activeId.value,
  )

  if (selectedId.value === activeId.value) {
    selectedId.value = items.value[0]?.id ?? null
  }

  closeDialog()
}
</script>

<template>
  <section class="material-catalog" aria-labelledby="catalog-title">
    <div class="material-catalog__heading">
      <div>
        <h2
          id="catalog-title"
          ref="catalogHeading"
          tabindex="-1"
          class="material-catalog__title"
        >
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
      <strong class="selection-status__value">
        {{ selectedTitle }}
      </strong>
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
        :selected="material.id === selectedId"
        @select="selectedId = material.id"
        @edit="openEdit(material)"
        @delete="openDelete(material)"
      />
    </div>

    <p v-else class="empty-state">
      За заданими умовами матеріалів немає.
    </p>

<ModalDialog
  v-model="isOpen"
  :title="dialogTitle"
  :initial-focus="mode === 'edit' ? nameInput : cancelButton"
  :fallback-focus="catalogHeading"
>
      <form
	  
        v-if="mode === 'edit'"
        id="material-edit-form"
        class="flex flex-col gap-4"
        novalidate
        @submit.prevent="saveMaterial"
      >
        <div class="flex flex-col gap-2">
          <label for="material-title" class="font-bold">
            Назва матеріалу
          </label>

          <input
            id="material-title"
            ref="nameInput"
            v-model="draft.title"
            type="text"
            required
            class="box-border min-h-11 w-full rounded-lg border border-solid border-slate-300 bg-white px-3 py-2 text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label for="material-minutes" class="font-bold">
            Тривалість у хвилинах
          </label>

          <input
            id="material-minutes"
            v-model="draft.minutes"
            type="number"
            min="1"
            step="1"
            required
            class="box-border min-h-11 w-full rounded-lg border border-solid border-slate-300 bg-white px-3 py-2 text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
          />
        </div>

        <p v-if="errorMessage" role="alert" class="m-0 text-red-700">
          {{ errorMessage }}
        </p>
		<p v-for="n in 15" :key="n">
  Абзац {{ n }}. Перевірка довгого вмісту модального вікна.
  Текст має прокручуватися всередині, а заголовок і кнопки
  повинні залишатися доступними.
</p>
      </form>

      <div v-else>
        <p>
          Видалити матеріал «{{ draft.title }}»?
        </p>
        <p>
          Матеріал буде прибрано з поточного списку.
          Скасувати підтверджене видалення в інтерфейсі неможливо.
        </p>
      </div>

      <template #footer>
        <button
          ref="cancelButton"
          type="button"
          class="min-h-11 min-w-11 cursor-pointer rounded-lg border-0 bg-slate-200 px-4 py-2 text-slate-900 hover:bg-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
          @click="closeDialog"
        >
          Скасувати
        </button>

        <button
          v-if="mode === 'edit'"
          type="submit"
          form="material-edit-form"
          class="min-h-11 min-w-11 cursor-pointer rounded-lg border-0 bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
        >
          Зберегти
        </button>

        <button
          v-else
          type="button"
          class="min-h-11 min-w-11 cursor-pointer rounded-lg border-0 bg-red-600 px-4 py-2 text-white hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-600"
          @click="deleteMaterial"
        >
          Видалити
        </button>
      </template>
    </ModalDialog>
  </section>
</template>