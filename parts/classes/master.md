# parts/classes — SemVer, Comparator, Range

The three core classes. They live in `src/classes/` and export via CommonJS `module.exports = ClassName`.

`src/classes/index.js` re-exports all three as `{ SemVer, Comparator, Range }`.

## src/classes/semver.js — `SemVer`

See `schemas/semver.ts` for the full field and method list.

Behaviors the tests enforce:

- **Reuse**: `new SemVer(existing)` returns `existing` when the options match (same `loose` and `includePrerelease`), otherwise re-parses `existing.version` with the new options.
- **Input check**: non-strings throw `TypeError('Invalid version. Must be a string. Got type "<typeof>".')`.
- **Length cap**: strings > `MAX_LENGTH` (256) throw `TypeError('version is longer than 256 characters')`.
- **Parse**: trim the input, then match `safeRe[t.FULL]` (or `safeRe[t.LOOSE]` in loose mode). No match → `TypeError('Invalid Version: <raw>')`.
- **Prerelease numberification**: each `-`-separated prerelease id that is purely `[0-9]+` and < MAX_SAFE_INTEGER becomes a number; others stay strings.
- **Build ids**: dot-split, never numberified.
- **`format()`**: recomputes `this.version = M.m.p[-pre]`. Build is NOT in `.version`.
- **`inc`**: mutates `this` and returns it. Resets `this.raw = this.format()` on success, appending `+build` if there is one. The full set of release semantics is in `schemas/semver.ts`.
- **`compare`**: short-circuits to `0` if the other is a plain string equal to `this.version`; otherwise wraps `other` in a `SemVer` (using `this.options`) and returns `compareMain(other) || comparePre(other)`.
- **`comparePre`**: a version WITH a prerelease is less than the same version WITHOUT one; when both have prereleases, compare element-wise using `compareIdentifiers`; a shorter prerelease list is less than a longer one that shares its prefix.
- **`compareBuild`**: element-wise build id compare using `compareIdentifiers`.

## src/classes/comparator.js — `Comparator`

See `schemas/comparator.ts`. Notes:

- Normalizes input: `.trim().split(/\s+/).join(' ')` so `>  1.2.3` collapses.
- Parses via `safeRe[t.COMPARATOR]` (or `COMPARATORLOOSE`). No match → `TypeError('Invalid comparator: <comp>')`.
- Operator `=` is collapsed to `''`. The canonical `value` is `operator + semver.version`, or `''` for the ANY comparator.
- `ANY` is an unexported `Symbol('SemVer ANY')` exposed through `Comparator.ANY`. `semver === ANY` means "matches any version".
- `test(version)`: strings are wrapped in a `SemVer` using `this.options`; construction failures → `false`. Returns `cmp(version, this.operator, this.semver, this.options)`.
- `intersects(other, options)`:
  - Either operator empty → delegate to a `new Range(...)` test.
  - Special cases: with `includePrerelease`, `<0.0.0-0` intersects nothing. Without, any comparator whose value starts with `<0.0.0` intersects nothing.
  - Same-direction > / < always intersect.
  - Same version and both operators inclusive → intersect.
  - Strictly ordered versions with opposing directions that "cross" each other → intersect.
  - Otherwise → false.

The cyclic Comparator ↔ Range reference is resolved by hoisting the class declaration above the `require('./range')` line (module.exports is set first).

## src/classes/range.js — `Range`

See `schemas/range.ts`. The hard parts:

### Construction

- A `Range` input with matching options is returned as-is.
- A `Range` with different options is re-built from `range.raw`.
- A `Comparator` input is wrapped: `set = [[comp]]`, `raw = comp.value`.
- Otherwise: collapse whitespace, split on `||`, parse each half with `parseRange`, drop empty results, then:
  - If only one set → use it.
  - If multiple sets and the first is a null set (`<0.0.0-0`) only, drop null sets (but keep at least one).
  - If any set is the "any" set (single empty-value comparator), use that alone.

### `parseRange(range)`

Memoized in a 1000-entry LRU keyed by `"<flags>:<range>"` where flags is `(includePrerelease?FLAG_INCLUDE_PRERELEASE:0) | (loose?FLAG_LOOSE:0)`.

Steps in order:

1. **Hyphen ranges**: `1.2.3 - 2.3.4` → `>=1.2.3 <=2.3.4`. See `hyphenReplace` below.
2. **Comparator trim**: `> 1.2.3` → `>1.2.3` (via `COMPARATORTRIM` + `comparatorTrimReplace`).
3. **Tilde trim**: `~ 1.2.3` → `~1.2.3`.
4. **Caret trim**: `^ 1.2.3` → `^1.2.3`.
5. Split on whitespace, run `parseComparator` on each, join with spaces, split on whitespace again.
6. `replaceGTE0` — `>=0.0.0` (or `>=0.0.0-0` in `includePrerelease` mode) becomes `''` (the any comparator).
7. In loose mode, drop any token that isn't a valid `COMPARATORLOOSE`.
8. Build a Map keyed by `comp.value` to dedupe. If any comp is the null set, return only `[comp]`. If the map has `''` AND other entries, drop the `''`.

### Desugaring (`parseComparator`)

1. Strip `+build` metadata.
2. `replaceCaret`: `^1.2.3` → `>=1.2.3 <2.0.0-0`, with 0.0.x / 0.x.y special cases from the spec.
3. `replaceTilde`: `~1.2.3` → `>=1.2.3 <1.3.0-0`.
4. `replaceXRanges`: `1.2.x` → `>=1.2.0 <1.3.0-0`; `*` → `''`; `>1` → `>=2.0.0`, `<=1.2` → `<1.3.0`, etc.
5. `replaceStars`: strip stars.

Use `safeRe` for all matches. The regex operators (`CARET`, `TILDE`, …) capture `(operator, M, m, p, pr)`.

### `hyphenReplace(incPr)` (curried)

Given `($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr)`:

- `from`: `isX(fM)` → `''`; `isX(fm)` → `>=fM.0.0[-0]`; `isX(fp)` → `>=fM.fm.0[-0]`; `fpr` present → `>=from` (raw); else → `>=from[-0]`.
  - `-0` suffix is added only when `incPr` is truthy.
- `to`: `isX(tM)` → `''`; `isX(tm)` → `<(tM+1).0.0-0`; `isX(tp)` → `<tM.(tm+1).0-0`; `tpr` present → `<=tM.tm.tp-tpr`; `incPr` → `<tM.tm.(tp+1)-0`; else → `<=to`.

### `Range.test(version)` and the prerelease rule

Walk `this.set`. For each AND-group, every Comparator must `test(version)`. Additionally, when `version.prerelease.length > 0` and `!options.includePrerelease`, reject the group unless some comparator in the group was itself written with a prerelease and shares `major.minor.patch` with `version`.
