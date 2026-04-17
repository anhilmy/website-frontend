<script setup>
import { ref, onMounted } from 'vue'

const greetings = [
    "Hi, I'm Hilmy.",
    "Halo, saya Hilmy.",
    "Hey there, I'm Hilmy.",
    "Yo! I'm Hilmy.",
    "Welcome — I'm Hilmy.",
    "Salam, saya Hilmy.",
    "G'day, I'm Hilmy.",
    "Howdy, I'm Hilmy.",
    "Bonjour, je suis Hilmy.",
    "こんにちは、Hilmy です。",
]

const greeting = greetings[Math.floor(Math.random() * greetings.length)]
const visible = ref(false)
const imgError = ref(false)

onMounted(() => {
    visible.value = true
})
</script>

<template>
    <section class="py-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
        <div class="transition-opacity duration-[600ms]" :class="visible ? 'opacity-100' : 'opacity-0'">
            <h1 class="font-heading text-3xl sm:text-4xl font-semibold text-bark-900 mb-3">
                {{ greeting }}
            </h1>
            <p class="font-body text-lg text-bark-800 max-w-sm leading-relaxed italic">
                A software engineer who builds things that work — from microservices to the teams behind them.
            </p>
        </div>

        <div class="flex-shrink-0">
            <div
                class="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-sand-200 border-2 border-sand-200 overflow-hidden flex items-center justify-center">
                <img v-if="!imgError" src="@/assets/profile_image.jpg" alt="Ahmad Naufal Hilmy"
                    class="w-full h-full object-cover" @error="imgError = true" />
                <span v-else class="font-heading text-4xl font-semibold text-bark-800">H</span>
            </div>
        </div>
    </section>
</template>
