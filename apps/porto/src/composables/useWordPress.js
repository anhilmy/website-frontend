// src/composables/useWordPress.js
import { ref } from 'vue'
import wpConfig from '@/config/wordpress.js'

export function useWordPress() {
    const loading = ref(false)
    const error = ref(null)

    async function fetchPosts(page = 1, perPage = wpConfig.postsPerPage) {
        loading.value = true
        error.value = null
        try {
            const url = `${wpConfig.baseUrl}${wpConfig.endpoints.posts}?_embed&per_page=${perPage}&page=${page}`
            const response = await fetch(url)
            if (!response.ok) throw new Error(`HTTP ${response.status}`)
            const data = await response.json()
            const total = parseInt(response.headers.get('X-WP-Total') || '0', 10)
            const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '0', 10)
            return { posts: data, total, totalPages }
        } catch (err) {
            error.value = err.message
            return { posts: [], total: 0, totalPages: 0 }
        } finally {
            loading.value = false
        }
    }

    async function fetchPost(slug) {
        loading.value = true
        error.value = null
        try {
            const url = `${wpConfig.baseUrl}${wpConfig.endpoints.posts}?_embed&slug=${encodeURIComponent(slug)}`
            const response = await fetch(url)
            if (!response.ok) throw new Error(`HTTP ${response.status}`)
            const data = await response.json()
            return data[0] || null
        } catch (err) {
            error.value = err.message
            return null
        } finally {
            loading.value = false
        }
    }

    async function fetchProjects() {
        loading.value = true
        error.value = null
        try {
            const url = `${wpConfig.baseUrl}${wpConfig.endpoints.projects}?_embed`
            const response = await fetch(url)
            if (!response.ok) throw new Error(`HTTP ${response.status}`)
            const data = await response.json()
            return data
        } catch (err) {
            error.value = err.message
            return []
        } finally {
            loading.value = false
        }
    }

    async function fetchProject(slug) {
        loading.value = true
        error.value = null
        try {
            const url = `${wpConfig.baseUrl}${wpConfig.endpoints.projects}?_embed&slug=${encodeURIComponent(slug)}`
            const response = await fetch(url)
            if (!response.ok) throw new Error(`HTTP ${response.status}`)
            const data = await response.json()
            return data[0] || null
        } catch (err) {
            error.value = err.message
            return null
        } finally {
            loading.value = false
        }
    }

    return { loading, error, fetchPosts, fetchPost, fetchProjects, fetchProject }
}
