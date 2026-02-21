import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/styles/main.scss'

import PrimeVue from 'primevue/config'
import 'primeicons/primeicons.css'

import Aura from '@primevue/themes/aura'

const app = createApp(App)

app.use(router)

app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: 'none' 
    }
  }
})

app.mount('#app')