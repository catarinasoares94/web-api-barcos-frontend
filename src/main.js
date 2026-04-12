import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

import App from './App.vue'
import Home from './components/Home.vue'
import Marinheiros from './components/Marinheiros.vue'
import Barcos from './components/Barcos.vue'
import Reservas from './components/Reservas.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/marinheiros', component: Marinheiros },
    { path: '/barcos', component: Barcos },
    { path: '/reservas', component: Reservas }
  ]
})

const app = createApp(App)

app.use(router)

app.mount('#app')