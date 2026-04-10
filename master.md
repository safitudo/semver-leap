# semver — semantic version parser (LEAP)

This is a LEAP port of [node-semver](https://github.com/npm/node-semver), the semantic version parser used by npm. It implements **semver spec 2.0.0** plus the npm-flavored extensions (loose mode, hyphen ranges, tilde/caret/X-ranges, coerce, etc.).

The whole library is pure JavaScript (CommonJS), no build step, runs on Node ≥ 10.

## Intent

Build a CommonJS module that parses, compares, and range-matches semantic versions with full behavioral compatibility with `node-semver` v7.7.4. Every behavior described in the original [semver(1) man page](https://github.com/npm/node-semver#readme) must be preserved — the tests in `tests/` are the authority.

## Public API

The root `src/index.js` must export the following names (see `schemas/index.ts` for the complete contract):

**Classes**
- `SemVer` — parsed version object
- `Comparator` — single comparator (e.g. `>=1.2.3`)
- `Range` — set of comparators joined by `&&`/`||`

**Parse / validate**
- `parse(version, options?, throwErrors?)` → `SemVer | null`
- `valid(version, options?)` → `string | null`
- `clean(version, options?)` → `string | null`
- `coerce(version, options?)` → `SemVer | null`

**Version fields**
- `major(v)`, `minor(v)`, `patch(v)` → `number`
- `prerelease(v)` → `ReadonlyArray<string|number> | null`

**Compare**
- `compare(a, b, loose?)` → `-1 | 0 | 1`
- `rcompare(a, b, loose?)` → `-1 | 0 | 1`
- `compareLoose(a, b)` → `-1 | 0 | 1`
- `compareBuild(a, b, loose?)` → `-1 | 0 | 1`
- `eq`, `neq`, `gt`, `gte`, `lt`, `lte` → `(a, b, loose?) => boolean`
- `cmp(a, op, b, loose?)` → `boolean` — dispatches on operator string
- `compareIdentifiers(a, b)`, `rcompareIdentifiers(a, b)` → `-1 | 0 | 1`
- `sort(list, loose?)`, `rsort(list, loose?)` → mutated/sorted list

**Manipulate**
- `inc(version, release, options?, identifier?, identifierBase?)` → `string | null`
- `diff(v1, v2)` → release-type string or `null`

**Ranges**
- `validRange(range, options?)` → `string | null`
- `satisfies(version, range, options?)` → `boolean`
- `maxSatisfying(versions, range, options?)` → `string | null`
- `minSatisfying(versions, range, options?)` → `string | null`
- `minVersion(range, options?)` → `SemVer | null`
- `gtr(version, range, options?)` → `boolean`
- `ltr(version, range, options?)` → `boolean`
- `outside(version, range, hilo, options?)` → `boolean`
- `intersects(r1, r2, options?)` → `boolean`
- `simplifyRange(versions, range, options?)` → `string | Range`
- `subset(sub, dom, options?)` → `boolean`
- `toComparators(range, options?)` → `string[][]`

**Constants / internals (re-exported)**
- `SEMVER_SPEC_VERSION` = `'2.0.0'`
- `RELEASE_TYPES` = `['major','premajor','minor','preminor','patch','prepatch','prerelease']`
- `re`, `src`, `tokens` — raw regex arrays and token index map

## Options

All functions that take `options` accept either `undefined`, a `boolean` (treated as `loose`), or an object:

```ts
interface Options {
  loose?: boolean            // permissive parsing (v1.2.3, =1.2.3, 1.0.0alpha1, etc.)
  includePrerelease?: boolean // prereleases count as in-range for non-pinned comparators
  rtl?: boolean              // right-to-left scan for coerce()
}
```

Any non-object truthy value becomes `{ loose: true }`. See `src/internal/parse-options.js`.

## Parts

The library is split into four parts — each has its own `master.md` and schema:

- `parts/internal/` — constants, regex tokens, identifier compare, options parser, LRU cache, debug
- `parts/classes/` — `SemVer`, `Comparator`, `Range`
- `parts/functions/` — all top-level functions on versions (parse, compare, inc, etc.)
- `parts/ranges/` — range-level utilities (satisfies, subset, intersects, min/max-satisfying, …)
- `parts/bin/` — the `semver` CLI (`src/bin/semver.js`)

`src/index.js` wires all of the above into the public API.

## Running tests

```bash
npm install
npx tap tests/ --timeout=30 --allow-incomplete-coverage --no-coverage
```

Tests are written with `tap`. They are the authority — if a test and a prompt disagree, the test wins.

## Rules specific to this port

- **Lazy loading**: `src/index.js` lazy-requires its submodules the same way the original does. `src/preload.js` is the eager variant used by the CLI and by `tests/preload.js` — both must return the exact same module object.
- **Cyclic deps**: `Comparator` and `Range` reference each other. The original hoists the class declaration before its `require(...)` calls — preserve that pattern.
- **ReDoS safety**: `src/internal/re.js` builds TWO regex arrays (`re` and `safeRe`). `safeRe` bounds greedy quantifiers using the limits in `constants.js`. User-facing parsing uses `safeRe`. Do not skip this — `tests/internal/re.js` asserts that `safeRe` contains no unbounded `\s+` / `\s*`.
- **LRU cache**: `Range` memoizes parsed comparators in a 1000-entry LRU keyed by `(flags | ':' | rangeString)`.
- **Invariants**: max version length 256 chars, max integer = `Number.MAX_SAFE_INTEGER`, `MAX_SAFE_COMPONENT_LENGTH` = 16 (for coercion).

## Running the CLI

```bash
node src/bin/semver.js --help
```
