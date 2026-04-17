<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useReadingTime } from '@/composables/useReadingTime.js'

const props = defineProps({
    post: {
        type: Object,
        required: true,
    },
})

const { calculate } = useReadingTime()

const readingTime = computed(() => calculate(props.post.content?.rendered))

const formattedDate = computed(() => {
    if (!props.post.date) return ''
    return new Date(props.post.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
})

const excerpt = computed(() => {
    const raw = props.post.excerpt?.rendered || ''
    return raw.replace(/<[^>]+>/g, '').trim()
})
</script>

<template>
    <article class="py-6 border-b border-sand-200 last:border-b-0">
        <RouterLink :to="`/blog/${post.slug}`" class="no-underline group">
            <h2
                class="font-heading text-xl font-semibold text-bark-900 group-hover:text-clay-500 transition-colors duration-200 mb-1">
                {{ post.title?.rendered }}
            </h2>
        </RouterLink>
        <p class="font-body text-xs text-bark-800 mb-3">
            {{ formattedDate }}
            <span v-if="readingTime > 0"> · {{ readingTime }} min read</span>
        </p>
        <p class="font-body text-sm text-bark-900 leading-relaxed mb-3 line-clamp-3">
            {{ excerpt }}
        </p>
        <RouterLink :to="`/blog/${post.slug}`"
            class="font-body text-sm text-clay-500 hover:text-clay-600 transition-colors duration-200 no-underline">
            Read more →
        </RouterLink>
    </article>
</template>
