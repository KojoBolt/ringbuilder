import assert from 'node:assert/strict'
import fs from 'node:fs'
import { DoubleSide, Ray, Vector3 } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshBVH } from 'three-mesh-bvh'
import { orientGemFacets } from '../src/components/ring/gemGeometry.ts'

// Independent CPU audit of the actual optical surface, not a screenshot mock.
const cut = process.argv[2] ?? 'round'
assert(['round', 'oval', 'radiant', 'emerald', 'pear', 'marquise', 'cushion', 'princess'].includes(cut))
const bytes = fs.readFileSync(new URL(`../public/assets/models/diamond/${cut}.glb`, import.meta.url))
const gltf = await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '')
gltf.scene.updateMatrixWorld(true)
const meshes = []
gltf.scene.traverse(object => { if (object.isMesh) meshes.push(object) })
assert.equal(meshes.length, 1)
const geometry = meshes[0].geometry.clone().applyMatrix4(meshes[0].matrixWorld)
const expanded = geometry.toNonIndexed()
const originalPositions = geometry.attributes.position.array.slice()
assert.equal(orientGemFacets(expanded), ['radiant', 'emerald'].includes(cut) ? 8 : 32, 'Repair the shipped reversed culet fan')
assert.equal(orientGemFacets(expanded), 0, 'Orientation repair must be idempotent')
assert.deepEqual(geometry.attributes.position.array, originalPositions, 'Source geometry must stay unchanged')
expanded.computeVertexNormals()
const position = expanded.attributes.position
const edges = new Map()
let volume = 0
const point = index => new Vector3().fromBufferAttribute(position, index)
const key = vector => vector.toArray().map(n => n.toFixed(6)).join(',')
for (let i = 0; i < position.count; i += 3) {
  const [a, b, c] = [point(i), point(i + 1), point(i + 2)]
  assert(b.clone().sub(a).cross(c.clone().sub(a)).length() > 1e-10, 'Degenerate optical triangle')
  volume += a.dot(b.clone().cross(c)) / 6
  for (const [from, to] of [[a, b], [b, c], [c, a]]) {
    const f = key(from), t = key(to), edge = [f, t].sort().join('|')
    const record = edges.get(edge) ?? { count: 0, direction: 0 }
    record.count++
    record.direction += f < t ? 1 : -1
    edges.set(edge, record)
  }
}
for (const edge of edges.values()) {
  assert.equal(edge.count, 2, 'Open or nonmanifold optical surface')
  assert.equal(edge.direction, 0, 'Inconsistent triangle winding')
}
assert(volume > 0, 'Normals must face out of the gemstone')
const bvh = new MeshBVH(expanded)
function refract(direction, normal, eta) {
  const cosine = direction.dot(normal)
  const discriminant = 1 - eta * eta * (1 - cosine * cosine)
  if (discriminant < 0) return null
  return direction.clone().multiplyScalar(eta).addScaledVector(normal, -eta * cosine - Math.sqrt(discriminant)).normalize()
}
let tested = 0, internalReflections = 0, escaped = 0, missed = 0
for (const camera of [new Vector3(0, 0, 4), new Vector3(4, 0, 0), new Vector3(0, 0, -4), new Vector3(2, 2, 3)]) {
  for (let y = -3; y <= 3; y++) for (let x = -3; x <= 3; x++) {
    // Avoid the mathematically singular exact culet/edge rays in the grid.
    let ray = new Ray(camera, new Vector3(x * 0.12 + 0.0017, y * 0.12 + 0.0023, 0).sub(camera).normalize())
    let hit = bvh.raycastFirst(ray, DoubleSide)
    if (!hit) continue
    tested++
    let direction = refract(ray.direction, hit.face.normal, 1 / 2.417)
    assert(direction)
    let origin = hit.point.clone().addScaledVector(direction, 0.0005)
    for (let bounce = 0; bounce < 8; bounce++) {
      hit = bvh.raycastFirst(new Ray(origin, direction), DoubleSide)
      if (!hit) { missed++; break }
      const normal = hit.face.normal.clone()
      if (normal.dot(direction) > 0) normal.negate()
      const exit = refract(direction, normal, 2.417)
      if (exit) { escaped++; break }
      internalReflections++
      direction = direction.clone().reflect(normal).normalize()
      origin = hit.point.clone().addScaledVector(direction, 0.0005)
    }
  }
}
assert(tested > 100)
assert(internalReflections > 0, 'GLB must support total internal reflection')
assert.equal(missed, 0, 'Non-singular rays must not leak through the GLB')
assert(escaped > tested / 2, 'Most sampled rays should escape within the bounded trace')
console.log(`${cut} GLB: watertight, consistent outward winding, no degenerate triangles. ${tested} rays, ${internalReflections} internal reflections, ${escaped} escapes within eight bounces.`)
expanded.dispose()
geometry.dispose()
