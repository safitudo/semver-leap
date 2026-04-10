// The Comparator class — a single `<op><version>` predicate.
// Examples: `>=1.2.3`, `<2.0.0-0`, `1.0.0` (implicit =), `` (empty → any).

import { Options } from './options'
import { SemVer } from './semver'

/** Sentinel singleton used for the "any version" comparator. */
export const ANY: unique symbol

export declare class Comparator {
  static readonly ANY: typeof ANY

  options: Options
  loose: boolean

  /** One of `''`, `'='`, `'>'`, `'>='`, `'<'`, `'<='`. `=` is normalized to `''`. */
  operator: '' | '>' | '>=' | '<' | '<='
  /** The parsed SemVer, or the ANY sentinel for the empty comparator. */
  semver: SemVer | typeof ANY
  /** Canonical string form: `operator + semver.version`, or `''` for ANY. */
  value: string

  constructor(comp: string | Comparator, options?: Options | boolean)

  /** Parse a comparator source string; sets operator/semver/value. */
  parse(comp: string): void

  toString(): string

  /** True if `version` satisfies this comparator. Invalid versions → false. */
  test(version: string | SemVer): boolean

  /**
   * True if there exists any version that satisfies both `this` and `comp`.
   * Throws if `comp` is not a Comparator.
   */
  intersects(comp: Comparator, options?: Options | boolean): boolean
}
