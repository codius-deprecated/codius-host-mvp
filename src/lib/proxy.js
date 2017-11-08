'use strict'

const HttpProxy = require('http-proxy')
const chalk = require('chalk')

const Contracts = require('./contracts')

const { labelToHash } = require('../util/base32')

const MANIFEST_LABEL_REGEX = /[a-zA-Z2-7]{52}/

class Proxy {
  constructor (deps) {
    this.contracts = deps(Contracts)

    this._proxy = HttpProxy.createProxyServer()
  }

  getMiddleware () {
    return async (ctx, next) => {
      const start = Date.now()
      const host = ctx.request.header.host.split(':')[0]
      const label = host.split('.')[0]

      if (MANIFEST_LABEL_REGEX.exec(label)) {
        console.log('ctx.request', ctx.request)
        console.log(`  ${chalk.dim('<--')} ${chalk.bold(ctx.request.method)} ${chalk.dim(label)} ${chalk.dim(ctx.request.path)}`)
        const hash = labelToHash(label)

        const contract = this.contracts.get(hash)

        if (!contract) {
          ctx.status = 404
          return
        }

        const target = this.contracts.getInternalUrl(hash)

        return new Promise((resolve, reject) => {
          this._proxy.web(ctx.req, ctx.res, { target }, e => {
            const status = {
              ECONNREFUSED: 503,
              ETIMEOUT: 504
            }[e.code]
            if (status) ctx.status = status

            resolve()
          })
        })
      } else {
        return next()
      }
    }
  }
}

module.exports = Proxy
