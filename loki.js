const express = require('express')
const bodyParser = require('body-parser')
require('dotenv').config()

const api = require('./gh')
const ci = require('./ci')
const { INVALID_EVENTS } = require('./constants')

const app = express()
app.use(bodyParser.json())
const port = process.env.PORT || 3000

// health endpoint
app.get('/', (req, res) => {
    res.sendStatus(200)
})

// webhook endpoint
app.post('/hook', (request, response) => {
    const payload = request.body
    const { action } = payload

    // don't do anything on these events
    if (INVALID_EVENTS.includes(action)) response.sendStatus(405)

    const branch = payload.pull_request.head.ref
    const ref = payload.pull_request.head.sha
    const title = payload.pull_request.title
    const gitUrl = payload.pull_request.head.repo.clone_url

    console.log(`Running tests for PR ${title} on branch ${branch} with commit ref ${ref}`)

    ci.runChecks()
        .then(exitCode => {
            console.log(`All checks passed.`)
            response.sendStatus(200)
        })
        .catch(msg => {
            console.log(`Checks failed with error message: ${msg}`)
            response.sendStatus(500)
        })
})

app.listen(port, () => console.log(`Loki listening on port ${port}!`))