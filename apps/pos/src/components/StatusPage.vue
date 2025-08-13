<template>
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div class="max-w-2xl mx-auto text-center">
            <!-- Main Headline -->
            <div class="mb-8">
                <h1 class="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
                    POS System is in Development
                </h1>
                <div class="w-24 h-1 bg-indigo-500 mx-auto mb-6"></div>
            </div>

            <!-- Subtext -->
            <p class="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
                Please check the backend progress at our GitHub repository.
            </p>

            <!-- Call to Action Button -->
            <a href="https://github.com/anhilmy/website-backend/pull/2" target="_blank" rel="noopener noreferrer"
                class="inline-flex items-center px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-300"
                aria-label="View Backend Progress on GitHub (opens in new tab)">
                <svg class="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd"
                        d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                        clip-rule="evenodd"></path>
                </svg>
                View Backend Progress
                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
            </a>

            <!-- Additional Information -->
            <div class="mt-12 text-sm text-gray-500">
                <p>Development Status: In Progress</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const currentDate = ref('')

onMounted(() => {
    const now = new Date()
    currentDate.value = now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
})
</script>

<style scoped>
/* Additional custom styles if needed */
.hover\:scale-105:hover {
    transform: scale(1.05);
}
</style>
