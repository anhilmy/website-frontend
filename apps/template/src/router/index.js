import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: () => import("@/views/Home.vue"),
      children: [
        {
          path: '',
          name: 'home',
        }
      ]
    }
  ]
})

export default router
