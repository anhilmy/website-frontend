<script setup>
</script>

<template>
    <div class="container">
        <nav class="nav-wrapper">
            <ul class="nav">
                <li>
                    <RouterLink :to="{ name: 'home' }">
                        Home
                    </RouterLink>
                </li>
            </ul>
        </nav>
        <div class="wrapper">
            <RouterView></RouterView>
        </div>
    </div>
</template>

<style></style>
