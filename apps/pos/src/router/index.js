import { createRouter, createWebHistory } from 'vue-router'
import StatusPage from '../components/StatusPage.vue'
import NotFound from '../components/NotFound.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      children: [
        {
          path: '',
          name: 'home',
          component: StatusPage
        },
      ]
    },
    // Catch-all route for 404 Not Found
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFound
    }
  ]
})

export default router
