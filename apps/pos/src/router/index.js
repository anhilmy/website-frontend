import { createRouter, createWebHistory } from 'vue-router'
import { isAuthenticated, isManager } from '../lib/session'

import LoginView from '../views/LoginView.vue'
import TerminalView from '../views/TerminalView.vue'
import OrdersView from '../views/OrdersView.vue'
import OrderDetailView from '../views/OrderDetailView.vue'
import MenuView from '../views/MenuView.vue'
import UsersView from '../views/UsersView.vue'
import NotFound from '../components/NotFound.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', name: 'login', component: LoginView, meta: { bare: true } },
    { path: '/', redirect: '/terminal' },
    { path: '/terminal', name: 'terminal', component: TerminalView },
    { path: '/orders', name: 'orders', component: OrdersView },
    { path: '/orders/:id', name: 'order', component: OrderDetailView },
    { path: '/menu', name: 'menu', component: MenuView },
    { path: '/users', name: 'users', component: UsersView, meta: { manager: true } },
    { path: '/:pathMatch(.*)*', name: 'notfound', component: NotFound, meta: { bare: true } },
  ],
})

router.beforeEach((to) => {
  if (to.meta.bare) {
    if (to.name === 'login' && isAuthenticated()) return { name: 'terminal' }
    return true
  }
  if (!isAuthenticated()) return { name: 'login', query: { next: to.fullPath } }
  if (to.meta.manager && !isManager()) return { name: 'terminal' }
  return true
})

export default router
