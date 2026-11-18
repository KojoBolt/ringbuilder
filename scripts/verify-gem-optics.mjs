import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const audit = fileURLToPath(new URL('./verify-round-optics.mjs', import.meta.url))
for (const cut of ['round', 'oval', 'radiant', 'emerald', 'pear', 'marquise', 'cushion', 'princess']) {
  const result = spawnSync(process.execPath, [audit, cut], { stdio: 'inherit' })
  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status ?? 1)
}
