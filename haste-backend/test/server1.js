const app = require('express')()

const log = () => {
  setInterval(() => {
    console.log(new Date().toLocaleString())
    console.debug(
      '[\x1b[36m',
      '_name',
      'INFO',
      '\x1b[0m]',
      new Date().toLocaleString(),
    )

    console.error('error', new Date().toLocaleString())
  }, 5000)
}

app.listen(10001, log)
