const app = require('express')()

const log = () => {
  setInterval(() => {
    console.log(new Date().toLocaleString())
    if (Math.random() < 0.5) console.error(new Date().toLocaleString())
  }, 5000)
}

app.listen(10002, () => {
  console.log('Server 2 listening on port 10002')
  log()
})
