import type { DiamondId } from '../../data/ringOptions'
import { gemMeasurements } from '../../data/gemMeasurements'

export type Point3 = [number, number, number]

// Ring: XY shank, +Y outward. Head: XY girdle, +Z table.
export const HEAD_ROTATION: Point3 = [-Math.PI / 2, 0, 0]

export function getGemDimensions(diamond: DiamondId, carat: number) {
  const measurement = gemMeasurements[diamond]
  const safeCarat = Math.max(Number.isFinite(carat) ? carat : 1, 0.01)
  // Preserve each cut's angles and equalize mesh volume at equal carat.
  const modelScale = 0.31 * Math.cbrt(
    safeCarat * gemMeasurements.round.volume / measurement.volume,
  )
  const pavilionDepth = 0.78 * modelScale
  return {
    modelScale,
    halfWidth: measurement.width * modelScale / 2,
    halfLength: measurement.length * modelScale / 2,
    scale: measurement.length * modelScale,
    crownHeight: 0.33 * modelScale,
    pavilionDepth,
    stoneY: 1.082 + pavilionDepth + 0.045,
    galleryZ: -0.3 * modelScale,
    contour: measurement.contour.map(([x, y]) => [x * modelScale, y * modelScale] as [number, number]),
  }
}

export type GemDimensions = ReturnType<typeof getGemDimensions>

// Ray/polygon intersection uses the actual girdle, including corners and tips.
export function contourAt(gem: GemDimensions, angle: number): [number, number] {
  const dx = Math.cos(angle), dy = Math.sin(angle)
  let distance = Infinity
  gem.contour.forEach(([ax, ay], index) => {
    const [bx, by] = gem.contour[(index + 1) % gem.contour.length]
    const ex = bx - ax, ey = by - ay
    const cross = dx * ey - dy * ex
    if (Math.abs(cross) < 1e-10) return
    const t = (ax * ey - ay * ex) / cross
    const u = (ax * dy - ay * dx) / cross
    if (t >= 0 && u >= -1e-8 && u <= 1 + 1e-8) distance = Math.min(distance, t)
  })
  if (!Number.isFinite(distance)) throw new Error('Invalid gemstone contour')
  return [dx * distance, dy * distance]
}

export function prongAngles(diamond: DiamondId, count: 4 | 6): number[] {
  if (diamond === 'pear') return count === 4
    ? [Math.PI / 2, Math.PI * 1.08, Math.PI * 1.5, Math.PI * 1.92]
    : [Math.PI / 2, Math.PI * 0.85, Math.PI * 1.18, Math.PI * 1.5, Math.PI * 1.82, Math.PI * 0.15]
  if (diamond === 'marquise') return count === 4
    ? [Math.PI / 2, Math.PI, Math.PI * 1.5, 0]
    : [Math.PI / 2, Math.PI * 0.85, Math.PI * 1.15, Math.PI * 1.5, Math.PI * 1.85, Math.PI * 0.15]
  return Array.from({ length: count }, (_, i) => Math.PI / count + i * Math.PI * 2 / count)
}
