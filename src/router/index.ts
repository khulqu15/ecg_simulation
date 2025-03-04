import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import HomePage from '../views/HomePage.vue'
import SimulationPage from '../views/SimulationPage.vue'
import DrawPage from '@/views/DrawPage.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/sim',
    name: 'Simulation',
    component: SimulationPage
  },
  {
    path: '/draw',
    name: 'Draw',
    component: DrawPage
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
