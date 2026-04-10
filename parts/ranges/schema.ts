// Signatures for src/ranges/*.

import { OptionsInput, Options } from '../../schemas/options'
import { SemVer } from '../../schemas/semver'
import { Range } from '../../schemas/range'

type V = string | SemVer
type R = string | Range

export type ValidRange = (range: R, options?: OptionsInput) => string | null
export type MaxSatisfying = (versions: V[], range: R, options?: OptionsInput) => string | null
export type MinSatisfying = (versions: V[], range: R, options?: OptionsInput) => string | null
export type MinVersion = (range: R, options?: OptionsInput) => SemVer | null
export type Outside = (version: V, range: R, hilo: '>' | '<', options?: OptionsInput) => boolean
export type Gtr = (version: V, range: R, options?: OptionsInput) => boolean
export type Ltr = (version: V, range: R, options?: OptionsInput) => boolean
export type Intersects = (r1: R, r2: R, options?: OptionsInput) => boolean
export type ToComparators = (range: R, options?: OptionsInput) => string[][]
export type SimplifyRange = (versions: V[], range: R, options?: OptionsInput) => string | Range
export type Subset = (sub: R, dom: R, options?: Options) => boolean
