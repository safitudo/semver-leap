// Root public API surface. The shape of `require('semver-leap')`.
//
// This is the single authoritative list of exports that `src/index.js`
// must provide. Lazy loading is allowed (and expected) but the enumerated
// property set must be present once accessed.

import { Options, OptionsInput } from './options'
import { SemVer, ReleaseType, PrereleaseId } from './semver'
import { Comparator } from './comparator'
import { Range } from './range'

export type Operator =
  | '' | '=' | '==' | '==='
  | '!=' | '!=='
  | '>' | '>=' | '<' | '<='

/** Release types accepted by inc() and returned by diff(). */
export type ReleaseTypes = readonly [
  'major', 'premajor', 'minor', 'preminor', 'patch', 'prepatch', 'prerelease'
]

export interface SemverModule {
  // --- classes ---
  SemVer: typeof SemVer
  Comparator: typeof Comparator
  Range: typeof Range

  // --- parse / validate ---
  parse(version: unknown, options?: OptionsInput, throwErrors?: boolean): SemVer | null
  valid(version: unknown, options?: OptionsInput): string | null
  clean(version: string, options?: OptionsInput): string | null
  coerce(
    version: unknown,
    options?: Options & { rtl?: boolean; includePrerelease?: boolean }
  ): SemVer | null

  // --- version fields ---
  major(v: string | SemVer, options?: OptionsInput): number
  minor(v: string | SemVer, options?: OptionsInput): number
  patch(v: string | SemVer, options?: OptionsInput): number
  prerelease(v: string | SemVer, options?: OptionsInput): PrereleaseId[] | null

  // --- compare ---
  compare(a: string | SemVer, b: string | SemVer, loose?: OptionsInput): -1 | 0 | 1
  rcompare(a: string | SemVer, b: string | SemVer, loose?: OptionsInput): -1 | 0 | 1
  compareLoose(a: string | SemVer, b: string | SemVer): -1 | 0 | 1
  compareBuild(a: string | SemVer, b: string | SemVer, loose?: OptionsInput): -1 | 0 | 1
  eq(a: string | SemVer, b: string | SemVer, loose?: OptionsInput): boolean
  neq(a: string | SemVer, b: string | SemVer, loose?: OptionsInput): boolean
  gt(a: string | SemVer, b: string | SemVer, loose?: OptionsInput): boolean
  gte(a: string | SemVer, b: string | SemVer, loose?: OptionsInput): boolean
  lt(a: string | SemVer, b: string | SemVer, loose?: OptionsInput): boolean
  lte(a: string | SemVer, b: string | SemVer, loose?: OptionsInput): boolean
  cmp(a: string | SemVer, op: Operator, b: string | SemVer, loose?: OptionsInput): boolean
  compareIdentifiers(a: string | number, b: string | number): -1 | 0 | 1
  rcompareIdentifiers(a: string | number, b: string | number): -1 | 0 | 1
  sort<T extends string | SemVer>(list: T[], loose?: OptionsInput): T[]
  rsort<T extends string | SemVer>(list: T[], loose?: OptionsInput): T[]

  // --- manipulate ---
  inc(
    version: string | SemVer,
    release: ReleaseType,
    options?: OptionsInput | string,
    identifier?: string,
    identifierBase?: string | false
  ): string | null
  diff(v1: string | SemVer, v2: string | SemVer): ReleaseType | null

  // --- ranges ---
  validRange(range: string | Range, options?: OptionsInput): string | null
  satisfies(version: string | SemVer, range: string | Range, options?: OptionsInput): boolean
  maxSatisfying(
    versions: (string | SemVer)[], range: string | Range, options?: OptionsInput
  ): string | null
  minSatisfying(
    versions: (string | SemVer)[], range: string | Range, options?: OptionsInput
  ): string | null
  minVersion(range: string | Range, options?: OptionsInput): SemVer | null
  gtr(version: string | SemVer, range: string | Range, options?: OptionsInput): boolean
  ltr(version: string | SemVer, range: string | Range, options?: OptionsInput): boolean
  outside(
    version: string | SemVer,
    range: string | Range,
    hilo: '>' | '<',
    options?: OptionsInput
  ): boolean
  intersects(r1: string | Range, r2: string | Range, options?: OptionsInput): boolean
  simplifyRange(
    versions: (string | SemVer)[], range: string | Range, options?: OptionsInput
  ): string | Range
  subset(sub: string | Range, dom: string | Range, options?: Options): boolean
  toComparators(range: string | Range, options?: OptionsInput): string[][]

  // --- constants / regex bank ---
  SEMVER_SPEC_VERSION: '2.0.0'
  RELEASE_TYPES: ReleaseTypes
  re: readonly RegExp[]
  src: readonly string[]
  tokens: Readonly<Record<string, number>>
}
