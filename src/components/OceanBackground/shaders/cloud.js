import { shaderUtils } from './utils'

export const cloudVertexShader = `
${shaderUtils}

varying vec2 vUv;
varying vec3 vWorldPosition;

void main() {
    vUv = uv;
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const cloudFragmentShader = `
${shaderUtils}

varying vec2 vUv;
varying vec3 vWorldPosition;

uniform float uTime;
uniform vec3 uCameraPos;

void main() {
    vec2 uv = vUv;
    float n = fbm(uv * 1.5 + uTime * 0.003, 6);
    float alpha = smoothstep(0.25, 0.65, n);

    float detail = fbm(uv * 4.0 + uTime * 0.001, 4);
    alpha *= smoothstep(0.2, 0.8, detail);

    float edgeWidth = 0.4;
    float leftEdge = smoothstep(0.0, edgeWidth, uv.x);
    float rightEdge = smoothstep(1.0, 1.0 - edgeWidth, uv.x);
    float bottomEdge = smoothstep(0.0, edgeWidth, uv.y);
    float topEdge = smoothstep(1.0, 1.0 - edgeWidth, uv.y);
    float mask = leftEdge * rightEdge * bottomEdge * topEdge;

    alpha *= mask;
    alpha = pow(alpha, 1.1);

    float cameraY = uCameraPos.y;
    float cloudMaskStart = 0.0;
    float cloudMaskEnd = -150.0;
    float cloudUnderwaterMask = smoothstep(cloudMaskStart, cloudMaskEnd, cameraY);
    alpha *= (1.0 - cloudUnderwaterMask);

    gl_FragColor = vec4(vec3(1.0), alpha * 0.7);
}
`
