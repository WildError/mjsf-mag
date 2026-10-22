<script setup>
import { ref } from 'vue'

import Tabs from './components/tabs/Tabs.vue'
import Tab from './components/tabs/Tab.vue'

import OverviewPanel from './components/demo-panels/OverviewPanel.vue'
import RequirementsPanel from './components/demo-panels/RequirementsPanel.vue'
import EnvironmentPanel from './components/demo-panels/EnvironmentPanel.vue'

const underlineTab = ref('overview')
const pillsTab = ref('overview')
const boxedTab = ref('environment')

const dynamicTabs = [
  {
    slug: 'overview',
    title: 'Огляд',
    panel: OverviewPanel,
    panelProps: {
      heading: 'Огляд через динамічний компонент',
    },
  },
  {
    slug: 'requirements',
    title: 'Вимоги',
    panel: RequirementsPanel,
    panelProps: {},
  },
  {
    slug: 'environment',
    title: 'Середовище',
    panel: EnvironmentPanel,
    panelProps: {
      heading: 'Середовище через динамічний компонент',
    },
  },
]
</script>

<template>
  <main class="page">
    <header class="page__header">
      <h1 class="page__title">Лабораторна робота №4</h1>

      <p class="page__description">
        Slots, Provide/Inject, динамічні компоненти та KeepAlive
      </p>

      <p>Виконав: Валерій Коцур</p>
      <p>Група: F2.25-2-з</p>
      <p class="page__description">
        Середовище: Vue 3 · Vite · Tailwind CSS · SCSS
      </p>
    </header>

    <Tabs
      v-model="underlineTab"
      variant="underline"
      title="1. Вкладки через слоти"
    >
      <Tab slug="overview" title="Огляд">
        <OverviewPanel />
      </Tab>

      <Tab slug="requirements" title="Вимоги">
        <RequirementsPanel />
      </Tab>

      <Tab slug="environment" title="Середовище">
        <EnvironmentPanel />
      </Tab>
    </Tabs>

    <Tabs
      v-model="pillsTab"
      variant="pills"
      title="2. Динамічні компоненти"
    >
      <Tab
        v-for="tab in dynamicTabs"
        :key="tab.slug"
        :slug="tab.slug"
        :title="tab.title"
        :panel="tab.panel"
        :panel-props="tab.panelProps"
      />
    </Tabs>

    <Tabs
      v-model="boxedTab"
      variant="boxed"
      title="3. Вкладки з недоступним пунктом"
    >
      <Tab slug="environment" title="Середовище">
        <EnvironmentPanel heading="Окремий екземпляр середовища" />
      </Tab>

      <Tab slug="unavailable" title="Недоступна" disabled>
        <OverviewPanel heading="Недоступна панель" />
      </Tab>

      <Tab slug="requirements" title="Вимоги">
        <RequirementsPanel />
      </Tab>
    </Tabs>
  </main>
</template>

<style scoped lang="scss">
.page {
  @apply mx-auto w-full max-w-5xl space-y-6 px-4 py-6;

  &__header {
    @apply space-y-2;
  }

  &__title {
    @apply font-display text-2xl font-bold text-ink;
  }

  &__description {
    @apply text-sm text-muted;
  }
}
</style>