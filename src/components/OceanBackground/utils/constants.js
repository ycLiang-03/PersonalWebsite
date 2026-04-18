import * as THREE from 'three'

export const CAMERA_CONFIG = {
  FOV: 70,
  NEAR: 1,
  FAR: 4000,
  INITIAL_POSITION: new THREE.Vector3(0, 150, 250),
  LOOK_UP_OFFSET: 200
}

export const OCEAN_CONFIG = {
  GEOMETRY: {
    WIDTH: 3000,
    HEIGHT: 3000,
    SEGMENTS: 128
  },
  WAVES: {
    COUNT: 12,
    DIRECTIONS: [
      [1, 0.2], [-0.9, 0.2], [0.1, 0.95], [-0.5, -0.6],
      [0.2, 1], [-0.7, 0.1], [0.4, -0.4], [-0.3, 0.9],
      [0.8, -0.2], [-0.2, 0.7], [0.6, -0.3], [-0.6, -0.5]
    ]
  },
  COLORS: {
    SHALLOW: new THREE.Color(0.15, 0.55, 0.65),
    DEEP: new THREE.Color(0.02, 0.12, 0.25),
    WATER_BODY: new THREE.Color(0.01, 0.08, 0.18),
    SUN: new THREE.Color(1.0, 0.95, 0.8)
  }
}

export const LIGHT_CONFIG = {
  POSITION: new THREE.Vector3(1000, 1500, 1000),
  CONE: {
    TOP_RADIUS: 2000,
    HEIGHT: 1000,
    RADIAL_SEGMENTS: 32,
    HEIGHT_SEGMENTS: 1,
    OPENENDED: true
  },
  SHADER: {
    VERTICAL_FADE_START: -800,
    VERTICAL_FADE_END: 0,
    TIME_SCALE: 0.2,
    NOISE_SCALE: 0.01,
    BEAM_FREQUENCY: 0.02,
    PARTICLE_SCALE: 0.08
  }
}

export const CLOUD_CONFIG = {
  GEOMETRY: {
    WIDTH: 5000,
    HEIGHT: 2500
  },
  POSITION: new THREE.Vector3(0, 1500, -2000),
  ROTATION_X: 1.2,
  SHADER: {
    UV_SCALE: 2.5,
    UV_DETAIL_SCALE: 10.0,
    TIME_SCALE: 0.005,
    TIME_DETAIL_SCALE: 0.002,
    MASK_START: 0.0,
    MASK_END: -150
  }
}

export const ANIMATION_CONFIG = {
  SCROLL_SENSITIVITY: 0.3,
  ROTATION_SMOOTHING: 0.05,
  MOUSE_SENSITIVITY: 0.17
}

export const FOG_CONFIG = {
  DENSITY_BASE: 0.001,
  DENSITY_UNDERWATER: 0.008,
  FOG_COLOR_BASE: new THREE.Color(0.01, 0.08, 0.18),
  FOG_COLOR_DEEP: new THREE.Color(0.02, 0.05, 0.12)
}

export const MASK_CONFIG = {
  START: 0,
  END: -150
}

export const UNDERWATER_MASK_CONFIG = {
  START: 0,
  END: -150
}
