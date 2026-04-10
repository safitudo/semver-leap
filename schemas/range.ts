// The Range class — a set of comparator sets, joined by AND within a set
// and OR between sets. Desugars tildes, carets, x-ranges, hyphen ranges,
// and stars into plain Comparators.

import { Options } from './options'
import { SemVer } from './semver'
import { Comparator } from './comparator'

export declare class Range {
  options: Options
  loose: boolean
  includePrerelease: boolean

  /** Raw input with collapsed whitespace. */
  raw: string
  /**
   * Two-dimensional comparator set. `set[i]` is an AND-group; the whole
   * range matches if ANY `set[i]` matches in full.
   */
  set: Comparator[][]

  constructor(range: string | Range | Comparator, options?: Options | boolean)

  /** Lazily-built canonical string representation (set joined with '||' + ' '). */
  readonly range: string
  format(): string
  toString(): string

  /** Desugar one AND-group string into an array of Comparators. Memoized. */
  parseRange(range: string): Comparator[]

  /** True if some set in `this` overlaps some set in `range`. */
  intersects(range: Range, options?: Options | boolean): boolean

  /**
   * True if `version` satisfies ANY AND-group. A prerelease version may
   * only satisfy a group that was itself written with a matching
   * major.minor.patch-pre, unless `options.includePrerelease` is set.
   */
  test(version: string | SemVer): boolean
}
