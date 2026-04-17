<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
    <footer class="border-t border-sand-200 mt-16 py-8">
        <div
            class="max-w-content mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-bark-800 font-body">
            <span>© 2026 Ahmad Naufal Hilmy</span>
            <div class="flex items-center gap-5">
                <a href="https://github.com/anhilmy" target="_blank" rel="noopener noreferrer"
                    class="hover:text-clay-500 transition-colors duration-200 no-underline">GitHub</a>
                <a href="https://linkedin.com/in/anhilmy" target="_blank" rel="noopener noreferrer"
                    class="hover:text-clay-500 transition-colors duration-200 no-underline">LinkedIn</a>
                <a href="mailto:hilmyahmadnaufal@gmail.com"
                    class="hover:text-clay-500 transition-colors duration-200 no-underline">Email</a>
                <RouterLink to="/uses" class="hover:text-clay-500 transition-colors duration-200 no-underline">Uses
                </RouterLink>
            </div>
        </div>
    </footer>
</template>
