const exec = require('child_process').execSync
const yaml = require('js-yaml')
const fs = require('fs')

const { REPO_BASE_PATH, LOKI_CONF_FILE } = require('./constants')

ci = {
    runChecks: async repoData => {
        lokiConfPath = await ci.checkOutRepo(repoData)

        try {
            testResult = await ci.runTests(lokiConfPath, repoData)
            return 0
        } catch (err) {
            console.log(err)
            throw Error(`Tests failed. Error: ${err.stderr.toString('utf8')}`)
        }
    },
    checkOutRepo: async ({ gitUrl, repo, ref }) => {
        // clone repo, check out correct commit and return path?
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
        // const testFile = process.env.TEST_SCRIPT
        // if (!testFile) throw Error("Test file not specified")

        // parse loki file
        const lokiConf = yaml.safeLoad(fs.readFileSync(lokiConfPath, 'utf8'))
        dir = `${REPO_BASE_PATH}/${repo}/${lokiConf.dir}`

        if (lokiConf.bootstrap) {
            cmd = `cd ${dir}`
            lokiConf.bootstrap.forEach(c => cmd += `&& ${c}`)
            exec(cmd)
        }

        try {
            cmd = `cd ${dir}`
            lokiConf.cmd.forEach(c => cmd += `&& ${c}`)
            exec(cmd)
            return 0
        } catch(err) {
            console.log(err)
            throw(`Tests failed. Error: ${err.stderr.toString('utf8')}`)
        }
    }
}

module.exports = ci