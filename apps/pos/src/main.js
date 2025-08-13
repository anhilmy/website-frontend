import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config'
import Material from '@primevue/themes/material'
import Button from 'primevue/button'

const app = createApp(App)
app.use(PrimeVue,
    {
        theme: {
            preset: Material
        }
    }
)
app.component('Button', Button)


app.use(router)

app.mount('#app')