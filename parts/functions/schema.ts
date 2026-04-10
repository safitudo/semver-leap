// Signatures for every file in src/functions/*.
// All functions are default-style CommonJS (`module.exports = fn`).

import { OptionsInput, Options } from '../../schemas/options'
import { SemVer, PrereleaseId, ReleaseType } from '../../schemas/semver'

export type Cmp = -1 | 0 | 1
export type V = string | SemVer
export type Operator =
  | '' | '=' | '==' | '==='
  | '!=' | '!=='
  | '>' | '>=' | '<' | '<='

export type Parse = (version: unknown, options?: OptionsInput, throwErrors?: boolean) => SemVer | null
export type Valid = (version: unknown, options?: OptionsInput) => string | null
export type Clean = (version: string, options?: OptionsInput) => string | null
export type Coerce = (
  version: unknown,
  options?: Options & { rtl?: boolean; includePrerelease?: boolean }
) => SemVer | null

export type Major = (v: V, options?: OptionsInput) => number
export type Minor = (v: V, options?: OptionsInput) => number
export type Patch = (v: V, options?: OptionsInput) => number
export type Prerelease = (v: V, options?: OptionsInput) => PrereleaseId[] | null

export type Compare = (a: V, b: V, options?: OptionsInput) => Cmp
export type RCompare = Compare
export type CompareLoose = (a: V, b: V) => Cmp
export type CompareBuild = Compare
export type Eq = (a: V, b: V, options?: OptionsInput) => boolean
export type Neq = Eq
export type Gt = Eq
export type Gte = Eq
export type Lt = Eq
export type Lte = Eq
export type Cmpfn = (a: V, op: Operator, b: V, options?: OptionsInput) => boolean

export type Sort = <T extends V>(list: T[], options?: OptionsInput) => T[]
export type RSort = Sort

export type Inc = (
  version: V,
  release: ReleaseType,
  options?: OptionsInput | string,
  identifier?: string,
  identifierBase?: string | false
) => string | null

export type Diff = (v1: V, v2: V) => ReleaseType | null

export type Satisfies = (version: V, range: unknown, options?: OptionsInput) => boolean
