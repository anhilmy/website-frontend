<script setup>
</script>

<template>
  <div class="header mb-5">
    Hello, this is me, Hilmy!
  </div>
  <div class="flex gap-5 intro">
    <img class="profile" src="/img/profile_image.png" />
    <div>
      Hi, I'm Ahmad Naufal Hilmy—though most people just call me Hilmy. I'm a software engineer that have passion on
      exploring new ideas and creating impactful solutions. I love uncovering the best ways to solve problems, combining
      innovation with efficiency to deliver meaningful results. Let’s build something extraordinary together!
    </div>
  </div>

  <div class="mt-4">
    My project experience is
    <ul class="my-2">
      <li>
        <div>
          --- <span class="project-title">Mobile Banking Backend Microservices</span> using Go and Kafka
        </div>
        <div class="project-subtitle">
          <ul>
            <li>Developed a middleware logging API proactively, reducing required maintance effort from 4 person job to
              1 person job</li>
          </ul>
        </div>

      </li>
      <li>
        --- <span class="project-title">Mobile Banking Admin Panel</span> using Vue.js
      </li>
      <li>
        <div>
          --- <span class="project-title">ERPNext Customization</span> with Python and Javascript
        </div>
        <div class="project-subtitle">
          <ul>
            <li>Handles project from users request, requirement document, development, user manual, and user support by
              oneself</li>
          </ul>
        </div>

      </li>
      <li>
        --- <span class="project-title">this website!</span> (I am using RaspberryPi as server and Cloudflare Tunneling
        to
        open public IP)
      </li>
    </ul>
    as I am currently work as a IT consultant, some of there projects are client's so I cannot get a measurement of
    result from direct users.
  </div>

</template>


<style scoped>
.project-title {
  font-weight: 500;
}

.header {
  font-family: Georgia, 'Times New Roman', Times, serif;
  font-size: xx-large;
}

.profile {
  min-width: 45px;
  min-height: 45px;
}

.intro {
  align-items: center;
}

ul ul {
  list-style-type: circle;
  padding-left: 2.5rem;
  margin-bottom: 0.5rem;
}
</style>