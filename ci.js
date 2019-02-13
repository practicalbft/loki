const exec = require('child_process').execSync
const yaml = require('js-yaml')
const fs = require('fs')

const gh = require('./gh')
const { REPO_BASE_PATH, LOKI_CONF_FILE, GH_STATES } = require('./constants')

ci = {
    runChecks: async repoData => {
        await gh.postState(GH_STATES.PENDING, repoData.repo, repoData.ref)
        lokiConfPath = await ci.checkOutRepo(repoData)

        try {
            testResult = await ci.runTests(lokiConfPath, repoData)
            await gh.postState(GH_STATES.SUCCESS, repoData.repo, repoData.ref)
            return 0
        } catch (err) {
            console.log(err)
            await gh.postState(GH_STATES.FAILURE, repoData.repo, repoData.ref)
            throw Error('Checks failed.')
        }
    },
    checkOutRepo: async ({ gitUrl, repo, ref }) => {
        try {
            // clone repo and move into 
            path = `${REPO_BASE_PATH}/${repo}`
            if (fs.existsSync(path)) {
                exec(`rm -r ${path}`)
            }
            exec(`git clone ${gitUrl} ${path}`)
            exec(`cd ${path} && git checkout ${ref}`)


            // check for loki configuration file
            const lokiConfPath = `${path}/${LOKI_CONF_FILE}`
            if (!fs.existsSync(lokiConfPath)) {
                throw Error(`No loki configuration file found in cloned repo ${repo} at ${path}`)
            }

            return lokiConfPath
        } catch (err) {
            throw Error(`Something went wrong when checking out repo. Error: ${err}`)
        }
    },
    runTests: async (lokiConfPath, { repo }) => {
        // parse loki file
        const lokiConf = yaml.safeLoad(fs.readFileSync(lokiConfPath, 'utf8'))
        dir = `${REPO_BASE_PATH}/${repo}/${lokiConf.dir}`

        // run bootstrap scripts if existing
        if (lokiConf.bootstrap) {
            cmd = `cd ${dir}`
            lokiConf.bootstrap.forEach(c => cmd += ` && ${c}`)
            exec(cmd)
        }

        // run check scripts
        try {
            cmd = `cd ${dir}`
            lokiConf.cmd.forEach(c => cmd += ` && ${c}`)
            exec(cmd)
            return 0
        } catch(err) {
            console.log(err)
            throw(`Tests failed. Error: ${err.stderr.toString('utf8')}`)
        }
    }
}

module.exports = ci