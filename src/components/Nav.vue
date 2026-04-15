<script setup>
import { computed } from 'vue'

const props = defineProps({
  activeSection: {
    type: String,
    required: true
  },
  sections: {
    type: Array,
    required: true
  }
})

// Navigation logic to handle clicks
const scrollToSection = (section) => {
  const element = document.getElementById(section.toLowerCase())
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<template>
  <nav class="fixed top-0 left-0 w-full z-50 transition-all duration-300">
    <div class="bg-black/20 backdrop-blur-md border-b border-white/10 px-8 py-4 flex items-center justify-center space-x-8">
      <button 
        v-for="section in sections" 
        :key="section"
        @click="scrollToSection(section)"
        class="relative px-3 py-1 text-sm font-medium transition-all duration-300 hover:text-red-500 focus:outline-none"
        :class="activeSection === section ? 'text-red-500' : 'text-gray-300 hover:text-white'"
      >
        {{ section }}
        <span 
          v-if="activeSection === section" 
          class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-red-500 rounded-full shared-element"
        ></span>
      </button>
    </div>
  </nav>
</template>

<style scoped>
/* Scoped styles if needed */
</style>
