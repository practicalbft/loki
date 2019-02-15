const express = require('express')
const router = express.Router()
const fs = require('fs')

const gh = require('./gh')
const ci = require('./ci')
const { INVALID_EVENTS, GH_PING_EVENT, GH_STATES } = require('./constants')

// health endpoint
router.get('/', (request, response) => {
    response.sendStatus(200)
})

// webhook endpoint
router.post('/hook', (request, response) => {
    // respond to GitHub webhook pings
    if (request.headers[GH_PING_EVENT] && request.headers[GH_PING_EVENT] === 'ping') {
        return response.sendStatus(200)
    }

    const payload = request.body

    // don't do anything on these events
    if (INVALID_EVENTS.includes(payload.action)) response.sendStatus(405)

    const ref = payload.pull_request.head.sha
    const title = payload.pull_request.title
    const repo = payload.repository.full_name
    const gitUrl = payload.pull_request.head.repo.clone_url

    console.log(`Running checks for PR ${title} with commit ref ${ref}`)

    ci.runChecks({ gitUrl, repo, ref })
        .then(async exitCode => {
            console.log(`All checks passed with exit code ${exitCode}.`)
            await gh.postState(GH_STATES.SUCCESS, repo, ref)
            response.sendStatus(200)
        })
        .catch(async msg => {
            console.log(`Checks failed with error message: ${msg}`)
            await gh.postState(GH_STATES.FAILURE, repo, ref)
            response.sendStatus(406)
        })
})

router.get('/jobs/:ref', (request, response) => {
    const { ref } = request.params
    const path = `./tmp/logs/${ref}.log`

    if (!fs.existsSync(path)) {
        return response.sendStatus(404)
    }

    // send raw log back to client
    const contents = fs.readFileSync(path, 'utf8')
    response.setHeader('Content-type', 'text/plain')
    response.charset = 'UTF-8'
    response.write(contents)
    response.end()
})

module.exports = router