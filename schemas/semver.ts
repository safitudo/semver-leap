// The SemVer class — a parsed semantic version.
//
// Contract is exactly that of node-semver's classes/semver.js.

import { Options } from './options'

export type PrereleaseId = string | number
export type ReleaseType =
  | 'major' | 'premajor'
  | 'minor' | 'preminor'
  | 'patch' | 'prepatch'
  | 'prerelease'
  | 'release'
  | 'pre'   // internal, used by the other pre* types

export declare class SemVer {
  /** Original options (frozen empty object if none were passed). */
  options: Options
  loose: boolean
  includePrerelease: boolean

  /** Raw input string (or the stringified version if constructed from a SemVer). */
  raw: string
  /** Normalized `major.minor.patch[-prerelease]` form. Build is NOT in `version`. */
  version: string

  major: number
  minor: number
  patch: number
  /** Dot-split prerelease ids. Numeric segments become numbers. */
  prerelease: PrereleaseId[]
  /** Dot-split build metadata ids. Always strings. Does not affect compare(). */
  build: string[]

  /**
   * @param version  a version string, or another SemVer (returned as-is if
   *                 the options match; otherwise re-parsed from its .version).
   * @throws TypeError on non-strings, strings > 256 chars, or unparseable input.
   */
  constructor(version: string | SemVer, options?: Options | boolean)

  /** Recompute `version` from the numeric fields + prerelease. Returns it. */
  format(): string
  toString(): string

  /** -1 / 0 / 1 — main + prerelease (build ignored). */
  compare(other: string | SemVer): -1 | 0 | 1
  /** -1 / 0 / 1 — major/minor/patch only. */
  compareMain(other: string | SemVer): -1 | 0 | 1
  /** -1 / 0 / 1 — prerelease identifier compare. A non-prerelease > a prerelease. */
  comparePre(other: string | SemVer): -1 | 0 | 1
  /** -1 / 0 / 1 — build identifier compare. */
  compareBuild(other: string | SemVer): -1 | 0 | 1

  /**
   * Mutate this SemVer by incrementing it.
   *
   * Release semantics (match node-semver exactly):
   *   - major: 1.2.3 → 2.0.0, but 1.0.0-5 → 1.0.0 (pre-major collapses)
   *   - minor: 1.2.3 → 1.3.0, but 1.2.0-5 → 1.2.0
   *   - patch: 1.2.3 → 1.2.4, but 1.2.3-5 → 1.2.3
   *   - premajor / preminor / prepatch: bump the corresponding component
   *     to the next value and immediately add a `-0` (or identifier-based)
   *     prerelease.
   *   - prerelease: if not already a prerelease, equivalent to prepatch;
   *     otherwise bumps the rightmost numeric prerelease id, or pushes a
   *     new one if none exists. Respects `identifier` and `identifierBase`.
   *   - release: drops the prerelease. Throws if there wasn't one.
   *
   * Throws on unknown release type or invalid identifier.
   */
  inc(release: ReleaseType, identifier?: string, identifierBase?: string | false): this
}
