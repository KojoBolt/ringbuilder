import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import type { DiamondId, SettingId } from '../../data/ringOptions'
import { findSetting } from '../../data/ringOptions'
import {
  contourAt, getGemDimensions, HEAD_ROTATION, prongAngles,
  type Point3,
} from './gemAssembly'

type SettingHeadProps = {
  color: string
  diamond: DiamondId
  carat: number
  setting: SettingId
}

const Metal = ({ color }: { color: string }) => (
  <meshStandardMaterial color={color} metalness={1} roughness={0.16} envMapIntensity={1.2} />
)

function Tube({ points, radius, color, closed = false, linear = false, endRadius = radius }: {
  points: Point3[]
  radius: number
  color: string
  closed?: boolean
  linear?: boolean
  endRadius?: number
}) {
  const geometry = useMemo(() => {
    const vertices = points.map(point => new THREE.Vector3(...point))
    // Preserve the corners of polygonal girdles rather than rounding through them.
    const curve = linear ? new THREE.CurvePath<THREE.Vector3>() : new THREE.CatmullRomCurve3(vertices, closed)
    if (curve instanceof THREE.CurvePath) {
      for (let i = 0; i < vertices.length - (closed ? 0 : 1); i++) {
        curve.add(new THREE.LineCurve3(vertices[i], vertices[(i + 1) % vertices.length]))
      }
    }
    const segments = closed ? 192 : 40
    const geometry = new THREE.TubeGeometry(curve, segments, radius, 12, closed)
    if (endRadius !== radius) {
      const positions = geometry.attributes.position
      for (let i = 0; i <= segments; i++) {
        const t = i / segments
        const center = curve.getPointAt(t)
        const scale = THREE.MathUtils.lerp(1, endRadius / radius, t * t * (3 - 2 * t))
        for (let j = 0; j <= 12; j++) {
          const index = i * 13 + j
          positions.setXYZ(index,
            center.x + (positions.getX(index) - center.x) * scale,
            center.y + (positions.getY(index) - center.y) * scale,
            center.z + (positions.getZ(index) - center.z) * scale)
        }
      }
      geometry.computeVertexNormals()
    }
    return geometry
  }, [points, radius, closed, linear, endRadius])
  useEffect(() => () => geometry.dispose(), [geometry])
  return <mesh geometry={geometry}><Metal color={color} /></mesh>
}

export default function SettingHead({ color, diamond, carat, setting }: SettingHeadProps) {
  const assembly = useMemo(() => {
    const gem = getGemDimensions(diamond, carat)
    const option = findSetting(setting)
    const radius = Math.min(0.024, Math.max(0.014, gem.modelScale * 0.065))
    const rail = gem.contour.map(([x, y]): Point3 => [x * 0.74, y * 0.74, gem.galleryZ])
    const claws = prongAngles(diamond, option.prongs).map(angle => {
      const [x, y] = contourAt(gem, angle)
      const length = Math.hypot(x, y)
      const outside = 1 + radius * 0.8 / length
      const points: Point3[] = [
        [x * 0.74, y * 0.74, gem.galleryZ],
        [x * outside, y * outside, -0.035 * gem.modelScale],
        [x * outside, y * outside, 0.04 * gem.modelScale],
        [x * 0.97, y * 0.97, 0.075 * gem.modelScale],
      ]
      return points
    })
    const cathedral = setting === 'cathedral'
    // These points are in head-local coordinates. Their bases map onto the shank.
    const supports = [-1, 1].map(side => {
      const [x] = contourAt(gem, side === 1 ? 0 : Math.PI)
      const baseX = side * (cathedral ? 0.62 : 0.42)
      const baseZ = Math.sqrt(1 - baseX * baseX) - gem.stoneY
      return [
        [baseX, 0, baseZ],
        [baseX * 0.85, 0, cathedral ? gem.galleryZ - 0.045 : baseZ + 0.13],
        [x * 0.74, 0, gem.galleryZ],
      ] as Point3[]
    })
    const hidden = option.head === 'hidden-halo'
    const hasHalo = hidden || option.head === 'halo'
    const haloZ = hidden ? -0.19 * gem.modelScale : 0.015 * gem.modelScale
    const haloRadius = hidden ? 0.016 : 0.023
    const halo = gem.contour.map(([x, y]): Point3 => {
      const spread = hidden ? 0.89 : 1 + 0.055 / Math.hypot(x, y)
      return [x * spread, y * spread, haloZ]
    })
    // Arc-length spacing avoids bunching small stones near narrow tips.
    const path = new THREE.CurvePath<THREE.Vector3>()
    halo.forEach((point, i) => path.add(new THREE.LineCurve3(new THREE.Vector3(...point), new THREE.Vector3(...halo[(i + 1) % halo.length]))))
    const count = hidden ? 16 : 24
    const haloStones = Array.from({ length: count }, (_, i) => path.getPoint(i / count).toArray() as Point3)
    const haloBridges = claws.map(points => {
      const [x, y] = points[0]
      const angle = Math.atan2(y, x)
      const [gx, gy] = contourAt(gem, angle)
      const spread = hidden ? 0.89 : 1 + 0.055 / Math.hypot(gx, gy)
      return [points[0], [gx * spread, gy * spread, haloZ - haloRadius]] as Point3[]
    })
    return { gem, radius, rail, claws, supports, cathedral, hasHalo, halo, haloStones, haloBridges, haloRadius }
  }, [diamond, carat, setting])

  return (
    <group position={[0, assembly.gem.stoneY, 0]} rotation={HEAD_ROTATION}>
      {assembly.supports.map((points, i) => <Tube key={`support-${i}`} points={points} radius={assembly.cathedral ? 0.055 : 0.05} endRadius={assembly.cathedral ? 0.028 : 0.024} color={color} />)}
      <Tube points={assembly.rail} radius={0.018} color={color} closed linear />
      {assembly.claws.map((points, i) => (
        <group key={`claw-${i}`}>
          <Tube points={points} radius={assembly.radius} color={color} />
          <mesh position={points[points.length - 1]}>
            <sphereGeometry args={[assembly.radius, 16, 12]} />
            <Metal color={color} />
          </mesh>
        </group>
      ))}
      {assembly.hasHalo && (
        <group>
          <Tube points={assembly.halo.map(([x, y, z]): Point3 => [x, y, z - assembly.haloRadius])} radius={0.013} color={color} closed linear />
          {assembly.haloBridges.map((points, i) => <Tube key={`bridge-${i}`} points={points} radius={0.012} color={color} linear />)}
          {assembly.haloStones.map((position, i) => (
            <mesh key={`halo-${i}`} position={position} scale={assembly.haloRadius}>
              <octahedronGeometry args={[1, 0]} />
              <meshPhysicalMaterial color="white" metalness={0} roughness={0.03} transmission={0.8} thickness={2} ior={2.417} envMapIntensity={1} flatShading />
            </mesh>
          ))}
        </group>
      )}
    </group>
  )
}
