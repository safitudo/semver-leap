# parts/internal — foundation modules

These are the leaf modules that everything else in `src/` depends on. They must not import anything from `classes/`, `functions/`, or `ranges/`.

Target files under `src/internal/`:

- **`constants.js`** — named exports only: `SEMVER_SPEC_VERSION = '2.0.0'`, `MAX_LENGTH = 256`, `MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER`, `MAX_SAFE_COMPONENT_LENGTH = 16`, `MAX_SAFE_BUILD_LENGTH = MAX_LENGTH - 6`, `RELEASE_TYPES = ['major','premajor','minor','preminor','patch','prepatch','prerelease']`, `FLAG_INCLUDE_PRERELEASE = 0b001`, `FLAG_LOOSE = 0b010`.

- **`debug.js`** — default export a function. If `process.env.NODE_DEBUG` matches `/\bsemver\b/i`, it is `(...args) => console.error('SEMVER', ...args)`; otherwise it is a no-op. Must not throw in non-Node environments (guard `typeof process`).

- **`identifiers.js`** — exports `compareIdentifiers(a, b)` and `rcompareIdentifiers(a, b)`. Numeric identifiers compare as numbers. A numeric-only id is ALWAYS less than a non-numeric id (per the spec). Returns -1/0/1. `rcompareIdentifiers` is just `compareIdentifiers(b, a)`.

- **`parse-options.js`** — default export a function that normalizes the user's options argument:
  - falsy → frozen `{}` singleton
  - non-object truthy (e.g. `true`, `'loose'`) → frozen `{ loose: true }` singleton
  - object → returned as-is (not cloned, not frozen)
  The two singletons are created once at module load and reused.

- **`lrucache.js`** — default export a `LRUCache` class with `max = 1000`. Methods: `get(key)`, `set(key, value)`, `delete(key)`. On `get`, a hit bumps the entry to the MRU position. On `set`, evicts the LRU entry when full. `set` is a no-op for `undefined` values.

- **`re.js`** — builds and exports the regex bank. Exported on `module.exports`:
  - `re: RegExp[]` — strict forms, unbounded
  - `safeRe: RegExp[]` — same patterns but with bounded quantifiers
  - `src: string[]` — raw source strings for `re`
  - `safeSrc: string[]` — raw source strings for `safeRe`
  - `t: Record<string, number>` — token-name → index map
  - `tildeTrimReplace`, `caretTrimReplace`, `comparatorTrimReplace` — string replacement patterns used by `Range`

  Token names (populated in this order, indices are sequential from 0):
  `NUMERICIDENTIFIER`, `NUMERICIDENTIFIERLOOSE`, `NONNUMERICIDENTIFIER`, `MAINVERSION`, `MAINVERSIONLOOSE`, `PRERELEASEIDENTIFIER`, `PRERELEASEIDENTIFIERLOOSE`, `PRERELEASE`, `PRERELEASELOOSE`, `BUILDIDENTIFIER`, `BUILD`, `FULLPLAIN`, `FULL`, `LOOSEPLAIN`, `LOOSE`, `GTLT`, `XRANGEIDENTIFIERLOOSE`, `XRANGEIDENTIFIER`, `XRANGEPLAIN`, `XRANGEPLAINLOOSE`, `XRANGE`, `XRANGELOOSE`, `COERCEPLAIN`, `COERCE`, `COERCEFULL`, `COERCERTL`, `COERCERTLFULL`, `LONETILDE`, `TILDETRIM`, `TILDE`, `TILDELOOSE`, `LONECARET`, `CARETTRIM`, `CARET`, `CARETLOOSE`, `COMPARATORLOOSE`, `COMPARATOR`, `COMPARATORTRIM`, `HYPHENRANGE`, `HYPHENRANGELOOSE`, `STAR`, `GTE0`, `GTE0PRE`.

  Patterns must match the semver 2.0.0 spec plus the npm loose variants. See the original `internal/re.js` for the definitive regexes.

## ReDoS safety — important

`safeRe` must be built by string-substituting three greedy quantifiers with bounded versions:

- `\s*` → `\s{0,1}`, `\s+` → `\s{1,1}` (whitespace is pre-normalized; one char max)
- `\d*` → `\d{0,256}`, `\d+` → `\d{1,256}`
- `[a-zA-Z0-9-]*` → `[a-zA-Z0-9-]{0,250}`, `[a-zA-Z0-9-]+` → `[a-zA-Z0-9-]{1,250}`

`tests/internal/re.js` asserts that no `safeRe` pattern still contains `\s+` or `\s*`.

Trim-replace patterns:
- `tildeTrimReplace = '$1~'`
- `caretTrimReplace = '$1^'`
- `comparatorTrimReplace = '$1$2$3'`

The `TILDETRIM`, `CARETTRIM`, `COMPARATORTRIM`, `COERCERTL`, `COERCERTLFULL` tokens must be compiled with the global flag.
