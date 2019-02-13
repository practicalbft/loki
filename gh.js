const axios = require('axios')

const { GH_STATES, GH_CONTEXT, GH_API_BASE_URL } = require('./constants')

const gh = {
    descForState: state => {
        switch (state) {
            case GH_STATES.PENDING:
                return 'Loki is currently running the checks..'
            case GH_STATES.FAILURE:
                return 'The checks failed. Check out the commit and see what went wrong.'
            case GH_STATES.SUCCESS:
                return 'The tests passed! Clear skies ahead.'
        }
    },
    postState: async (state, repo, ref) => {
        payload = {
            state,
            context: GH_CONTEXT,
            description: gh.descForState(state)
        }

        const url = `${GH_API_BASE_URL}/repos/${repo}/statuses/${ref}`
        try {
            res = await axios.post(url, payload, {
                auth: {
                    username: process.env.GITHUB_USERNAME,
                    password: process.env.GITHUB_ACCESS_TOKEN
                }
            })   
        } catch (err) {
            console.log(err)
        }
    }
}

module.exports = gh