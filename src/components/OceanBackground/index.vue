<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useThreeScene } from './hooks/useThreeScene'
import { useCamera } from './hooks/useCamera'
import { useEventHandlers } from './hooks/useEventHandlers'

const container = ref(null)

let sceneController = null
let cameraController = null
let eventHandlers = null
let animationId = null
let scrollY = 0

const animate = () => {
  if (!sceneController) return

  animationId = requestAnimationFrame(animate)

  const time = sceneController.state.clock.getElapsedTime()

  sceneController.updateUniforms(time, scrollY)

  cameraController.update()
  cameraController.setScrollY(scrollY)

  sceneController.render()
}

onMounted(() => {
  sceneController = useThreeScene(container)
  sceneController.init()

  cameraController = useCamera(
    sceneController.state.camera,
    sceneController.state.meshes.light
  )

  eventHandlers = useEventHandlers({
    onScroll: (y) => { scrollY = y },
    onResize: () => { cameraController.handleResize() },
    onMouseMove: (e) => { cameraController.handleMouseMove(e) }
  })

  eventHandlers.addEventListeners()

  animate()
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }

  if (eventHandlers) {
    eventHandlers.removeEventListeners()
  }

  if (sceneController) {
    sceneController.dispose()
  }
})
</script>

<template>
  <div ref="container" class="ocean-container"></div>
</template>

<style scoped>
.ocean-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  background: #051020;
  pointer-events: none;
}
</style>
