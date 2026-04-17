<script setup>
import { ref, onMounted } from 'vue'
import ProjectCard from '@/components/projects/ProjectCard.vue'
import { useWordPress } from '@/composables/useWordPress.js'

const { loading, error, fetchProjects } = useWordPress()
const projects = ref([])

onMounted(async () => {
    projects.value = await fetchProjects()
})
</script>

<template>
    <div>
        <header class="py-8 border-b border-sand-200 mb-8">
            <h1 class="font-heading text-3xl font-semibold text-bark-900">Projects</h1>
        </header>

        <!-- Loading -->
        <div v-if="loading" class="py-16 text-center font-body text-bark-800">
            Loading projects…
        </div>

        <!-- Error -->
        <div v-else-if="error" class="py-12 text-center font-body text-bark-800">
            <p>Could not load projects. Please try again later.</p>
        </div>

        <!-- Empty -->
        <div v-else-if="projects.length === 0" class="py-12 text-center font-body text-bark-800">
            <p>No projects yet.</p>
        </div>

        <!-- Project list -->
        <div v-else class="space-y-6">
            <ProjectCard v-for="project in projects" :key="project.id" :project="project" />
        </div>
    </div>
</template>
