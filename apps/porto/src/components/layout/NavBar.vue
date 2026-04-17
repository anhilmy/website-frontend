<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
    <nav class="sticky top-0 z-50 bg-[#fffaf5] border-b border-sand-200">
        <div class="max-w-content mx-auto px-6 h-14 flex items-center justify-between">
            <RouterLink to="/"
                class="font-heading text-lg font-semibold text-bark-900 hover:text-clay-500 transition-colors duration-200 no-underline">
                Hilmy
            </RouterLink>
            <div class="flex items-center gap-6">
                <RouterLink to="/blog"
                    class="text-sm font-body text-bark-800 hover:text-clay-500 transition-colors duration-200 no-underline">
                    Blog
                </RouterLink>
                <RouterLink to="/projects"
                    class="text-sm font-body text-bark-800 hover:text-clay-500 transition-colors duration-200 no-underline">
                    Projects
                </RouterLink>
            </div>
        </div>
    </nav>
</template>
