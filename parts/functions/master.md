# parts/functions — top-level version functions

Thin wrappers around `SemVer` methods plus the parse/clean/coerce/inc/diff helpers. One file per function in `src/functions/`, each `module.exports = fn`.

## Parse and validate

- **`parse.js`** — `parse(version, options, throwErrors = false)`. If `version` is already a `SemVer`, return it. Otherwise try `new SemVer(version, options)` and return the instance. On any thrown error: if `throwErrors` → rethrow; else if the error is not a TypeError → rethrow; else → return `null`. If the input is not a non-empty string and `throwErrors` is false, return `null` without constructing.

- **`valid.js`** — `valid(version, options)`. Call `parse(version, options)`. Return `v ? v.version : null`.

- **`clean.js`** — `clean(version, options)`. Trim, strip a leading `[=v]+`, then `parse`. Return the resulting `.version`, or `null` if parse fails.

- **`coerce.js`** — `coerce(version, options)`. If `version` is a `SemVer`, return it. Number inputs are stringified. Non-strings return `null`. Picks `COERCE`/`COERCEFULL`/`COERCERTL`/`COERCERTLFULL` based on `options.includePrerelease` and `options.rtl`. When RTL, runs `exec` in a loop advancing `lastIndex` until no further match — returns the LAST match. Builds `M.m.p` from the capture groups, defaulting missing parts to `0`, appends `-pre` and `+build` when the "full" variant matched them, and returns `parse(...)`.

## Version fields

- **`major.js`** — `major(v, options) = new SemVer(v, options).major`
- **`minor.js`** — same for `.minor`
- **`patch.js`** — same for `.patch`
- **`prerelease.js`** — `const p = parse(v, opts); return p && p.prerelease.length ? p.prerelease : null`

## Compare

- **`compare.js`** — `compare(a, b, loose) = new SemVer(a, loose).compare(new SemVer(b, loose))`
- **`rcompare.js`** — `rcompare(a, b, loose) = compare(b, a, loose)`
- **`compare-loose.js`** — `compareLoose(a, b) = compare(a, b, true)`
- **`compare-build.js`** — `new SemVer(a, loose).compare(versionB) || versionA.compareBuild(versionB)` where both sides are SemVer'd.
- **`eq`/`neq`/`gt`/`gte`/`lt`/`lte.js`** — one-liners over `compare()`.
- **`cmp.js`** — dispatches by operator string:
  - `'===' , '!=='`: object-identity-ish compare on the `.version` strings (SemVers compared by their version property).
  - `'', '=', '=='` → `eq`
  - `'!='` → `neq`
  - `'>'` → `gt`, `'>='` → `gte`, `'<'` → `lt`, `'<='` → `lte`
  - Anything else → `throw new TypeError('Invalid operator: ' + op)`.

## Sort

- **`sort.js`** — `sort(list, loose) = list.sort((a,b) => compareBuild(a, b, loose))`
- **`rsort.js`** — `rsort(list, loose) = list.sort((a,b) => compareBuild(b, a, loose))`

## Manipulate

- **`inc.js`** — `inc(version, release, options, identifier, identifierBase)`. Options are parameter-overloaded: if `options` is a string, it shifts into `identifier`, and `options` becomes `{}`. Returns `new SemVer(version, options).inc(release, identifier, identifierBase).version`. Returns `null` on thrown errors (not rethrown).

- **`diff.js`** — `diff(v1, v2)`.
  - Equal versions → `null`.
  - Determine which side is higher (`hi`) and which is lower (`lo`).
  - If `hi.prerelease.length` → the change is a `pre*`:
    - `lo.prerelease.length` and the main parts match → `'prerelease'`.
    - Otherwise the change is `'pre' + <component that differs at the main level>`, e.g. `premajor`/`preminor`/`prepatch`. If the main parts match → still `'prerelease'`.
  - Otherwise compare `major` → `'major'`, `minor` → `'minor'`, else `'patch'`.
  - If `lo.prerelease.length` and the bumped component is the first differing main part with patch === 0 minor === 0 etc., use the non-pre variant. See the original `functions/diff.js` for the exact logic.

## Range-adjacent

- **`satisfies.js`** — `satisfies(version, range, options)`. Wrap `range` in `new Range(range, options)`; if that throws → `false`. Return `r.test(version)`.
