<script setup>
import MaterialCatalog from './components/MaterialCatalog.vue'
</script>
<template>
  <div class="page">
    <main class="app">
      <header class="app__header">
        <a class="brand" href="#" aria-label="Інформація про виконавця — на початок">
          <span class="brand__mark" aria-hidden="true">ІВ</span>
          <span class="brand__text">Інформація про виконавця</span>
        </a>

        <div class="student-info" aria-label="Дані студента та середовище">
          <!-- TODO: студент замінює текст на власні дані до знімків екрана. -->
          <p class="student-info__item">
            <span class="student-info__label">Студент</span>
            <strong class="student-info__value">Коцур Валерій · група F2.25-2-з</strong>
          </p>
          <p class="student-info__item">
            <span class="student-info__label">Середовище</span>
            <strong class="student-info__value">Windows 11 · Chrome · Node.js v24.13.0</strong>
          </p>
        </div>
      </header>

      <section class="hero" aria-labelledby="page-title">
        <div class="hero__content">
          <p class="hero__eyebrow">Лабораторна робота № 3</p>
          <h5 class="hero__title" id="page-title">Створення адаптивного модального вікна з використанням слотів, ref, Teleport і Transition</h5>
        </div>
      </section>

<MaterialCatalog />

      <footer class="app__footer">
        <span>Інформація про виконавця · 2026</span>
        <span>Статичну верстку потрібно перетворити на Vue-застосунок</span>
      </footer>
    </main>

  </div>
</template>