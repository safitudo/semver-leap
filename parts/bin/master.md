# parts/bin — the `semver` CLI

`src/bin/semver.js` is an executable Node script (`#!/usr/bin/env node`) that mirrors the original npm `semver` binary exactly. It is behaviorally tested by `tests/bin/semver.js`, which spawns it as a subprocess and asserts on stdout/stderr/exit code.

## Flags

```
-v, --version              bump version. repeatable.
-i, --increment <r>        bump type, defaults to 'patch'
--preid <id>               identifier for prerelease bumps
-l, --loose                loose parsing
-p, --include-prerelease   include prereleases in range match
-r, --range <range>        filter versions by range. repeatable.
-n <0|1|false>             identifier base for pre-bumps (default: 0)
-c, --coerce               coerce non-semver strings
--rtl                      right-to-left scan for --coerce
--ltr                      left-to-right scan for --coerce (default)
-h, --help                 help text
```

Positional arguments are the versions to operate on.

## Behavior

- With no versions → print help to stderr, exit 1.
- With versions only → filter invalid ones, sort ascending, apply each `-i` in order, print the result lines to stdout.
- With `-c` → replace each positional with its coerced form before the usual pipeline.
- With `-r` → run each filter in sequence; a version must satisfy ALL `-r` ranges to pass.
- If the range filter leaves no versions, exit 1 silently.
- Unknown flags → print help and exit 1.
- Invalid increment → exit 1 with an error message.

The help text must contain the `SemVer <https://semver.org>` byline and the full flag listing so that `tests/bin/semver.js` (which snapshot-matches the output) stays green.

See `_original/bin/semver.js` for the canonical version — preserve every string, exit code, and newline.
