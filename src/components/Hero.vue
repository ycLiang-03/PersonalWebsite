<script setup>
import { ref, onMounted, computed, watch } from 'vue'

const roles = ['AI Product Manager', 'Full-Stack Developer']
const currentRoleIndex = ref(0)
const roleText = computed(() => roles[currentRoleIndex.value])
const isAnimating = ref(true)

const switchRole = () => {
  isAnimating.value = false
  setTimeout(() => {
    currentRoleIndex.value = (currentRoleIndex.value + 1) % roles.length
    isAnimating.value = true
  }, 500) // Small pause before starting next role
}

onMounted(() => {
  setInterval(() => {
    switchRole()
  }, 4000) // Switch role every 4 seconds
})

const scrollToContact = () => {
  const contactSection = document.getElementById('contact')
  if (contactSection) {
    contactSection.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<template>
  <div class="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 px-10 md:px-16 lg:px-24">
    <div class="max-w-[1500px] w-full grid grid-cols-1 md:grid-cols-[1.25fr_0.75fr] gap-8 lg:gap-16 items-center">
      <!-- Left side: Text and Buttons -->
      <div class="flex flex-col space-y-6">
        <div class="space-y-2">
          <h1 class="text-4xl md:text-6xl font-bold text-white tracking-tight fade-in-up">
            Hi, I'm <span class="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Allison Liang,</span>
          </h1>
          
          <div class="h-16 md:h-24 flex items-center overflow-visible relative mb-4 z-10">
            <span class="text-3xl md:text-5xl font-extrabold text-white mr-4 fade-in-up">a</span>
            <div class="flex-1 relative h-full flex items-center">
              <!-- Static Thick Underline Indicator -->
              <div class="absolute bottom-[10px] left-0 w-[530px] h-[3px] bg-red-500/40"></div>
              
              <div class="flex flex-wrap relative overflow-visible" v-if="isAnimating">
                <span 
                  v-for="(char, index) in roleText.split('')" 
                  :key="`${currentRoleIndex}-${index}`"
                  class="inline-block text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 role-char leading-tight py-2"
                  :style="{ 
                    animationDelay: `${index * 25}ms`,
                    backgroundSize: `${roleText.length * 0.75}em 100%`,
                    backgroundPosition: `${-index * 0.75}em 0`,
                    backgroundAttachment: 'local'
                  }"
                >
                  {{ char === ' ' ? '\u00A0' : char }}
                </span>
                <!-- Added Period at the end of the sentence -->
                <span 
                  class="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 role-char py-2"
                  :style="{ 
                    animationDelay: `${roleText.length * 25}ms`,
                    backgroundSize: `${roleText.length * 0.75}em 100%`,
                    backgroundPosition: `${-roleText.length * 0.75}em 0`,
                    backgroundAttachment: 'local'
                  }"
                >.</span>
              </div>
            </div>
          </div>
        </div>

        <p class="text-lg text-gray-300 max-w-lg leading-relaxed fade-in-up delay-100 hover-jitter transition-colors hover:text-white cursor-default">
          Passionate about building AI-driven products and modern web experiences. 
          Bridging the gap between product strategy and technical implementation.
        </p>

        <div class="flex flex-row flex-nowrap items-center gap-4 md:gap-6 pt-4 fade-in-up delay-200 overflow-visible">
          <a 
            href="#" 
            download
            class="group flex items-center gap-2 px-6 md:px-8 py-3 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-full font-medium shadow-xl hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-300 hover:scale-105 active:scale-95 whitespace-nowrap"
          >
            <span>Download Resume</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 group-hover:translate-y-0.5 transition-transform">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M7.5 12 12 16.5m0 0L16.5 12M12 16.5V3" />
            </svg>
          </a>
          <a 
            href="#" 
            target="_blank"
            class="group flex items-center gap-2 px-6 md:px-8 py-3 bg-white/5 backdrop-blur-sm border border-white/10 text-gray-300 rounded-full font-medium shadow-md hover:border-orange-500 hover:text-orange-400 transition-all duration-300 hover:scale-105 active:scale-95 whitespace-nowrap"
          >
            <span>Preview Resume</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>
          <button 
            @click="scrollToContact"
            class="group flex items-center gap-2 px-6 md:px-8 py-3 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-full font-medium shadow-lg hover:shadow-red-500/20 transition-all duration-300 hover:scale-105 active:scale-95 whitespace-nowrap"
          >
            <span>Contact Me</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 group-hover:rotate-12 transition-transform">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Right side: Profile Image -->
      <div class="relative flex justify-center md:justify-end items-center fade-in-up delay-300">
        <div class="relative w-56 h-56 md:w-[360px] md:h-[360px] group transition-transform duration-700 hover:scale-105">
          <!-- White base layer to improve color blending -->
          <div class="absolute -inset-4 rounded-full bg-white/30 blur-xl"></div>
          <!-- Rotating gradient glow behind image -->
          <div class="absolute -inset-4 rounded-full bg-gradient-to-r from-orange-400 via-yellow-500 to-orange-600 animate-spin-slow blur-2xl opacity-60" style="animation-duration: 8s;"></div>
          <!-- Avatar image -->
          <div class="relative w-full h-full rounded-full overflow-hidden shadow-2xl z-10 border-4 border-white/50">
            <img 
              src="/avatar.jpg" 
              alt="Allison Liang" 
              class="w-full h-full object-cover opacity-100"
            />
          </div>
        </div>
        
        <!-- Decorative elements for parallax/visual interest -->
        <div class="absolute -top-10 -right-10 w-24 h-24 bg-red-200 rounded-full blur-3xl opacity-60 animate-pulse"></div>
        <div class="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-200 rounded-full blur-3xl opacity-60 animate-pulse"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-in-up {
  opacity: 0;
  animation: fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.role-char {
  opacity: 0;
  filter: blur(10px);
  transform: translateY(30px);
  animation: roleCharIn 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

@keyframes roleCharIn {
  0% {
    opacity: 0;
    filter: blur(10px);
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    filter: blur(0);
    transform: translateY(0);
  }
}

.delay-100 { animation-delay: 100ms; }
.delay-200 { animation-delay: 200ms; }
.delay-300 { animation-delay: 300ms; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-spin-slow {
  animation: spinSlow 8s linear infinite;
}

@keyframes spinSlow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
