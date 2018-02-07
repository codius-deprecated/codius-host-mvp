'use strict'

const fs = require('fs-extra')
const debug = require('debug')('codius-host')
const path = require('path')
const moment = require('moment')
const Koa = require('koa')
const Router = require('koa-router')
const Logger = require('koa-logger')
const BodyParser = require('koa-bodyparser')
const Ilp = require('koa-ilp')
const Boom = require('boom')

const Config = require('./config')
const Contracts = require('./contracts')
const Proxy = require('./proxy')

const { hashManifest } = require('../util/manifest')

const dollarsPerMonth = process.env.CODIUS_DOLLARS_PER_MONTH || 5
const dollarsPerXrp = 0.2
const dropsPerXrp = Math.pow(10, 6)
const xrpPerMonth = dollarsPerMonth / dollarsPerXrp
const dropsPerMonth = xrpPerMonth * dropsPerXrp
const monthsPerSecond = 0.0000003802571
const dropsPerSecond = dropsPerMonth * monthsPerSecond

class App {
  constructor (deps) {
    this.config = deps(Config)
    this.koa = deps(Koa)
    this.router = deps(Router)
    this.proxy = deps(Proxy)
    this.contracts = deps(Contracts)

    const plugin = require('ilp-plugin')()
    this.ilp = new Ilp({ plugin })
  }

  listen () {
    const app = this.koa
    const router = this.router
    const { port } = this.config

    app.use(Logger())
    app.use(this.proxy.getMiddleware())
    app.use(BodyParser())
    app.use(router.routes())
    app.use(router.allowedMethods({
      throw: true,
      notImplemented: () => Boom.notImplemented(),
      methodNotAllowed: () => Boom.methodNotAllowed()
    }))

    const price = (ctx) => {
      const duration = ctx.query.duration || 3600
      return Math.ceil(dropsPerSecond * duration)
    }

    router.options('/start', this.ilp.options({ price }))
    router.post('/start', this.ilp.paid({ price }), async (ctx) => {
      const { manifest } = ctx.request.body
      const duration = ctx.query.duration || 3600
      const durationMs = duration * 1000

      const manifestHash = hashManifest(manifest)

      const deployed = !!this.contracts.get(manifestHash)
      if (deployed) {
        this.contracts.increaseKillTime(manifestHash, durationMs)

        debug('extended contract %s by %d seconds', manifestHash, duration)
        ctx.status = 200
      } else {
        await this.contracts.start(manifest, duration)

        debug('started', manifestHash)
        ctx.status = 201
      }

      const expiry = this.contracts.getExpiry(manifestHash)
      ctx.body = {
        manifestHash,
        expiry: expiry.toISOString(),
        expiryHuman: moment(expiry).fromNow(),
        url: this.contracts.getUrl(manifestHash)
      }
    })

    router.get('/', (ctx) => {
      ctx.body = 'Hello World!'
    })

    app.listen(port)

    console.log(`Codius listening on port ${port}`)
  }
}

module.exports = App
