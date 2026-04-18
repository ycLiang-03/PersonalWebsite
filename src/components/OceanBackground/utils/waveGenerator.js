import * as THREE from 'three'
import { OCEAN_CONFIG } from './constants'

export function generateWaves() {
  const { COUNT, DIRECTIONS } = OCEAN_CONFIG.WAVES
  const waves = []

  for (let i = 0; i < COUNT; i++) {
    let length, amplitude, speed

    if (i < 3) {
      length = 350 + Math.random() * 200
      amplitude = 12.0 + Math.random() * 5.0
      speed = 1.0 + Math.random() * 0.3
    } else if (i < 6) {
      length = 120 + Math.random() * 60
      amplitude = 4.0 + Math.random() * 2.0
      speed = 1.8 + Math.random() * 1.2
    } else {
      length = 40 + Math.random() * 20
      amplitude = 0.3 + Math.random() * 0.2
      speed = 1.8 + Math.random() * 1.2
    }

    waves.push({
      length,
      amplitude,
      speed,
      direction: new THREE.Vector2(...DIRECTIONS[i])
    })
  }

  return waves
}

export function createOceanUniforms(waves, camera) {
  return {
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uWaves: { value: waves },
    uLightPos: { value: OCEAN_CONFIG.COLORS.SUN.clone() },
    uCameraPos: { value: camera.position }
  }
}
