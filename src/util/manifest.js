'use strict'

const crypto = require('crypto')
const canonicalJson = require('canonical-json')

// Using sha224, because sha256 doesn't fit the 63 character limit on
exports.hashManifest = (manifest) =>
  crypto.createHash('sha256').update(canonicalJson(manifest)).digest('hex')
