'use strict'

const t = require('tap')
t.same(require('../../src/classes'), {
  SemVer: require('../../src/classes/semver'),
  Range: require('../../src/classes/range'),
  Comparator: require('../../src/classes/comparator'),
}, 'export all classes at semver/classes')
