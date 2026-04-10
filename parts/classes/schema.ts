// Re-exports from the root schemas — a single place for the classes part
// to point at its contracts.

export { SemVer, ReleaseType, PrereleaseId } from '../../schemas/semver'
export { Comparator, ANY } from '../../schemas/comparator'
export { Range } from '../../schemas/range'

// src/classes/index.js
export interface ClassesIndex {
  SemVer: typeof import('../../schemas/semver').SemVer
  Comparator: typeof import('../../schemas/comparator').Comparator
  Range: typeof import('../../schemas/range').Range
}
