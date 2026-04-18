<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Nav from './components/Nav.vue'
import Hero from './components/Hero.vue'
import OceanBackground from './components/OceanBackground/index.vue'

const sections = ref(['Home', 'About', 'Contact'])
const activeSection = ref('Home')

const handleScroll = () => {
  const scrollPosition = window.scrollY + window.innerHeight / 2
  const sectionElements = document.querySelectorAll('section')
  
  sectionElements.forEach((section) => {
    const top = section.offsetTop
    const height = section.offsetHeight
    const id = section.getAttribute('id')
    
    if (scrollPosition >= top && scrollPosition < top + height) {
      activeSection.value = id.charAt(0).toUpperCase() + id.slice(1)
    }
  })
}

// Scroll Transition Observer
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -100px 0px"
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible')
      }
    })
  }, observerOptions)

  document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el))
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="min-h-screen text-white">
    <OceanBackground />
    <Nav :activeSection="activeSection" :sections="sections" />
    
    <main>
      <section id="home">
        <Hero />
      </section>
      
      <!-- About Section - Extended to 2 window heights -->
      <section id="about" class="min-h-[200vh] flex flex-col items-center justify-start bg-transparent border-t border-white/5 pt-32">
        <div class="max-w-4xl px-8 text-center scroll-reveal fade-up mb-32">
          <h2 class="text-4xl md:text-5xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">About My Journey</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div class="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover-jitter transition-all hover:bg-white/10">
              <h3 class="text-xl font-bold mb-4 text-white">AI Product Manager</h3>
              <p class="text-gray-300 leading-relaxed">
                Expertise in aligning complex AI technologies with market needs, focusing on user-centric product strategies and technical feasibility.
              </p>
            </div>
            <div class="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover-jitter transition-all hover:bg-white/10">
              <h3 class="text-xl font-bold mb-4 text-white">Full-Stack Developer</h3>
              <p class="text-gray-300 leading-relaxed">
                Passionate about crafting seamless web experiences using modern frameworks and building robust backend architectures.
              </p>
            </div>
          </div>
        </div>
        
        <!-- Additional content to extend the section -->
        <div class="max-w-4xl px-8 text-center scroll-reveal fade-up mb-32">
          <h2 class="text-3xl md:text-4xl font-bold mb-8 text-white">My Philosophy</h2>
          <div class="p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
            <p class="text-gray-300 leading-relaxed text-lg">
              I believe in the power of technology to transform lives. Every line of code, every product decision, should ultimately serve to make the world a better place. Through AI and modern web technologies, we can create solutions that were once thought impossible.
            </p>
          </div>
        </div>
        
        <div class="max-w-4xl px-8 text-center scroll-reveal fade-up">
          <h2 class="text-3xl md:text-4xl font-bold mb-8 text-white">Skills & Technologies</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
              <p class="text-white font-medium">Vue.js</p>
            </div>
            <div class="p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
              <p class="text-white font-medium">React</p>
            </div>
            <div class="p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
              <p class="text-white font-medium">Node.js</p>
            </div>
            <div class="p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
              <p class="text-white font-medium">Python</p>
            </div>
            <div class="p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
              <p class="text-white font-medium">Three.js</p>
            </div>
            <div class="p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
              <p class="text-white font-medium">Machine Learning</p>
            </div>
            <div class="p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
              <p class="text-white font-medium">TypeScript</p>
            </div>
            <div class="p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
              <p class="text-white font-medium">AWS</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Contact Section -->
      <section id="contact" class="min-h-screen flex items-center justify-center bg-transparent border-t border-white/5">
        <div class="max-w-2xl px-8 text-center scroll-reveal fade-up">
          <h2 class="text-4xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Get In Touch</h2>
          <p class="text-gray-300 mb-10 text-lg">
            Whether you have a question or just want to say hi, I'll try my best to get back to you!
          </p>
          <div class="flex flex-wrap justify-center gap-6">
            <a href="mailto:hello@allison.com" class="px-10 py-4 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-full font-bold shadow-lg hover:shadow-red-500/20 transition-all hover:scale-105 active:scale-95">
              Email Me
            </a>
            <div class="flex items-center gap-4 text-gray-400">
              <a href="#" class="hover:text-red-500 transition-colors">LinkedIn</a>
              <span class="w-1 h-1 bg-gray-600 rounded-full"></span>
              <a href="#" class="hover:text-red-500 transition-colors">GitHub</a>
              <span class="w-1 h-1 bg-gray-600 rounded-full"></span>
              <a href="#" class="hover:text-red-500 transition-colors">Twitter</a>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style>
/* Global styles in main.css */
</style>
