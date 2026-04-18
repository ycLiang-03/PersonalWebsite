import * as THREE from 'three'
import { CAMERA_CONFIG, OCEAN_CONFIG, CLOUD_CONFIG } from '../utils/constants'
import { generateWaves } from '../utils/waveGenerator'
import { oceanVertexShader, oceanFragmentShader } from '../shaders/ocean'
import { lightVertexShader, lightFragmentShader } from '../shaders/light'
import { cloudVertexShader, cloudFragmentShader } from '../shaders/cloud'

export function useThreeScene(container) {
  const state = {
    renderer: null,
    scene: null,
    camera: null,
    meshes: {
      ocean: null,
      cloud: null,
      light: null
    },
    clock: null
  }

  function initScene() {
    state.scene = new THREE.Scene()
    state.camera = new THREE.PerspectiveCamera(
      CAMERA_CONFIG.FOV,
      window.innerWidth / window.innerHeight,
      CAMERA_CONFIG.NEAR,
      CAMERA_CONFIG.FAR
    )
    state.camera.position.copy(CAMERA_CONFIG.INITIAL_POSITION)

    state.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    })
    state.renderer.setSize(window.innerWidth, window.innerHeight)
    state.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    container.value.appendChild(state.renderer.domElement)

    state.clock = new THREE.Clock()
  }

  function initOceanMesh() {
    const { GEOMETRY } = OCEAN_CONFIG
    const geometry = new THREE.PlaneGeometry(
      GEOMETRY.WIDTH,
      GEOMETRY.HEIGHT,
      GEOMETRY.SEGMENTS,
      GEOMETRY.SEGMENTS
    )
    geometry.rotateX(-Math.PI / 2)

    const waves = generateWaves()

    const material = new THREE.ShaderMaterial({
      vertexShader: oceanVertexShader,
      fragmentShader: oceanFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uScroll: { value: 0 },
        uWaves: { value: waves },
        uLightPos: { value: new THREE.Vector3(1000, 1500, 1000) },
        uCameraPos: { value: state.camera.position }
      },
      side: THREE.DoubleSide
    })

    state.meshes.ocean = new THREE.Mesh(geometry, material)
    state.scene.add(state.meshes.ocean)
  }

  function initCloudMesh() {
    const { GEOMETRY, POSITION, ROTATION_X } = CLOUD_CONFIG
    const geometry = new THREE.PlaneGeometry(GEOMETRY.WIDTH, GEOMETRY.HEIGHT)

    const material = new THREE.ShaderMaterial({
      vertexShader: cloudVertexShader,
      fragmentShader: cloudFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uCameraPos: { value: state.camera.position }
      },
      transparent: true,
      depthWrite: false
    })

    state.meshes.cloud = new THREE.Mesh(geometry, material)
    state.meshes.cloud.position.copy(POSITION)
    state.meshes.cloud.rotation.x = ROTATION_X
    state.scene.add(state.meshes.cloud)
  }

  function initLightMesh() {
    const geometry = new THREE.CylinderGeometry(150, 150, 500, 32)

    const material = new THREE.ShaderMaterial({
      vertexShader: lightVertexShader,
      fragmentShader: lightFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uCameraPos: { value: state.camera.position }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    })

    state.meshes.light = new THREE.Mesh(geometry, material)
    state.meshes.light.position.set(0, 0, 0)
    state.meshes.light.renderOrder = 10
    state.scene.add(state.meshes.light)
  }

  function init() {
    initScene()
    initOceanMesh()
    initCloudMesh()
    initLightMesh()
  }

  function updateUniforms(time, scrollY) {
    if (state.meshes.ocean) {
      state.meshes.ocean.material.uniforms.uTime.value = time
      state.meshes.ocean.material.uniforms.uScroll.value = scrollY
      state.meshes.ocean.material.uniforms.uCameraPos.value.copy(state.camera.position)
    }

    if (state.meshes.cloud) {
      state.meshes.cloud.material.uniforms.uTime.value = time
      state.meshes.cloud.material.uniforms.uCameraPos.value.copy(state.camera.position)
    }

    if (state.meshes.light) {
      state.meshes.light.material.uniforms.uTime.value = time
      state.meshes.light.material.uniforms.uCameraPos.value.copy(state.camera.position)
    }
  }

  function render() {
    if (state.renderer && state.scene && state.camera) {
      state.renderer.render(state.scene, state.camera)
    }
  }

  function dispose() {
    if (state.renderer) {
      state.renderer.dispose()
      if (container.value && state.renderer.domElement) {
        container.value.removeChild(state.renderer.domElement)
      }
    }

    Object.values(state.meshes).forEach(mesh => {
      if (mesh) {
        mesh.geometry.dispose()
        mesh.material.dispose()
      }
    })
  }

  return {
    state,
    init,
    updateUniforms,
    render,
    dispose
  }
}
