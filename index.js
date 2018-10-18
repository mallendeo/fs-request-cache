'use strict'

const axios = require('axios-https-proxy-fix')
const cheerio = require('cheerio')

const cache = require('./file-cache')

const fromCache = async (url, json) => {
  const cached = await cache.get(url)

  if (cached === '404') throw { response: { status: 404 } }
  if (cached) return json ? JSON.parse(cached) : cached
}

const request = async (url, opts = {}, axiosOpts = {}) => {
  const { ttl, force, json } = opts
  const key =
    url +
    JSON.stringify(axiosOpts.headers || {}) +
    JSON.stringify(axiosOpts.params || {}) +
    JSON.stringify(axiosOpts.body || {}) +
    JSON.stringify(axiosOpts.data || {})

  const cached = await fromCache(key, json)
  if (!force && cached) return cached

  try {
    const { data } = await axios(url, axiosOpts)

    const str = json ? JSON.stringify(data) : data
    ttl && cache.set(key, str, ttl)

    return data
  } catch (err) {
    if (err.response) {
      switch (err.response.status) {
        case 404:
          ttl && cache.set(key, '404')
          return null
        case 302:
          const { location } = err.response.headers
          ttl && cache.set(key, location)
          return location
      }
    }

    throw err
  }
}

const dom = async (...args) => {
  const html = await request(...args)
  return html && cheerio.load(html)
}

const json = async (url, opts = {}, ...args) => {
  return request(url, { ...opts, json: true }, ...args)
}

module.exports = {
  cache,
  cheerio,
  request,
  dom,
  json
}
