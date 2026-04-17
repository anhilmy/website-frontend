<script setup>
import { ref, onMounted } from 'vue'
import BlogCard from '@/components/blog/BlogCard.vue'
import { useWordPress } from '@/composables/useWordPress.js'

const { loading, error, fetchPosts } = useWordPress()

const posts = ref([])
const currentPage = ref(1)
const totalPages = ref(1)

async function loadPage(page) {
    const result = await fetchPosts(page)
    posts.value = result.posts
    totalPages.value = result.totalPages
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => loadPage(1))
</script>

<template>
    <div>
        <header class="py-8 border-b border-sand-200 mb-2">
            <h1 class="font-heading text-3xl font-semibold text-bark-900">Blog</h1>
        </header>

        <!-- Loading -->
        <div v-if="loading" class="py-16 text-center font-body text-bark-800">
            Loading posts…
        </div>

        <!-- Error -->
        <div v-else-if="error" class="py-12 text-center font-body text-bark-800">
            <p>Could not load posts. Please try again later.</p>
        </div>

        <!-- Empty -->
        <div v-else-if="posts.length === 0" class="py-12 text-center font-body text-bark-800">
            <p>No posts yet.</p>
        </div>

        <!-- Post list -->
        <div v-else>
            <BlogCard v-for="post in posts" :key="post.id" :post="post" />

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="flex items-center justify-between mt-8 font-body text-sm">
                <button :disabled="currentPage <= 1" @click="loadPage(currentPage - 1)"
                    class="px-4 py-2 rounded-md border border-sand-200 text-bark-800 hover:border-clay-500 hover:text-clay-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200">
                    ← Previous
                </button>
                <span class="text-bark-800">{{ currentPage }} / {{ totalPages }}</span>
                <button :disabled="currentPage >= totalPages" @click="loadPage(currentPage + 1)"
                    class="px-4 py-2 rounded-md border border-sand-200 text-bark-800 hover:border-clay-500 hover:text-clay-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200">
                    Next →
                </button>
            </div>
        </div>
    </div>
</template>
