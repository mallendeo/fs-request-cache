# fs-request-cache

Simple http cache using cheerio and fs.

## Install
```bash
$ yarn add fs-request-cache
# or npm i fs-request-cache
```

## Usage

```js
import { request, dom } from 'fs-request-cache'
// or const { request, dom } = require('fs-request-cache')

const html = await request('https://google.com', {
  ttl: 3600, // one hour
  force: false // default is `false`
})

// dom
const $ = await request('https://google.com', {
  ttl: 60, // one minute
})

const title = $('title').text()
```

## Test

```bash
$ yarn test
```

## License

MIT
