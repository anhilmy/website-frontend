<template>
    <div class="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center px-4">
        <div class="max-w-2xl mx-auto text-center">
            <!-- 404 Number -->
            <div class="mb-8">
                <h1 class="text-8xl md:text-9xl font-bold text-gray-300 mb-4">
                    404
                </h1>
                <div class="w-24 h-1 bg-red-500 mx-auto mb-6"></div>
            </div>

            <!-- Main Message -->
            <h2 class="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Page Not Found
            </h2>

            <!-- Subtext -->
            <p class="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
                The page you're looking for doesn't exist in our POS system.
            </p>

            <!-- Navigation Buttons -->
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <!-- Go Home Button -->
                <router-link to="/"
                    class="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6">
                        </path>
                    </svg>
                    Go Home
                </router-link>

                <!-- Go Back Button -->
                <button @click="goBack"
                    class="inline-flex items-center px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-300">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                    Go Back
                </button>
            </div>

            <!-- Additional Information -->
            <div class="mt-12 p-6 bg-white/50 rounded-lg backdrop-blur-sm">
                <h3 class="text-lg font-semibold text-gray-700 mb-2">Lost?</h3>
                <p class="text-gray-600">
                    Our POS system is currently under development. Check our
                    <a href="https://github.com/anhilmy/website-backend" target="_blank" rel="noopener noreferrer"
                        class="text-blue-600 hover:text-blue-800 underline">
                        backend progress
                    </a>
                    for updates.
                </p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
    if (window.history.length > 1) {
        router.go(-1)
    } else {
        router.push('/')
    }
}
</script>

<style scoped>
/* Additional custom styles if needed */
.hover\:scale-105:hover {
    transform: scale(1.05);
}
</style>
