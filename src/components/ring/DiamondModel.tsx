
import {
  Component,
  Suspense,
  useMemo,
  type ReactNode,
} from 'react'

import { useGLTF } from '@react-three/drei'

import * as THREE from 'three'

import type { DiamondId } from '../../data/ringOptions'

import {
  diamonds,
  findDiamond,
} from '../../data/ringOptions'

import { getGemDimensions } from './gemAssembly'
import DiamondOpticsMaterial from './DiamondOpticsMaterial'
import { orientGemFacets } from './gemGeometry'
export { getGemDimensions } from './gemAssembly'
export type { GemDimensions } from './gemAssembly'

type DiamondModelProps = {
  diamond: DiamondId
  carat: number
  position?: [number, number, number]
}

type PreparedGem = {
  geometries: THREE.BufferGeometry[]
  size: THREE.Vector3
  center: THREE.Vector3
}

const preparedCache = new WeakMap<
  THREE.Object3D,
  PreparedGem
>()

function prepareGem(
  source: THREE.Object3D,
): PreparedGem {
  const cached = preparedCache.get(source)

  if (cached) return cached

  source.updateMatrixWorld(true)

  const geometries: THREE.BufferGeometry[] = []
  const bounds = new THREE.Box3()

  source.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return
    if (!child.geometry) return

    let geometry = child.geometry.clone()

    // Bake imported mesh transforms into geometry.
    geometry.applyMatrix4(child.matrixWorld)

    // Separate facet vertices so normals stay sharp.
    if (geometry.index) {
      const expanded = geometry.toNonIndexed()
      geometry.dispose()
      geometry = expanded
    }

    orientGemFacets(geometry)
    geometry.deleteAttribute('normal')
    geometry.computeVertexNormals()
    geometry.computeBoundingBox()

    if (geometry.boundingBox) {
      bounds.union(geometry.boundingBox)
    }

    geometries.push(geometry)
  })

  if (geometries.length === 0 || bounds.isEmpty()) {
    throw new Error(
      '[DR Gold] No usable diamond geometry found.',
    )
  }

  const size = bounds.getSize(new THREE.Vector3())
  const center = bounds.getCenter(new THREE.Vector3())

  if (
    size.x <= 0 ||
    size.y <= 0 ||
    size.z <= 0
  ) {
    throw new Error(
      '[DR Gold] Invalid gemstone dimensions.',
    )
  }

  const prepared: PreparedGem = {
    geometries,
    size,
    center,
  }

  preparedCache.set(source, prepared)

  return prepared
}

const DiamondModel = ({
  diamond,
  carat,
  position = [0, 0, 0],
}: DiamondModelProps) => {
  const option = findDiamond(diamond)
  const { scene } = useGLTF(option.model)

  const prepared = useMemo(
    () => prepareGem(scene),
    [scene],
  )

  const dimensions = getGemDimensions(
    diamond,
    carat,
  )

  return (
    <group position={position}>
      <group
        scale={dimensions.modelScale}
      >
        <group
          position={[
            -prepared.center.x,
            -prepared.center.y,
            0,
          ]}
        >
          {prepared.geometries.map(
            (geometry, index) => (
              <mesh
                key={`${diamond}-${index}`}
                geometry={geometry}
                dispose={null}
                castShadow={false}
                receiveShadow={false}
              >
                <DiamondOpticsMaterial geometry={geometry} />
              </mesh>
            ),
          )}
        </group>
      </group>
    </group>
  )
}

export const GemFallback = ({
  diamond,
  carat,
  position = [0, 0, 0],
}: DiamondModelProps) => {
  const dimensions = getGemDimensions(
    diamond,
    carat,
  )

  return (
    <mesh
      position={position}
      scale={[
        dimensions.halfWidth,
        dimensions.halfLength,
        dimensions.scale * 0.25,
      ]}
    >
      <octahedronGeometry args={[1, 0]} />

      <meshStandardMaterial
        color="#edf3f8"
        metalness={0}
        roughness={0.12}
        flatShading
      />
    </mesh>
  )
}

type GemBoundaryProps = {
  children: ReactNode
  fallback: ReactNode
}

type GemBoundaryState = {
  failed: boolean
}

export class GemBoundary extends Component<
  GemBoundaryProps,
  GemBoundaryState
> {
  state: GemBoundaryState = {
    failed: false,
  }

  static getDerivedStateFromError(): GemBoundaryState {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.error(
      '[DR Gold] Diamond rendering failed:',
      error,
    )
  }

  render() {
    return this.state.failed
      ? this.props.fallback
      : this.props.children
  }
}

export const DiamondWithSuspense = (
  props: DiamondModelProps,
) => {
  const fallback = <GemFallback {...props} />

  return (
    <GemBoundary
      key={props.diamond}
      fallback={fallback}
    >
      <Suspense fallback={fallback}>
        <DiamondModel {...props} />
      </Suspense>
    </GemBoundary>
  )
}

export const preloadDiamondModels = () => {
  diamonds.forEach((diamond) => {
    useGLTF.preload(diamond.model)
  })
}

export default DiamondModel
