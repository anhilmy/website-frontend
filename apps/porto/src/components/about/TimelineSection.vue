<script setup>
const timeline = [
    {
        period: 'Oct 2023 – Present',
        role: 'Software Engineer',
        org: 'Core Initiative Studio',
        description: 'Building microservices, leading teams, and shipping products for fintech and healthtech clients.',
    },
    {
        period: 'Jan – Jul 2023',
        role: 'Internal Auditor',
        org: 'PT. Pupuk Indonesia (Persero)',
        description: 'Data analysis, fraud detection, and built an audit monitoring MVP.',
    },
    {
        period: 'Jul – Dec 2022',
        role: 'Software Engineer',
        org: 'PT. Ecomindo Saranacipta',
        description: 'Archive management system for KSEI using .NET and Blazor.',
    },
    {
        period: 'Jun 2017 – Feb 2022',
        role: 'B.S. Computer Science',
        org: 'Universitas Indonesia',
        description: '',
    },
]
</script>

<template>
    <section class="py-8 border-t border-sand-200">
        <h2 class="font-heading text-xl font-semibold text-bark-900 mb-6">Experience</h2>
        <ol class="relative border-l border-sand-200 ml-2 space-y-8">
            <li v-for="(entry, index) in timeline" :key="index" class="ml-6">
                <span
                    class="absolute -left-[7px] flex items-center justify-center w-3.5 h-3.5 rounded-full bg-clay-500 ring-4 ring-sand-50"></span>
                <p class="font-body text-xs text-bark-800 mb-0.5">{{ entry.period }}</p>
                <h3 class="font-heading text-base font-semibold text-bark-900 leading-tight">
                    {{ entry.role }}
                    <span class="font-body font-normal text-clay-500"> — {{ entry.org }}</span>
                </h3>
                <p v-if="entry.description" class="font-body text-sm text-bark-800 mt-1 leading-relaxed">
                    {{ entry.description }}
                </p>
            </li>
        </ol>
    </section>
</template>
