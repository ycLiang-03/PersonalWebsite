import { shaderUtils } from './utils'

export const oceanVertexShader = `
${shaderUtils}

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

    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(pos, 1.0);
}
`

export const oceanFragmentShader = `
${shaderUtils}

varying vec2 vUv;
varying vec3 vWorldPosition;
varying vec3 vNormal;

uniform float uTime;
uniform float uScroll;
uniform vec3 uLightPos;
uniform vec3 uCameraPos;

const vec3 COLOR_SHALLOW = vec3(0.15, 0.55, 0.65);
const vec3 COLOR_DEEP = vec3(0.02, 0.12, 0.25);
const vec3 COLOR_WATER_BODY = vec3(0.01, 0.08, 0.18);
const vec3 COLOR_SUN = vec3(1.0, 0.95, 0.8);

vec3 getWaterNormalDetail(vec2 worldXZ, float time) {
    float microRipple1 = noise(worldXZ * 0.8 + time * 0.03) * 2.0 - 1.0;

    vec2 swirl = vec2(
        sin(worldXZ.y * 0.03 + time * 0.08) * 0.08,
        cos(worldXZ.x * 0.03 + time * 0.06) * 0.08
    );

    float nx = microRipple1 * 0.15 + swirl.x;
    float nz = microRipple1 * 0.15 + swirl.y;

    return normalize(vec3(nx, 1.0, nz));
}

vec3 getSubsurfaceColor(vec3 lightDir, vec3 viewDir, vec3 normal, float depth) {
    float sss = pow(max(dot(viewDir, -lightDir), 0.0), 3.0);
    sss *= (1.0 - depth);

    vec3 sssColor = mix(COLOR_SUN, vec3(0.3, 0.6, 0.8), depth) * sss * 0.4;

    float horizonGlow = pow(1.0 - max(dot(normal, viewDir), 0.0), 4.0);
    sssColor += vec3(0.2, 0.4, 0.6) * horizonGlow * (1.0 - depth) * 0.3;

    return sssColor;
}

vec2 getRefractionOffset(vec3 normal, float ior) {
    vec2 refraction = normal.xz * 0.1;
    refraction += normal.xz * noise(normal.xz * 4.0) * 0.03;
    return refraction;
}

void main() {
    vec3 viewDir = normalize(uCameraPos - vWorldPosition);
    vec3 lightDir = normalize(uLightPos - vWorldPosition);

    float dist = length(uCameraPos - vWorldPosition);

    float scrollDepth = clamp(uScroll / 3000.0, 0.0, 1.0);
    float distanceDepth = 1.0 - exp(-dist * 0.0008);
    float diveFactor = max(scrollDepth, distanceDepth * 0.5);

    float cameraY = uCameraPos.y;

    float maskStart = 0.0;
    float maskEnd = -150.0;
    float underwaterMask = smoothstep(maskStart, maskEnd, cameraY);

    if (underwaterMask > 0.95) {
        discard;
    }

    float ripple1 = fbm(vWorldPosition.xz * 0.006 + uTime * 0.03, 4) * 2.0 - 1.0;
    float ripple2 = fbm(vWorldPosition.xz * 0.03 - uTime * 0.06, 3) * 2.0 - 1.0;

    float combinedRipple = ripple1 * 0.75 + ripple2 * 0.25;

    float waveHeight = (ripple1 * 0.5 + 0.5);
    waveHeight = mix(waveHeight, (combinedRipple * 0.5 + 0.5), 0.3);
    waveHeight = clamp(waveHeight, 0.0, 1.0);

    float wavePeak = smoothstep(0.8, 1.0, waveHeight);

    vec3 normalDetail = getWaterNormalDetail(vWorldPosition.xz, uTime);

    float detailAttenuation = smoothstep(50.0, 800.0, dist);
    float normalDetailStrength = 0.025 * wavePeak * (1.0 - detailAttenuation * 0.7);

    vec3 normal = normalize(vNormal + normalDetail * normalDetailStrength + vec3(combinedRipple * 0.03, 0.0, combinedRipple * 0.03));

    vec3 shallowColor = mix(COLOR_SHALLOW * 0.8, vec3(0.3, 0.7, 0.9), wavePeak * 0.8);

    vec3 deepColor = mix(COLOR_DEEP * 0.6, COLOR_DEEP * 1.2, wavePeak * 0.5);
    deepColor = mix(deepColor, COLOR_WATER_BODY, diveFactor);

    vec3 baseColor = mix(shallowColor, deepColor, smoothstep(0.1, 0.8, diveFactor));

    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 6.0);
    fresnel = mix(0.04, 1.0, fresnel);

    vec3 sssColor = getSubsurfaceColor(lightDir, viewDir, normal, diveFactor) * 0.7 * wavePeak;

    vec2 refractOffset = getRefractionOffset(normal, 1.33);
    float refractedRipple = noise((vWorldPosition.xz + refractOffset) * 1.2 + uTime * 0.12);

    vec3 halfVec = normalize(lightDir + viewDir);

    float spec = pow(max(dot(normal, halfVec), 0.0), 128.0) * wavePeak * 0.3;

    float sunSpec = pow(max(dot(viewDir, reflect(-lightDir, normal)), 0.0), 64.0) * wavePeak * 0.6;
    sunSpec = sunSpec + pow(max(dot(viewDir, reflect(-lightDir, normal)), 0.0), 16.0) * wavePeak * 0.15;

    vec3 skyColor = mix(vec3(0.1, 0.2, 0.4), vec3(0.4, 0.6, 0.9), normal.y);

    float foam = smoothstep(0.85, 0.98, combinedRipple + refractedRipple * 0.3) * wavePeak * (1.0 - diveFactor);
    foam *= smoothstep(0.6, 0.9, ripple1);

    float NdotL = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = baseColor * (NdotL * 0.6 + 0.4);

    vec3 waterColor = diffuse + sssColor;

    waterColor = mix(waterColor, vec3(0.15, 0.5, 0.6), refractedRipple * 0.2 * (1.0 - diveFactor));

    vec3 reflection = skyColor * fresnel * 0.8;

    vec3 specular = COLOR_SUN * (sunSpec + spec) * (1.0 - diveFactor * 0.8);

    waterColor = mix(waterColor, vec3(1.0), foam * 0.4);

    vec3 finalColor = waterColor + reflection + specular;

    float fogDensity = 0.0005;
    float fog = 1.0 - exp(-dist * fogDensity);

    vec3 shallowTeal = vec3(0.15, 0.4, 0.5);
    vec3 transitionBlue = vec3(0.08, 0.2, 0.35);
    vec3 deepBlue = vec3(0.02, 0.08, 0.15);

    float step1 = smoothstep(0.3, 0.5, diveFactor);
    float step2 = smoothstep(0.7, 0.9, diveFactor);
    vec3 fogColor = mix(shallowTeal, transitionBlue, step1);
    fogColor = mix(fogColor, deepBlue, step2);

    finalColor = mix(finalColor, fogColor, fog * 0.8);

    finalColor = mix(finalColor, vec3(0.0), underwaterMask);

    gl_FragColor = vec4(finalColor, 1.0);
}
`
