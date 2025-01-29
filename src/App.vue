<script setup>
</script>

<template>
  <div class="container">
    <nav class="nav-wrapper">
      <ul class="nav">
        <li>
          <RouterLink :to="{ name: 'status' }">
            Status
          </RouterLink>
        </li>
        <li>
          <RouterLink :to="{ name: 'home' }">
            Home
          </RouterLink>
        </li>
        <li>
          <RouterLink :to="{ name: 'blog' }">
            Blog
          </RouterLink>
        </li>
        <li>
          <RouterLink :to="{ name: 'projects' }">
            Projects
          </RouterLink>
        </li>
      </ul>
      <hr>
    </nav>
    <div class="wrapper">
      <RouterView></RouterView>
    </div>

    <div class="footer-wrapper">
      <hr>
      <div class="flex flex-row justify-between">
        <div>
          You can contact me at:
        </div>
        <div>
          <span class="email"></span> hilmyahmadnaufal@gmail.com
        </div>
        <div>
          <span class="linkedin-icon"></span> linkedin.com/in/anhilmy
        </div>
      </div>
    </div>
  </div>

</template>

<style>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.footer-wrapper {
  margin: auto;
  bottom: 0;
  height: 20px;
  width: 100%;
  position: absolute;
  left: 0;
  bottom: 0;
}

.nav-wrapper {
  max-width: 70%;
  margin: auto;
  margin-top: 2rem;
}

ul.nav {
  list-style-type: none;
  gap: 4rem;
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  font-size: xx-large;
  text-align: center;
  margin-bottom: 1rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

.container {
  width: 100vw;
  min-height: 95%;
  position: relative;
}

.wrapper {
  max-width: 60%;
  margin: auto;
  padding-bottom: 10px;
}

html,
body {
  height: 100%;
  font-size: large;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 3rem;
  }

  .container {
    max-height: 80%;
    margin: auto;
  }
}
</style>
