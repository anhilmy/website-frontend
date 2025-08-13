import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      children: [
        {
          path: "", redirect: { name: 'home' }
        },
        {
          path: '/home',
          name: 'home',
        },
      ]
    },
  ]
})

export default router
