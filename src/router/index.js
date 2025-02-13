import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "",
      redirect: { name: 'home' }
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    },
    {
      path: "/test",
      name: "test",
      component: () => import("../views/main/Test.vue")
    },
    {
      path: "/status",
      name: "status",
      component: () => import("../views/NotImplemented.vue")
    },
    {
      path: "/blog",
      name: "blog",
      component: () => import("../views/NotImplemented.vue")
    },
    {
      path: "/projects",
      name: "projects",
      component: () => import("../views/NotImplemented.vue")
    }
  ]
})

export default router
