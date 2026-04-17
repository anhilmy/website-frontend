<script setup>
import NavBar from './NavBar.vue'
import FooterBar from './FooterBar.vue'
</script>

<template>
    <div class="min-h-screen bg-sand-50 font-body text-bark-900">
        <NavBar />
        <main class="max-w-content mx-auto px-6 py-10">
            <RouterView />
        </main>
        <FooterBar />
    </div>
</template>
