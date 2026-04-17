<script setup>
const skills = [
    'Go', 'Python', 'JavaScript', 'Vue.js', 'SQL',
    'ERPNext', 'Kafka', 'gRPC', 'Docker', 'Kubernetes',
    'Nginx', 'Redis', 'Git',
]
</script>

<template>
    <section class="py-8 border-t border-sand-200">
        <h2 class="font-heading text-xl font-semibold text-bark-900 mb-5">Skills &amp; Tech Stack</h2>
        <div class="flex flex-wrap gap-2">
            <span v-for="skill in skills" :key="skill"
                class="font-body text-sm px-3 py-1 rounded-full bg-sand-100 text-bark-800 border border-sand-200">
                {{ skill }}
            </span>
        </div>
    </section>
</template>
