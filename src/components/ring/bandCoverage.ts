import { bands, findOption, type BandId } from '../../data/ringOptions'

export const BAND_RADIUS = 1
export const BAND_STONE_RADIUS = 0.032
const FULL_SET_STONE_COUNT = 96

export function bandWidthAt(angle: number) {
  // Radial half-thickness: a slim shank that tapers into the head.
  return 0.075 * (1 - Math.pow(Math.max(0, Math.sin(angle)), 6) * 0.2)
}

export function bandDepthAt(angle: number) {
  // Axial half-width: broader than the thickness, with softened shoulders.
  return 0.115 * (1 - Math.pow(Math.max(0, Math.sin(angle)), 6) * 0.32)
}

export function bandCenterRadiusAt(angle: number) {
  return BAND_RADIUS + 0.035 * Math.pow(Math.max(0, Math.sin(angle)), 8)
}

export function bandOuterRadiusAt(angle: number) {
  return bandCenterRadiusAt(angle) + bandWidthAt(angle)
}

export function getBandStonePlacements(band: BandId) {
  const { coverage } = findOption(bands, band)
  const count = Math.round(FULL_SET_STONE_COUNT * coverage)
  const sweep = coverage * Math.PI * 2
  return Array.from({ length: count }, (_, i) => {
    // Equal-size cells keep spacing constant and avoid duplicate stones at 360°.
    // Partial coverage is centred on the top of the ring, leaving a plain palm.
    const angle = Math.PI / 2 - sweep / 2 + (i + 0.5) * sweep / count
    // The pavilion sits inside the metal; only the girdle and crown emerge.
    const radius = bandOuterRadiusAt(angle) + 0.003
    return {
      angle,
      position: [Math.cos(angle) * radius, Math.sin(angle) * radius, 0] as [number, number, number],
    }
  })
}
