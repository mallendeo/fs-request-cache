'use strict'

const { request } = require('./')
const { hash } = require('./file-cache')

const fs = require('fs-extra')
const wait = (ms = 1000) => new Promise(r => setTimeout(r, ms))

//
;(async () => {
  const url = 'https://google.com'
  const extra = '{}{}{}'
  const html = await request(url, { ttl: 1 })

  const file = `./cache/${hash(url + extra)}`
  const exists = fs.existsSync(file)
  const content = fs.readFileSync(file, 'utf8')

  console.log(exists, content.length > html.length)

  console.time('from cache')
  await request(url)
  console.timeEnd('from cache')

  console.log('waiting 1 second')
  await wait()

  console.time('cache expired')
  await request(url, { ttl: 1 })
  console.timeEnd('cache expired')

  fs.removeSync('./cache')
})()
