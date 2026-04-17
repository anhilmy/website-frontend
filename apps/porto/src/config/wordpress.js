// src/config/wordpress.js
export default {
    baseUrl: import.meta.env.VITE_WP_API_URL || 'https://blog.anhilmy.com/wp-json/wp/v2',
    endpoints: {
        posts: '/posts',
        projects: '/projects',
        categories: '/categories',
        tags: '/tags',
        media: '/media',
    },
    postsPerPage: 10,
}
