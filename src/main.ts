import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/styles/main.scss'

import PrimeVue from 'primevue/config'
import 'primeicons/primeicons.css'

// Import theme preset
import Aura from '@primevue/themes/aura'
import { definePreset } from '@primevue/themes'

const app = createApp(App)

// Define custom preset
const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      500: '#ff6b35'
    }
  }
})

app.use(PrimeVue, {
  theme: {
    preset: MyPreset,
    options: {
      darkModeSelector: false
    }
  }
})

app.use(router)

app.mount('#app')