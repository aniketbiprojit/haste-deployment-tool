const app = require('express')()

const log = () => {
  setInterval(() => {
    console.log(new Date().toLocaleString())
  }, 5000)
}

app.listen(10001, log)
