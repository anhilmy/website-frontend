import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/components/layout/MainLayout.vue'),
      children: [
        { path: '', name: 'about', component: () => import('@/views/AboutView.vue') },
        { path: 'blog', name: 'blog-list', component: () => import('@/views/blog/BlogList.vue') },
        { path: 'blog/:slug', name: 'blog-post', component: () => import('@/views/blog/BlogPost.vue') },
        { path: 'projects', name: 'project-list', component: () => import('@/views/projects/ProjectList.vue') },
        { path: 'projects/:slug', name: 'project-post', component: () => import('@/views/projects/ProjectPost.vue') },
        { path: 'uses', name: 'uses', component: () => import('@/views/UsesView.vue') },
      ],
    },
    // Hidden easter egg — not linked in nav
    { path: '/ludo', name: 'ludo', component: () => import('@/views/ludo/Ludo.vue') },
  ],
})

export default router
