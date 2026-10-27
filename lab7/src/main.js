import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import './styles/main.css'
import './styles/manage.css'
import { pinia } from './stores/index.js'
import { installGuards } from './router/guards.js'

installGuards(router, pinia)

createApp(App)
  .use(pinia)
  .use(router)
  .mount('#app')