'use strict'

const t = require('tap')
const preload = require('../src/preload.js')
const index = require('../src/index.js')
t.equal(preload, index, 'preload and index match')
