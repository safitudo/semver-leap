// Contracts for src/internal/*.
// Each bullet = one file's module.exports shape.

// --- constants.js ---------------------------------------------------------
export interface Constants {
  SEMVER_SPEC_VERSION: '2.0.0'
  MAX_LENGTH: 256
  MAX_SAFE_INTEGER: number
  MAX_SAFE_COMPONENT_LENGTH: 16
  MAX_SAFE_BUILD_LENGTH: number
  RELEASE_TYPES: readonly [
    'major', 'premajor', 'minor', 'preminor', 'patch', 'prepatch', 'prerelease'
  ]
  FLAG_INCLUDE_PRERELEASE: 0b001
  FLAG_LOOSE: 0b010
}

// --- debug.js -------------------------------------------------------------
export type Debug = (...args: unknown[]) => void

// --- identifiers.js -------------------------------------------------------
export interface Identifiers {
  compareIdentifiers(a: string | number, b: string | number): -1 | 0 | 1
  rcompareIdentifiers(a: string | number, b: string | number): -1 | 0 | 1
}

// --- parse-options.js -----------------------------------------------------
export type ParseOptions = (options: unknown) => {
  loose?: boolean
  includePrerelease?: boolean
  rtl?: boolean
}

// --- lrucache.js ----------------------------------------------------------
export declare class LRUCache<K = unknown, V = unknown> {
  max: 1000
  map: Map<K, V>
  get(key: K): V | undefined
  set(key: K, value: V | undefined): this
  delete(key: K): boolean
}

// --- re.js ----------------------------------------------------------------
export interface Re {
  re: RegExp[]
  safeRe: RegExp[]
  src: string[]
  safeSrc: string[]
  t: Record<string, number>
  tildeTrimReplace: '$1~'
  caretTrimReplace: '$1^'
  comparatorTrimReplace: '$1$2$3'
}
