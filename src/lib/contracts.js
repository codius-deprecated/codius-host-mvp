'use strict'

const getPort = require('get-port')
const { spawnSync } = require('child_process')

const Config = require('./config')

const { hashManifest } = require('../util/manifest')
const { hashToLabel } = require('../util/base32')

class Contracts {
  constructor (deps) {
    this.config = deps(Config)

    this._contracts = {}
  }

  async start (manifest, duration) {
    const manifestHash = hashManifest(manifest)
    const { hostId } = this.config
    const { image, environment, port } = manifest
    const command = manifest.command || []
    const durationMs = duration * 1000

    const hostPort = await getPort()

    const environmentOpts = []
    for (const key of Object.keys(environment || {})) {
      environmentOpts.push('-e')
      environmentOpts.push(`${key}=${environment[key]}`)
    }

    {
      const { status } = spawnSync('docker', [ 'pull', image ], { stdio: 'inherit' })

      if (status) {
        throw new Error('Docker pull failed with status ' + status)
      }
    }

    {
      const { status } = spawnSync('docker', [
        'run', '-d', '--rm',
        '-p', `${hostPort}:${port}`,
        '--name', manifestHash.substring(0, 16),
        '--label', 'codius=' + hostId,
        '--add-host', 'juaws4p4ica2xs4shfuf7w7ccbtvjwzyhf6quncit23gyl5ggv2q.local.codius.org:10.200.10.1',
        ...environmentOpts,
        image,
        ...command
      ], { stdio: 'inherit' })

      if (status) {
        throw new Error('Docker run failed with status ' + status)
      }
    }

    const killTime = Date.now() + durationMs
    this._contracts[manifestHash] = {
      manifest,
      killTime,
      killTimeout: this._createKillTimeout(manifestHash, killTime),
      hostPort
    }
  }

  stop (manifestHash) {
    spawnSync('docker', [
      'stop', '-t', '10',
      manifestHash.substring(0, 16)
    ], { stdio: 'inherit' })
    delete this._contracts[manifestHash]
  }

  _createKillTimeout (manifestHash, killTime) {
    return setTimeout(() => {
      this.stop(manifestHash)
    }, killTime - Date.now())
  }

  setKillTime (manifestHash, killTime) {
    const contract = this._contracts[manifestHash]

    if (contract.killTimeout) {
      clearTimeout(contract.killTimeout)
    }

    contract.killTime = killTime
    contract.killTimeout = this._createKillTimeout(manifestHash, killTime)
  }

  increaseKillTime (manifestHash, killTimeIncrease) {
    this.setKillTime(manifestHash, this.get(manifestHash).killTime + killTimeIncrease)
  }

  get (manifestHash) {
    return this._contracts[manifestHash]
  }

  getExpiry (manifestHash) {
    return new Date(this._contracts[manifestHash].killTime)
  }

  getUrl (manifestHash) {
    const { hostname, port } = this.config
    return 'http://' +
      hashToLabel(manifestHash) + '.' + hostname +
      (port ? ':' + port : '') +
      '/'
  }

  getInternalUrl (manifestHash) {
    const { hostPort } = this.get(manifestHash)
    return 'http://localhost:' + hostPort
  }
}

module.exports = Contracts
