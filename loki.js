const express = require('express')
const bodyParser = require('body-parser')
require('dotenv').config()

const app = express()
app.use(bodyParser.json())
app.use('/', require('./lib/router'))

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Loki listening on port ${port}!`))