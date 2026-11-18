
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

import type { BandId } from '../../data/ringOptions'
import { BAND_STONE_RADIUS, bandWidthAt, bandDepthAt, bandCenterRadiusAt, getBandStonePlacements } from './bandCoverage'

type RingBandProps = {
  color: string
  band: BandId
}

const SEGMENTS = 192
const SIDES = 32

function createBandGeometry(): THREE.BufferGeometry {
  const positions: number[] = []
  const indices: number[] = []

  for (let i = 0; i <= SEGMENTS; i++) {
    const theta = (i / SEGMENTS) * Math.PI * 2

    const cosTheta = Math.cos(theta)
    const sinTheta = Math.sin(theta)

    const width = bandWidthAt(theta)
    const depth = bandDepthAt(theta)
    const centerRadius = bandCenterRadiusAt(theta)

    for (let j = 0; j <= SIDES; j++) {
      const phi = (j / SIDES) * Math.PI * 2

      // A superellipse gives a broad face and soft edges, rather than a tube.
      const rounded = (value: number) => Math.sign(value) * Math.pow(Math.abs(value), 0.5)
      const radial = rounded(Math.cos(phi))
      const axial = rounded(Math.sin(phi))

      const px =
        cosTheta * (centerRadius + radial * width)

      const py =
        sinTheta * (centerRadius + radial * width)

      const pz = axial * depth

      positions.push(px, py, pz)
    }
  }

  for (let i = 0; i < SEGMENTS; i++) {
    for (let j = 0; j < SIDES; j++) {
      const a = i * (SIDES + 1) + j
      const b = a + SIDES + 1

      indices.push(a, b, a + 1)
      indices.push(b, b + 1, a + 1)
    }
  }

  const geometry = new THREE.BufferGeometry()

  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3),
  )

  geometry.setIndex(indices)

  geometry.computeVertexNormals()
  geometry.computeBoundingSphere()

  return geometry
}

function BandDiamonds({ band, color }: { band: BandId; color: string }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const seatsRef = useRef<THREE.InstancedMesh>(null)
  const beadsRef = useRef<THREE.InstancedMesh>(null)
  const placements = useMemo(() => getBandStonePlacements(band), [band])
  const { scene } = useGLTF('/assets/models/diamond/round.glb')
  const geometry = useMemo(() => {
    // Reuse the supplied brilliant cut for the small stones, not octahedrons.
    scene.updateMatrixWorld(true)
    let result: THREE.BufferGeometry | undefined
    scene.traverse(child => {
      if (result || !(child instanceof THREE.Mesh)) return
      const clone = child.geometry.clone().applyMatrix4(child.matrixWorld)
      const prepared = clone.index ? clone.toNonIndexed() : clone
      if (prepared !== clone) clone.dispose()
      prepared.deleteAttribute('normal')
      prepared.computeVertexNormals()
      result = prepared
    })
    if (!result) throw new Error('Round diamond GLB contains no usable mesh')
    return result
  }, [scene])
  useEffect(() => () => geometry.dispose(), [geometry])

  useLayoutEffect(() => {
    const mesh = meshRef.current
    const seats = seatsRef.current
    const beads = beadsRef.current
    if (!mesh || !seats || !beads) return
    const transform = new THREE.Object3D()
    const face = new THREE.Vector3(0, 0, 1)
    const local = new THREE.Vector3()
    placements.forEach(({ angle, position }, index) => {
      transform.position.set(...position)
      // Diamond tables follow the outward surface, rather than facing camera-Z.
      transform.quaternion.setFromUnitVectors(face, new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0))
      transform.scale.setScalar(BAND_STONE_RADIUS)
      transform.updateMatrix()
      mesh.setMatrixAt(index, transform.matrix)
      transform.position.add(local.set(0, 0, -0.006).applyQuaternion(transform.quaternion))
      transform.scale.setScalar(1)
      transform.updateMatrix()
      seats.setMatrixAt(index, transform.matrix)
      for (let bead = 0; bead < 4; bead++) {
        local.set(bead % 2 ? 0.023 : -0.023, bead < 2 ? -0.023 : 0.023, 0.003)
        transform.position.set(...position).add(local.applyQuaternion(transform.quaternion))
        transform.scale.setScalar(0.006)
        transform.updateMatrix()
        beads.setMatrixAt(index * 4 + bead, transform.matrix)
      }
    })
    for (const instances of [mesh, seats, beads]) {
      instances.instanceMatrix.needsUpdate = true
      instances.computeBoundingBox()
      instances.computeBoundingSphere()
    }
  }, [placements])

  return (
    <group>
      <instancedMesh ref={meshRef} args={[geometry, undefined, placements.length]}>
        {/* Transmission applies modelMatrix scale, but not instanceMatrix scale. */}
        <meshPhysicalMaterial color="#ffffff" metalness={0} roughness={0.03}
          transmission={0.8} thickness={BAND_STONE_RADIUS * 1.11} ior={2.417} envMapIntensity={1}
          flatShading />
      </instancedMesh>
      <instancedMesh ref={seatsRef} args={[undefined, undefined, placements.length]}>
        <torusGeometry args={[0.03, 0.004, 8, 16]} />
        <meshStandardMaterial color={color} metalness={1} roughness={0.16} />
      </instancedMesh>
      <instancedMesh ref={beadsRef} args={[undefined, undefined, placements.length * 4]}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial color={color} metalness={1} roughness={0.16} />
      </instancedMesh>
    </group>
  )
}

export default function RingBand({
  color,
  band,
}: RingBandProps) {
  const geometry = useMemo(
    () => createBandGeometry(),
    [],
  )

  useEffect(() => {
    return () => geometry.dispose()
  }, [geometry])

  return (
    <group>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          color={color}
          metalness={1}
          roughness={0.16}
          envMapIntensity={1.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {band !== 'plain' && (
        <Suspense fallback={null}>
          <BandDiamonds key={band} band={band} color={color} />
        </Suspense>
      )}
    </group>
  )
}
