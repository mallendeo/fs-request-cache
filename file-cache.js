'use strict'

const fs = require('fs-extra')
const crypto = require('crypto')
const appRoot = require('app-root-path')

const hash = key =>
  crypto
    .createHash('sha256')
    .update(key)
    .digest('hex')

const config = {
  path: `${appRoot}/cache`
}

const filePath = key => `${config.path}/${hash(key)}`

fs.ensureDirSync(config.path)

module.exports = {
  config,
  setPath: async path => {
    const exists = await fs.pathExists(path)
    exists && (config.path = path)
    return exists
  },
  hash,
  get: async key => {
    const file = filePath(key)

    if (await fs.exists(file)) {
      const contents = await fs.readFile(file, 'utf8')
      const matches = contents.match(/([-\d]+)\n([\s\S]+)/)
      if (!matches) return

      const [, expires, value] = matches
      const exp = Number(expires)
      if (exp !== -1 && exp < Date.now()) return

      return value
    }
  },

  set: async (key, val, ttl) => {
    const exp = typeof ttl === 'number' ? Date.now() + ttl * 1000 : -1

    return fs.writeFile(filePath(key), `${exp}\n${val}`, 'utf8')
  }
}
