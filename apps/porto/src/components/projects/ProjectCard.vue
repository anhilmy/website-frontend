<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
    project: {
        type: Object,
        required: true,
    },
})

const thumbnailUrl = computed(() => {
    return props.project._embedded?.['wp:featuredmedia']?.[0]?.source_url || null
})

const excerpt = computed(() => {
    const raw = props.project.excerpt?.rendered || ''
    return raw.replace(/<[^>]+>/g, '').trim()
})
</script>

<template>
    <article
        class="bg-sand-100 border border-sand-200 rounded-lg overflow-hidden hover:border-clay-500 transition-colors duration-200">
        <!-- Desktop: horizontal; Mobile: vertical -->
        <RouterLink :to="`/projects/${project.slug}`" class="no-underline flex flex-col sm:flex-row">
            <!-- Thumbnail -->
            <div class="sm:w-40 sm:flex-shrink-0 h-40 bg-sand-200 overflow-hidden">
                <img v-if="thumbnailUrl" :src="thumbnailUrl" :alt="project.title?.rendered"
                    class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center">
                    <span class="font-body text-xs text-bark-800 opacity-50">No image</span>
                </div>
            </div>
            <!-- Text -->
            <div class="flex flex-col justify-center p-5 gap-2">
                <h2
                    class="font-heading text-lg font-semibold text-bark-900 group-hover:text-clay-500 transition-colors duration-200">
                    {{ project.title?.rendered }}
                </h2>
                <p class="font-body text-sm text-bark-800 leading-relaxed line-clamp-2">
                    {{ excerpt }}
                </p>
                <span class="font-body text-sm text-clay-500 hover:text-clay-600 transition-colors duration-200 mt-1">
                    View Project →
                </span>
            </div>
        </RouterLink>
    </article>
</template>
