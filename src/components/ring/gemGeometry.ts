import * as THREE from 'three'

/** All eight shipped cuts are star-shaped about their bounding-box centres.
 * Their culet fans are reversed. Repair only prepared copies, never the GLBs.
 * This is intentionally not a general repair for arbitrary concave meshes. */
export function orientGemFacets(geometry: THREE.BufferGeometry): number {
  if (geometry.index) throw new Error('Gem facet repair requires non-indexed geometry')
  geometry.computeBoundingBox()
  const interior = geometry.boundingBox!.getCenter(new THREE.Vector3())
  const positions = geometry.attributes.position
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3()
  const normal = new THREE.Vector3(), centre = new THREE.Vector3()
  let repaired = 0
  for (let i = 0; i < positions.count; i += 3) {
    a.fromBufferAttribute(positions, i)
    b.fromBufferAttribute(positions, i + 1)
    c.fromBufferAttribute(positions, i + 2)
    normal.subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a))
    centre.copy(a).add(b).add(c).multiplyScalar(1 / 3).sub(interior)
    if (normal.dot(centre) < 0) {
      positions.setXYZ(i + 1, c.x, c.y, c.z)
      positions.setXYZ(i + 2, b.x, b.y, b.z)
      repaired++
    }
  }
  positions.needsUpdate = true
  return repaired
}
