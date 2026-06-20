import { createRequire } from 'node:module'
import { resolve } from 'node:path'

const rootRequire = createRequire(resolve(process.cwd(), 'package.json'))

/** Load CommonJS backend modules by path (supports `#backend/...` alias). */
export function backendRequire (modulePath: string) {
  const rel = modulePath.startsWith('#backend/')
    ? modulePath.slice('#backend/'.length)
    : modulePath.replace(/^\.\.(\/\.\.)*\/backend\//, '')
  return rootRequire(resolve(process.cwd(), 'backend', rel))
}
