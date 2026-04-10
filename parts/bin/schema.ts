// The CLI has no importable surface — it is an executable. Its "schema" is
// the set of (argv -> (stdout, stderr, exitCode)) mappings exercised by
// tests/bin/semver.js. Keeping this file here as a placeholder so the
// parts/ layout is uniform.

export interface SemverCli {
  /**
   * Spawning `node src/bin/semver.js <argv...>` must produce the same
   * stdout / stderr / exit code as node-semver v7.7.4.
   */
  readonly __cli: true
}
