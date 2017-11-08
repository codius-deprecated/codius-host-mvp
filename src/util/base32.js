'use strict'

const base32 = require('thirty-two')

exports.hashToLabel = hash =>
  base32.encode(Buffer.from(hash, 'hex')).toString('ascii').toLowerCase().replace(/=+$/, '')

exports.labelToHash = label =>
  base32.decode(label).toString('hex')
