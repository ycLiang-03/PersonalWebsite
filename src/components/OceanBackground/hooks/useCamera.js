import * as THREE from 'three'
import { CAMERA_CONFIG, ANIMATION_CONFIG } from '../utils/constants'

export function useCamera(camera, lightMesh) {
  const state = {
    currentRotationY: 0,
    targetRotationY: 0,
    mouseX: 0,
    scrollY: 0
  }

  function handleMouseMove(event) {
    state.mouseX = (event.clientX / window.innerWidth) * 2 - 1
    state.targetRotationY = -state.mouseX * ANIMATION_CONFIG.MOUSE_SENSITIVITY
  }

  function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
  }

  function update(deltaTime = 0.016) {
    state.currentRotationY += (state.targetRotationY - state.currentRotationY) * ANIMATION_CONFIG.ROTATION_SMOOTHING

    camera.position.y = CAMERA_CONFIG.INITIAL_POSITION.y - state.scrollY * ANIMATION_CONFIG.SCROLL_SENSITIVITY

    camera.rotation.set(0, 0, 0)

    camera.lookAt(
      new THREE.Vector3(
        Math.sin(state.currentRotationY) * 1000,
        camera.position.y + CAMERA_CONFIG.LOOK_UP_OFFSET,
        -1000
      )
    )

    if (lightMesh) {
      lightMesh.position.x = camera.position.x
      lightMesh.position.z = camera.position.z
    }
  }

  function setScrollY(scrollY) {
    state.scrollY = scrollY
  }

  function isUnderwater() {
    return camera.position.y < 0
  }

  return {
    state,
    handleMouseMove,
    handleResize,
    update,
    setScrollY,
    isUnderwater
  }
}
