<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import * as THREE from 'three'

const container = ref(null)
let renderer, scene, camera, mesh, cloudMesh, clock, scrollY = 0
let currentRotationY = 0
let targetRotationY = 0
let mouseX = 0

// Ocean Shaders
const vertexShader = `
varying vec2 vUv;
varying vec3 vWorldPosition;
varying vec3 vNormal;

uniform float uTime;
uniform float uScroll;

struct GerstnerWave {
    float length;
    float amplitude;
    float speed;
    vec2 direction;
};

#define WAVE_COUNT 12
uniform GerstnerWave uWaves[WAVE_COUNT];

vec3 calculateGerstner(GerstnerWave wave, vec3 p, inout vec3 tangent, inout vec3 binormal) {
    float k = 2.0 * 3.14159 / wave.length;
    float c = sqrt(9.81 / k) * wave.speed;
    vec2 d = normalize(wave.direction);
    float f = k * (dot(d, p.xz) - c * uTime);
    float a = wave.amplitude;

    float sinF = sin(f);
    float cosF = cos(f);
    
    // Tanh peak compression to avoid "rubber" look
    float peak = exp(sinF) / exp(1.0); 
    
    p.x += d.x * (a * cosF);
    p.y += a * peak;
    p.z += d.y * (a * cosF);

    tangent += vec3(-d.x * d.x * (a * k * sinF), d.x * (a * k * cosF), -d.x * d.y * (a * k * sinF));
    binormal += vec3(-d.x * d.y * (a * k * sinF), d.y * (a * k * cosF), -d.y * d.y * (a * k * sinF));

    return p;
}

void main() {
    vUv = uv;
    vec3 pos = position;
    vec3 tangent = vec3(1.0, 0.0, 0.0);
    vec3 binormal = vec3(0.0, 0.0, 1.0);

    for (int i = 0; i < WAVE_COUNT; i++) {
        pos = calculateGerstner(uWaves[i], pos, tangent, binormal);
    }

    vNormal = normalize(cross(binormal, tangent));
    vWorldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;
    
    // FIXED: Removed pos.y offset based on scroll. Camera moves instead.
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(pos, 1.0);
}
`

const fragmentShader = `
varying vec2 vUv;
varying vec3 vWorldPosition;
varying vec3 vNormal;

uniform float uTime;
uniform float uScroll;
uniform vec3 uLightPos;
uniform vec3 uCameraPos;

const vec3 COLOR_SHALLOW = vec3(0.25, 0.7, 0.8); // Increased brightness while maintaining cyan-blue tone
const vec3 COLOR_DEEP = vec3(0.08, 0.3, 0.4); // Increased brightness for deep water

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    vec2 u = f*f*(3.0-2.0*f);
    return mix(mix(hash(i + vec2(0,0)), hash(i + vec2(1,0)), u.x),
               mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
}

void main() {
    vec3 viewDir = normalize(uCameraPos - vWorldPosition);
    vec3 lightDir = normalize(uLightPos - vWorldPosition);
    
    // Optimization 1: Triple-layer High-freq Micro-ripples
    float ripple = noise(vWorldPosition.xz * 20.0 + uTime * 0.3) * 0.5;
    ripple += noise(vWorldPosition.xz * 45.0 - uTime * 0.6) * 0.3;
    ripple += noise(vWorldPosition.xz * 90.0 + uTime * 0.9) * 0.2; // Extra fine layer
    
    // Sharpen the normal perturbation
    vec3 normal = normalize(vNormal + vec3(ripple * 0.35, 0.0, ripple * 0.35));

    float diveFactor = clamp(uScroll / 3000.0, 0.0, 1.0);
    vec3 baseColor = mix(COLOR_SHALLOW, COLOR_DEEP, diveFactor);
    
    // Fresnel Effect (Intensified for glass-like surface)
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
    
    // Foam/Crest Highlights (Simulating white caps on micro-ripples)
    float foam = smoothstep(0.6, 0.95, ripple) * (1.0 - diveFactor);
    
    // Sparkling Specular (Even sharper)
    float spec = pow(max(dot(viewDir, reflect(-lightDir, normal)), 0.0), 1024.0);
    
    // Final Color with intense hair-like highlights and foam
    vec3 finalColor = baseColor * (max(dot(normal, lightDir), 0.0) + 0.25); // Lowered ambient brightness from 0.4
    finalColor += vec3(0.8, 0.95, 1.0) * spec * 2.5 * (1.0 - diveFactor * 0.9); // Lowered spec intensity from 3.5
    finalColor = mix(finalColor, vec3(0.5, 0.8, 1.0), fresnel * 0.7 * (1.0 - diveFactor)); // Subtler fresnel
    finalColor += vec3(1.0) * foam * 0.2; // Subtler foam
    
    // Depth Fog (Forward real, background blurred/dark)
    float dist = length(uCameraPos - vWorldPosition);
    // Optimization: Fade to dark background much faster for "front-real, back-dark" effect
    float fog = 1.0 - exp(-dist * (0.0012 + diveFactor * 0.01)); // Slightly reduced fog density for better visibility
    finalColor = mix(finalColor, vec3(0.01, 0.03, 0.08), fog); // Fade to a slightly brighter navy than before

    gl_FragColor = vec4(finalColor, 1.0);
}
`

// Cloud Shaders (Fluffy, Pure White, Static)
const cloudVertexShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const cloudFragmentShader = `
varying vec2 vUv;
uniform float uTime;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    vec2 u = f*f*(3.0-2.0*f);
    return mix(mix(hash(i + vec2(0,0)), hash(i + vec2(1,0)), u.x),
               mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
}

float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 7; i++) {
        v += a * noise(p);
        p *= 2.0;
        a *= 0.5;
    }
    return v;
}

void main() {
    // Optimization: Smoother clouds with less blockiness
    vec2 uv = vUv;
    float n = fbm(uv * 2.5 + uTime * 0.005);
    float alpha = smoothstep(0.4, 0.8, n);
    
    // Multi-scale noise for soft edges
    float detail = fbm(uv * 10.0 - uTime * 0.002);
    alpha *= smoothstep(0.1, 0.9, detail);
    
    // Soft circular mask for global fade
    float mask = 1.0 - length(uv - 0.5) * 1.5;
    mask = smoothstep(0.0, 0.5, mask);
    
    // Edge softening: Fade alpha near the edges of the noise patterns
    alpha *= mask;
    alpha = pow(alpha, 1.2); // Contrast adjustment for fluffiness

    gl_FragColor = vec4(vec3(1.0), alpha * 0.7);
}
`

const init = () => {
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 1, 5000)
  camera.position.set(0, 50, 180)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  // FIXED: No clear color to allow CSS background integration
  container.value.appendChild(renderer.domElement)

  clock = new THREE.Clock()

  // Ocean Geometry (Higher detail for better wave peaks)
  const geometry = new THREE.PlaneGeometry(3000, 3000, 128, 128)
  geometry.rotateX(-Math.PI / 2)

  const waves = []
  const directions = [[1,0.2],[-0.9,0.2],[0.1,0.95],[-0.5,-0.6],[0.2,1],[-0.7,0.1],[0.4,-0.4],[-0.3,0.9],[0.8,-0.2],[-0.2,0.7],[0.6,-0.3],[-0.6,-0.5]]
  for (let i = 0; i < 12; i++) {
    waves.push({
      // Group 1: Giant Swells (Increased length and amplitude)
      length: i < 3 ? 250+Math.random()*150 : (i < 6 ? 80+Math.random()*40 : 30+Math.random()*15),
      amplitude: i < 3 ? 8.0+Math.random()*4.0 : (i < 6 ? 2.5+Math.random()*1.5 : 0.6+Math.random()*0.4),
      speed: i < 3 ? 1.2 + Math.random() * 0.5 : 2.0 + Math.random() * 1.5,
      direction: new THREE.Vector2(...directions[i])
    })
  }

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uWaves: { value: waves },
      uLightPos: { value: new THREE.Vector3(1000, 1500, 1000) },
      uCameraPos: { value: camera.position }
    },
    side: THREE.DoubleSide
  })

  mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)

  // Cloud Mesh (RE-POSITIONED to be in front and visible)
  const cloudGeo = new THREE.PlaneGeometry(5000, 2500) // Increased size
  const cloudMat = new THREE.ShaderMaterial({
    vertexShader: cloudVertexShader,
    fragmentShader: cloudFragmentShader,
    uniforms: { uTime: { value: 0 } },
    transparent: true,
    depthWrite: false
  })
  cloudMesh = new THREE.Mesh(cloudGeo, cloudMat)
  cloudMesh.position.set(0, 1000, -2000) // Further away and larger
  cloudMesh.rotation.x = 1.2 // Adjusted perspective
  scene.add(cloudMesh)

  animate()
}

const animate = () => {
  if (!renderer) return
  requestAnimationFrame(animate)
  const elapsedTime = clock.getElapsedTime()
  
  mesh.material.uniforms.uTime.value = elapsedTime
  mesh.material.uniforms.uScroll.value = scrollY
  mesh.material.uniforms.uCameraPos.value.copy(camera.position)

  // Camera Logic: Mouse-controlled Coast Sway (Pan)
  // targetRotationY is updated in handleMouseMove
  currentRotationY += (targetRotationY - currentRotationY) * 0.05 // Damping 0.05

  // Pure Vertical Dive
  // Start higher to ensure we are above water, and dive faster
  camera.position.y = 150 - scrollY * 0.35 
  
  // Coast Sway Pan: Only Y rotation
  camera.rotation.set(0, 0, 0) // Lock pitch/roll
  // To keep sea level at bottom 1/3, we look slightly UP (y target > camera y)
  // But we want the dive to feel real, so lookAt should stay relatively stable or move slower
  camera.lookAt(new THREE.Vector3(Math.sin(currentRotationY) * 1000, 300 - scrollY * 0.15, -1000))
  
  renderer.render(scene, camera)
}

const handleMouseMove = (event) => {
  // Normalize mouse X to -1 to 1
  mouseX = (event.clientX / window.innerWidth) * 2 - 1
  // Map to ±10 degrees (approx 0.17 radians)
  targetRotationY = -mouseX * 0.17 
}

const handleScroll = () => { scrollY = window.scrollY }
const handleResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

onMounted(() => {
  init()
  window.addEventListener('scroll', handleScroll)
  window.addEventListener('resize', handleResize)
  window.addEventListener('mousemove', handleMouseMove)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('mousemove', handleMouseMove)
  if (renderer) {
    renderer.dispose()
    container.value.removeChild(renderer.domElement)
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
