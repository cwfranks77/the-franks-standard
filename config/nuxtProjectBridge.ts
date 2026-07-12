import { existsSync } from 'node:fs'
import { globSync } from 'node:fs'
import { relative, resolve } from 'node:path'
import type { Plugin } from 'vite'

const MODULE_PREFIXES = ['~/', '@/']

function moduleSubpath (id: string, folder: string): string | null {
  for (const prefix of MODULE_PREFIXES) {
    const head = `${prefix}${folder}/`
    if (id === head.slice(0, -1) || id.startsWith(head)) {
      return id.slice(prefix.length)
    }
  }
  return null
}

function resolveInDirs (rootDir: string, dirs: string[], subpath: string): string | null {
  for (const dir of dirs) {
    const candidate = resolve(rootDir, dir, subpath)
    if (existsSync(candidate)) {
      return candidate
    }
  }
  return null
}

function resolveProjectSubpath (
  rootDir: string,
  dirs: string[],
  subpath: string,
): string | null {
  return resolveInDirs(rootDir, dirs, subpath)
}

function normalizePathSlashes (path: string): string {
  return path.replace(/\\/g, '/').replace(/\/+/g, '/')
}

function resolveLegacyRootModule (
  rootDir: string,
  id: string,
  folder: string,
  dirs: string[],
): string | null {
  const normalized = normalizePathSlashes(id)
  const rootPrefix = normalizePathSlashes(rootDir)
  const legacyPrefix = `${rootPrefix}/${folder}/`
  if (!normalized.startsWith(legacyPrefix)) {
    return null
  }
  if (existsSync(id)) {
    return null
  }
  const subpath = normalized.slice(legacyPrefix.length)
  return resolveProjectSubpath(rootDir, dirs, subpath)
}

export function createProjectModuleResolver (rootDir: string): Plugin {
  const utilsDirs = [
    'bc-performance-audio/src/utils',
    'franks-standard/utils',
    'franks-standard/src/utils',
    'utils',
  ]
  const componentDirs = [
    'bc-performance-audio/src/components',
    'franks-standard/components',
    'franks-standard/src/components',
    'components',
  ]
  const composableDirs = [
    'bc-performance-audio/src/composables',
    'franks-standard/composables',
    'franks-standard/src/composables',
    'composables',
  ]
  const assetDirs = [
    'bc-performance-audio/src/assets',
    'franks-standard/src/assets',
    'assets',
  ]

  return {
    name: 'franks-bc-project-module-resolver',
    enforce: 'pre',
    resolveId (id) {
      const utilsPath = moduleSubpath(id, 'utils')
      if (utilsPath) {
        return resolveProjectSubpath(rootDir, utilsDirs, utilsPath)
      }
      const legacyUtils = resolveLegacyRootModule(rootDir, id, 'utils', utilsDirs)
      if (legacyUtils) return legacyUtils

      const componentPath = moduleSubpath(id, 'components')
      if (componentPath) {
        return resolveProjectSubpath(rootDir, componentDirs, componentPath)
      }
      const legacyComponents = resolveLegacyRootModule(rootDir, id, 'components', componentDirs)
      if (legacyComponents) return legacyComponents

      const composablePath = moduleSubpath(id, 'composables')
      if (composablePath) {
        return resolveProjectSubpath(rootDir, composableDirs, composablePath)
      }
      const legacyComposables = resolveLegacyRootModule(rootDir, id, 'composables', composableDirs)
      if (legacyComposables) return legacyComposables

      const assetPath = moduleSubpath(id, 'assets')
      if (assetPath) {
        return resolveProjectSubpath(rootDir, assetDirs, assetPath)
      }
      const legacyAssets = resolveLegacyRootModule(rootDir, id, 'assets', assetDirs)
      if (legacyAssets) return legacyAssets

      return null
    },
  }
}

export function filePathToRoute (relativeFile: string): string {
  let path = relativeFile
    .replace(/\\/g, '/')
    .replace(/\.vue$/, '')
    .replace(/\/index$/, '')

  if (!path) {
    return '/'
  }

  const segments = path.split('/').map((segment) => {
    if (segment.startsWith('[') && segment.endsWith(']')) {
      const inner = segment.slice(1, -1)
      if (inner.startsWith('...')) {
        return `:${inner.slice(3)}(.*)*`
      }
      return `:${inner}`
    }
    return segment
  })

  return `/${segments.join('/')}`
}

export function collectPagesFromDir (pagesRoot: string, rootDir: string) {
  if (!existsSync(pagesRoot)) {
    return []
  }

  return globSync('**/*.vue', { cwd: pagesRoot }).map((relativeFile) => ({
    path: filePathToRoute(relativeFile),
    file: resolve(pagesRoot, relativeFile),
    name: relative(rootDir, resolve(pagesRoot, relativeFile)).replace(/\\/g, '/'),
  }))
}

/** On bcpoweraudio.com the Franks marketplace shell must not register — BC Audio owns `/`. */
export function filterFranksPagesForBcPrimary<T extends { path: string }> (_pages: T[]): T[] {
  return []
}
