const express = require('express')
const router = express.Router()

const api = require('./gh')
const ci = require('./ci')
const { INVALID_EVENTS, GH_PING_EVENT } = require('./constants')

// health endpoint
router.get('/', (req, res) => {
    res.sendStatus(200)
})

// webhook endpoint
router.post('/hook', (request, response) => {
    const { headers, payload } = request.body

    // respond to GitHub webhook pings
    if (headers[GH_PING_EVENT] && headers[GH_PING_EVENT] === 'ping') {
        return response.sendStatus(200)
    }

    const { action } = payload

    // don't do anything on these events
    if (INVALID_EVENTS.includes(action)) response.sendStatus(405)

    const ref = payload.pull_request.head.sha
    const title = payload.pull_request.title
    const repo = payload.repository.full_name
    const gitUrl = payload.pull_request.head.repo.clone_url

    console.log(`Running tests for PR ${title} with commit ref ${ref}`)

    ci.runChecks({ gitUrl, repo, ref })
        .then(exitCode => {
            console.log(`All checks passed.`)
            response.sendStatus(200)
        })
        .catch(msg => {
            console.log(`Checks failed with error message: ${msg}`)
            response.sendStatus(500)
        })
})

module.exports = router