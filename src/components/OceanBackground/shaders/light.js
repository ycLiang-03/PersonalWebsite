import { shaderUtils } from './utils'

export const lightVertexShader = `
${shaderUtils}

varying vec2 vUv;
varying vec3 vWorldPosition;

uniform vec3 uCameraPos;

void main() {
    vUv = uv;
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}
`

export const lightFragmentShader = `
${shaderUtils}

varying vec2 vUv;
varying vec3 vWorldPosition;

uniform float uTime;
uniform vec3 uCameraPos;

void main() {
    float cameraY = uCameraPos.y;
    float cameraDepth = max(0.0, -cameraY);
    float baseIntensity = cameraY < 0.0 ? 0.8 + clamp((-cameraY) / 800.0, 0.0, 0.4) : 0.6;

    float worldY = vWorldPosition.y;
    if (worldY > 0.0) {
        discard;
    }

    float distanceFromSurface = 0.0 - worldY;
    float verticalFade = exp(-distanceFromSurface * 0.015);

    vec2 relativeXZ = vWorldPosition.xz - uCameraPos.xz;
    float radialDist = length(relativeXZ);
    float maxRadius = 200.0;
    float falloffStart = maxRadius * 0.5;
    float falloffEnd = maxRadius * 1.2;
    float radialFade = smoothstep(falloffEnd, falloffStart, radialDist);

    float time = uTime * 0.12;
    vec2 noiseCoord = relativeXZ * 0.006 + vec2(time, time * 0.5);
    float noiseVal = fbmSimple(noiseCoord);
    noiseVal = (noiseVal - 0.5) * 2.0;

    float beamStreaks = sin(relativeXZ.x * 0.012 + noiseVal * 2.0 + time) * 0.5 + 0.5;
    beamStreaks = pow(beamStreaks, 1.5);

    float particleNoise = fbmSimple(relativeXZ * 0.03 + time * 0.7);
    float particles = smoothstep(0.6, 0.7, particleNoise);
    particles = pow(particles, 1.2) * 0.8;

    float finalIntensity = verticalFade * radialFade * (beamStreaks * 0.6 + particles * 0.4);
    finalIntensity = pow(finalIntensity, 0.8);

    vec3 lightColor = vec3(0.9, 1.0, 1.0) * 4.0;
    vec3 finalColor = lightColor * finalIntensity * baseIntensity;

    float alpha = finalIntensity * baseIntensity * 1.5;

    gl_FragColor = vec4(finalColor, alpha);
}
`
