import assert from 'node:assert/strict'
import fs from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
const root = new URL('../', import.meta.url)
const asModule = source => 'data:text/javascript;base64,' + Buffer.from(stripTypeScriptTypes(source)).toString('base64')
const measurementsUrl = asModule(fs.readFileSync(new URL('src/data/gemMeasurements.ts', root), 'utf8'))
const source = fs.readFileSync(new URL('src/components/ring/gemAssembly.ts', root), 'utf8').replace("'../../data/gemMeasurements'", JSON.stringify(measurementsUrl))
const { getGemDimensions, contourAt, prongAngles, HEAD_ROTATION } = await import(asModule(source))
const { gemMeasurements } = await import(measurementsUrl)
const { Vector3, Euler } = await import(new URL('node_modules/three/build/three.module.js', root).href)
const normal = new Vector3(0, 0, 1).applyEuler(new Euler(...HEAD_ROTATION))
assert(normal.distanceTo(new Vector3(0, 1, 0)) < 1e-12)
let configurations = 0
for (const cut of Object.keys(gemMeasurements)) {
  for (const carat of [0.75, 1, 1.5, 2]) {
    const gem = getGemDimensions(cut, carat)
    assert(Math.abs(gem.stoneY - gem.pavilionDepth - 1.082 - 0.045) < 1e-12, `${cut}: culet clearance`)
    const volume = gemMeasurements[cut].volume * gem.modelScale ** 3
    assert(Math.abs(volume - gemMeasurements.round.volume * 0.31 ** 3 * carat) < 1e-12, `${cut}: equal carat volume`)
    for (const count of [4, 6]) {
      const angles = prongAngles(cut, count)
      assert.equal(angles.length, count)
      for (const angle of [...angles, 0, Math.PI]) {
        const [x, y] = contourAt(gem, angle)
        assert(Number.isFinite(x) && Number.isFinite(y))
        const onEdge = gem.contour.some(([ax, ay], i) => {
          const [bx, by] = gem.contour[(i + 1) % gem.contour.length]
          const length = Math.hypot(bx - ax, by - ay)
          const distance = Math.abs((x - ax) * (by - ay) - (y - ay) * (bx - ax)) / length
          const t = ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / length ** 2
          return distance < 1e-8 && t >= -1e-8 && t <= 1 + 1e-8
        })
        assert(onEdge, `${cut}: claw contact must lie on girdle`)
      }
      configurations++
    }
  }
  for (const invalid of [NaN, Infinity, -1, 0]) assert(getGemDimensions(cut, invalid).modelScale > 0)
}
console.log(`Verified head orientation, pavilion clearance, volume scaling and girdle contacts for ${configurations} cut/carat/prong configurations.`)
