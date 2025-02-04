<script setup>
import Image from 'primevue/image';
import profile_image from '@/assets/profile_image.jpg'
</script>

<template>
  <div class="header mb-5">
    Hello, this is me, Hilmy!
  </div>
  <div class="flex gap-5 intro">
    <Image class="profile mx-3" :src="profile_image" width="500" />
    <div class="justify">
      Hi, I'm Ahmad Naufal Hilmy—though most people just call me Hilmy. I'm a software engineer that have passion on
      exploring new ideas and creating impactful solutions. I love uncovering the best ways to solve problems, combining
      innovation with efficiency to deliver meaningful results. Let’s build something extraordinary together!
    </div>
  </div>

  <div class="mt-4">
    My project experience is
    <ul class="my-1">
      <li>
        <div>
          --- <span class="text-bold">Mobile Banking Backend Microservices</span> using Go and Kafka
        </div>
        <div class="project-subtitle justify">
          <ul>
            <li>Proactively create a logger middleware API request reducing maintenance effort from 4 4 person to 1
              person</li>
          </ul>
        </div>

      </li>
      <li>
        --- <span class="text-bold">Mobile Banking Admin Panel</span> using Vue.js
      </li>
      <li>
        <div>
          --- <span class="text-bold">ERPNext Customization</span> with Python and Javascript
        </div>
        <div class="project-subtitle  justify">
          <ul>
            <li>Handles ERP Project as a solo developer, handling analysis phase, requirement documents, development,
              testing, deployment, and technical support on request.</li>
          </ul>
        </div>

      </li>
      <li>
        --- <span class="text-bold">this website!</span> (this is a RaspberryPi with a Cloudflare Tunneling
        to open public IP)
      </li>
    </ul>
    as I am currently work as a IT consultant, some of there projects are client's so I cannot get a measurement of
    result from direct users. But I can assure you, that I always try the best for all best interest!

    <div class="mt-3">You can contact me at <span class="text-bold">hilmyahmadnaufal@gmail.com</span> or by my Linkedin
      <a class="text-bold no-deco" href="https://linkedin.com/in/anhilmy">linkedin.com/in/anhilmy</a>
    </div>
  </div>

</template>


<style scoped>
a.no-deco {
  text-decoration: none;
}

.text-bold {
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

.justify {
  text-align: justify;
}
</style>