# parts/ranges — range utilities

Higher-level helpers that operate on `Range` objects. One file per helper under `src/ranges/`, each `module.exports = fn` (or `module.exports = fn.default`-style for `simplify.js` — see below).

## Files

- **`valid.js`** — `validRange(range, options)`. `try { new Range(range, options) } catch { return null }`. On success return `r.range || '*'`.

- **`satisfies.js`** is under `functions/`, not here — see `parts/functions/master.md`.

- **`max-satisfying.js`** — `maxSatisfying(versions, range, options)`. Build a `Range` (catch → null). Walk `versions`; track the max `SemVer` that the range accepts, using `.compare(current) === 1` to replace.

- **`min-satisfying.js`** — same but tracks the minimum; replacement uses `.compare(current) === -1`.

- **`min-version.js`** — `minVersion(range, options)`. Produces the lowest version that would satisfy the given range.
  - Start with `minver = new SemVer('0.0.0')`. If the range passes, return it.
  - Otherwise try `minver = new SemVer('0.0.0-0')` and test again.
  - Otherwise walk every comparator in every set. For each comparator:
    - `''`/`>=` → candidate is `comparator.semver`.
    - `>` → candidate is the comparator.semver with its prerelease bumped (append `0` if none) OR patch bumped if not prerelease. Clone into a new SemVer.
    - `<`/`<=` → skipped (they define upper bounds).
  - Track the overall minimum candidate with `compare()`.
  - After the loop, confirm the chosen minver still satisfies the whole range. Return `null` if not.

- **`outside.js`** — `outside(version, range, hilo, options)` where `hilo` is `'>'` or `'<'`.
  - Turn `version` into a SemVer and `range` into a Range.
  - If `range.test(version)` → `false`.
  - Pick comparators depending on direction:
    - hilo = `'>'`: pass requires `gtfn = gt`, `ltefn = lte`, `ltfn = lt`, compare operator = `'>'`.
    - hilo = `'<'`: the opposites.
  - For each set in `range.set`:
    - Find `high` (most-restrictive upper bound) and `low` (most-restrictive lower bound) using the direction's comparator functions.
    - If hilo = `'>'`: the version must be strictly greater than every `high`. A `<=` high with an equal version means NOT outside.
    - If hilo = `'<'`: symmetric.
  - See `_original/ranges/outside.js` for the canonical logic.

- **`gtr.js`** — `gtr(version, range, options) = outside(version, range, '>', options)`.
- **`ltr.js`** — `ltr(version, range, options) = outside(version, range, '<', options)`.

- **`intersects.js`** — `intersects(r1, r2, options)`. `new Range(r1, options).intersects(new Range(r2, options), options)`.

- **`to-comparators.js`** — `toComparators(range, options) = new Range(range, options).set.map(comp => comp.map(c => c.value).join(' ').split(' '))`. Returns a 2-D array of strings.

- **`simplify.js`** — module default export a function `(versions, range, options)`. Sorted-walk the versions. Accumulate contiguous runs of versions that satisfy the range, emitting them as hyphen ranges (`a - b`), `>=a`, `<=b`, `*`, or exact versions, joined with `||`. If the resulting string is shorter than `range.toString()` and also matches the same versions, return the simplified string; otherwise return the original range string.

- **`subset.js`** — `subset(sub, dom, options = {})`. True iff every version satisfying `sub` also satisfies `dom`. Parse both as Ranges. `sub` is a subset of `dom` iff every comparator-set in `sub` is a subset of at least one comparator-set in `dom`. The `simpleSubset(subSet, domSet)` helper handles the cases:
  - empty sub set + empty dom set → true
  - sub set contains `<0.0.0-0` → true (it's the null set)
  - dom set contains `<0.0.0-0` → false unless sub is also null
  - Otherwise compare `>`/`>=` lower bounds via `higherGT` and `<`/`<=` upper bounds via `lowerLT`.
  - Also handle "equality" sets (a single pinned version) by direct test.
  - Honor `options.includePrerelease` when deciding whether a prerelease on the sub side is allowed.
  - See `_original/ranges/subset.js` — the logic is dense; implement it behavior-for-behavior.
