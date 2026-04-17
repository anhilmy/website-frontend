<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import DOMPurify from 'dompurify'
import { useWordPress } from '@/composables/useWordPress.js'
import { useReadingTime } from '@/composables/useReadingTime.js'

const route = useRoute()
const { loading, error, fetchPost } = useWordPress()
const { calculate } = useReadingTime()

const post = ref(null)

const featuredImage = computed(() => {
    return post.value?._embedded?.['wp:featuredmedia']?.[0]?.source_url || null
})

const sanitizedContent = computed(() => {
    if (!post.value?.content?.rendered) return ''
    return DOMPurify.sanitize(post.value.content.rendered)
})

const readingTime = computed(() => calculate(post.value?.content?.rendered))

const formattedDate = computed(() => {
    if (!post.value?.date) return ''
    return new Date(post.value.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
})

async function loadPost(slug) {
    post.value = await fetchPost(slug)
}

onMounted(() => loadPost(route.params.slug))
watch(() => route.params.slug, (slug) => loadPost(slug))
</script>

<template>
    <div>
        <!-- Back link -->
        <RouterLink to="/blog"
            class="inline-block font-body text-sm text-clay-500 hover:text-clay-600 transition-colors duration-200 no-underline mb-8">
            ← Back to blog
        </RouterLink>

        <!-- Loading -->
        <div v-if="loading" class="py-16 text-center font-body text-bark-800">
            Loading…
        </div>

        <!-- Error -->
        <div v-else-if="error" class="py-12 font-body text-bark-800">
            <p>Could not load this post. Please try again later.</p>
        </div>

        <!-- Not found -->
        <div v-else-if="!loading && !post" class="py-12 font-body text-bark-800">
            <p>Post not found.</p>
        </div>

        <!-- Post content -->
        <article v-else-if="post">
            <header class="mb-8">
                <h1 class="font-heading text-3xl sm:text-4xl font-semibold text-bark-900 mb-3 leading-tight"
                    v-html="post.title?.rendered"></h1>
                <p class="font-body text-sm text-bark-800">
                    {{ formattedDate }}
                    <span v-if="readingTime > 0"> · {{ readingTime }} min read</span>
                </p>
            </header>

            <!-- Featured image -->
            <img v-if="featuredImage" :src="featuredImage" :alt="post.title?.rendered"
                class="w-full rounded-lg mb-8 object-cover max-h-72" />

            <!-- Post body -->
            <div class="prose-content font-body text-bark-900 leading-relaxed" v-html="sanitizedContent"></div>
        </article>
    </div>
</template>

<style scoped>
.prose-content :deep(h1),
.prose-content :deep(h2),
.prose-content :deep(h3),
.prose-content :deep(h4) {
    font-family: Lora, Georgia, 'Playfair Display', serif;
    font-weight: 600;
    color: #4a3728;
    margin-top: 1.75rem;
    margin-bottom: 0.75rem;
    line-height: 1.3;
}

.prose-content :deep(h1) {
    font-size: 1.75rem;
}

.prose-content :deep(h2) {
    font-size: 1.4rem;
}

.prose-content :deep(h3) {
    font-size: 1.15rem;
}

.prose-content :deep(p) {
    margin-bottom: 1rem;
}

.prose-content :deep(a) {
    color: #b07d56;
    text-decoration: underline;
    text-underline-offset: 2px;
}

.prose-content :deep(a:hover) {
    color: #96643e;
}

.prose-content :deep(ul),
.prose-content :deep(ol) {
    margin-left: 1.5rem;
    margin-bottom: 1rem;
}

.prose-content :deep(li) {
    margin-bottom: 0.25rem;
}

.prose-content :deep(blockquote) {
    border-left: 3px solid #e6d5c3;
    padding-left: 1rem;
    color: #4a3728;
    font-style: italic;
    margin: 1.25rem 0;
}

.prose-content :deep(pre) {
    background: #f5ebe0;
    border: 1px solid #e6d5c3;
    border-radius: 0.375rem;
    padding: 1rem;
    overflow-x: auto;
    margin-bottom: 1rem;
    font-size: 0.875rem;
}

.prose-content :deep(code) {
    background: #f5ebe0;
    border-radius: 0.2rem;
    padding: 0.1em 0.35em;
    font-size: 0.875em;
}

.prose-content :deep(pre code) {
    background: none;
    padding: 0;
}

.prose-content :deep(img) {
    max-width: 100%;
    border-radius: 0.375rem;
    margin: 1.25rem 0;
}

.prose-content :deep(hr) {
    border: none;
    border-top: 1px solid #e6d5c3;
    margin: 2rem 0;
}
</style>
