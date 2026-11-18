import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { MeshBVH, MeshBVHUniformStruct, SAH, shaderStructs, shaderIntersectFunction } from 'three-mesh-bvh'

// Local implementation: do not patch Three.ShaderChunk or reuse Drei's r187-
// incompatible cube_uv_reflection_fragment include. Trace the actual GLB mesh.
const vertexShader = /* glsl */`
  varying vec3 vLocalPosition;
  varying vec3 vLocalNormal;
  void main() {
    vLocalPosition = position;
    vLocalNormal = normal;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */`
  precision highp isampler2D;
  precision highp usampler2D;
  uniform samplerCube uEnvironment;
  uniform mat4 uWorldToLocal;
  uniform mat4 uLocalToWorld;
  uniform float uEnvironmentIntensity;
  varying vec3 vLocalPosition;
  varying vec3 vLocalNormal;
  ${shaderStructs}
  ${shaderIntersectFunction}
  uniform BVH uBVH;
  #include <common>

  // All distances are in the unscaled asset's local coordinate system.
  const float RAY_EPSILON = 0.0005;
  const int MAX_BOUNCES = 8;

  vec3 studio(vec3 direction) {
    vec3 worldDirection = normalize(mat3(uLocalToWorld) * direction);
    // Explicit LOD avoids undefined implicit derivatives inside divergent ray
    // paths (otherwise a cubemap can shimmer or speckle while rotating).
    return textureLod(uEnvironment, worldDirection, 0.0).rgb * uEnvironmentIntensity;
  }

  float fresnelDielectric(float cosine, float etaI, float etaT) {
    float sinT2 = pow(etaI / etaT, 2.0) * max(0.0, 1.0 - cosine * cosine);
    if (sinT2 >= 1.0) return 1.0;
    float cosT = sqrt(1.0 - sinT2);
    float rs = (etaI * cosine - etaT * cosT) / (etaI * cosine + etaT * cosT);
    float rp = (etaT * cosine - etaI * cosT) / (etaT * cosine + etaI * cosT);
    return 0.5 * (rs * rs + rp * rp);
  }

  // At each boundary, accumulate light escaping into the studio and continue
  // the reflected path. Total internal reflection retains all its energy.
  // This is an environment-lit gemstone approximation, not a whole-scene tracer.
  vec3 traceDiamond(vec3 entryPosition, vec3 incident, vec3 entryNormal, float ior) {
    float entryF = fresnelDielectric(clamp(-dot(incident, entryNormal), 0.0, 1.0), 1.0, ior);
    vec3 radiance = studio(reflect(incident, entryNormal)) * entryF;
    float weight = 1.0 - entryF;
    vec3 direction = normalize(refract(incident, entryNormal, 1.0 / ior));
    vec3 origin = entryPosition + direction * RAY_EPSILON;

    for (int bounce = 0; bounce < MAX_BOUNCES; bounce++) {
      uvec4 indices = uvec4(0u);
      vec3 faceNormal = vec3(0.0);
      vec3 barycentric = vec3(0.0);
      float side = 1.0;
      float distance = 0.0;
      bool hit = bvhIntersectFirstHit(uBVH, origin, direction, indices, faceNormal, barycentric, side, distance);
      if (!hit) break;

      vec3 point = origin + direction * distance;
      // BVH normals face against the incoming ray, including internal hits.
      float f = fresnelDielectric(clamp(-dot(direction, faceNormal), 0.0, 1.0), ior, 1.0);
      vec3 escape = refract(direction, faceNormal, ior);
      if (dot(escape, escape) > 0.0) radiance += weight * (1.0 - f) * studio(normalize(escape));
      weight *= f;
      if (weight < 0.002) break;
      direction = normalize(reflect(direction, faceNormal));
      origin = point + direction * RAY_EPSILON;
    }
    // Energy still trapped at the bounded bounce limit remains dark. Do not
    // fake a final escape or fill it with the framebuffer behind the ring.
    return radiance;
  }

  void main() {
    vec3 localCamera = (uWorldToLocal * vec4(cameraPosition, 1.0)).xyz;
    vec3 normal = normalize(vLocalNormal);
    if (dot(vLocalPosition - localCamera, normal) > 0.0) normal = -normal;
    // Bounded spatial antialiasing of high-frequency internal reflections.
    // Derivatives are computed outside the divergent BVH paths.
    vec3 dx = dFdx(vLocalPosition);
    vec3 dy = dFdy(vLocalPosition);
    vec3 colour = vec3(0.0);
    for (int sampleIndex = 0; sampleIndex < 4; sampleIndex++) {
      float x = (sampleIndex == 0 || sampleIndex == 2) ? -0.25 : 0.25;
      float y = sampleIndex < 2 ? -0.25 : 0.25;
      vec3 entry = vLocalPosition + dx * x + dy * y;
      vec3 incident = normalize(entry - localCamera);
      // Trace wavelength-dependent IORs, not a rainbow overlay.
      vec3 red = traceDiamond(entry, incident, normal, 2.410);
      vec3 green = traceDiamond(entry, incident, normal, 2.417);
      vec3 blue = traceDiamond(entry, incident, normal, 2.424);
      colour += vec3(red.r, green.g, blue.b);
    }
    gl_FragColor = vec4(colour * 0.25, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

export default function DiamondOpticsMaterial({ geometry }: { geometry: THREE.BufferGeometry }) {
  const resources = useMemo(() => {
    // BVH construction can reorder indices: never mutate the useGLTF cache.
    const traceGeometry = geometry.clone()
    const bvh = new MeshBVHUniformStruct()
    bvh.updateFrom(new MeshBVH(traceGeometry, { strategy: SAH }))
    const material = new THREE.ShaderMaterial({
      name: 'DRGold diamond internal optics',
      vertexShader,
      fragmentShader,
      uniforms: {
        uBVH: { value: bvh },
        uEnvironment: { value: null },
        uEnvironmentIntensity: { value: 1 },
        uWorldToLocal: { value: new THREE.Matrix4() },
        uLocalToWorld: { value: new THREE.Matrix4() },
      },
      transparent: false,
      depthWrite: true,
      depthTest: true,
      toneMapped: true,
    })
    material.onBeforeRender = (_renderer, _scene, _camera, _geometry, object) => {
      material.uniforms.uLocalToWorld.value.copy(object.matrixWorld)
      material.uniforms.uWorldToLocal.value.copy(object.matrixWorld).invert()
    }
    return { material, bvh, traceGeometry }
  }, [geometry])

  useFrame(({ scene }) => {
    // RingViewer supplies a raw CubeTexture, not a PMREM CubeUV atlas. This
    // reads the same studio as the metal; each cut traces its own GLB facets.
    // oxlint-disable-next-line react/immutability -- Imperative Three uniform update in the R3F frame loop.
    resources.material.uniforms.uEnvironment.value = scene.environment
    // Calibrate the clear stone independently of the metal's exposure.
    // oxlint-disable-next-line react/immutability -- Imperative Three uniform update in the R3F frame loop.
    resources.material.uniforms.uEnvironmentIntensity.value = scene.environmentIntensity * 5
  })

  useEffect(() => () => {
    resources.material.dispose()
    resources.bvh.dispose()
    resources.traceGeometry.dispose()
  }, [resources])

  return <primitive attach="material" object={resources.material} />
}
