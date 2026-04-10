// Shared options type used by every parsing / comparison / range function.
//
// Any falsy value means "no options". Any non-object truthy value means
// { loose: true }. See src/internal/parse-options.js for the coercion.

export interface Options {
  /**
   * Be permissive:
   *   - leading `v`, `=` or whitespace allowed: `v1.2.3`, `=1.2.3`
   *   - prerelease without hyphen: `1.0.0alpha1`
   *   - extra numeric component digits (`NUMERICIDENTIFIERLOOSE`)
   */
  loose?: boolean

  /**
   * Treat prereleases as in-range when matching ranges. By default a
   * prerelease version can only satisfy a comparator that was itself
   * written with the same major.minor.patch and a prerelease tag.
   */
  includePrerelease?: boolean

  /**
   * For coerce(): scan right-to-left instead of left-to-right.
   */
  rtl?: boolean
}

export type OptionsInput = Options | boolean | undefined | null
