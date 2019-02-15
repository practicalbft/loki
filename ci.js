const exec = require('child_process').execSync
const yaml = require('js-yaml')
const fs = require('fs')

const gh = require('./gh')
const { REPO_BASE_PATH, LOKI_CONF_FILE, GH_STATES } = require('./constants')

ci = {
    ref: null,
    logFile: null,
    runCommand: cmd => {
        const fd = fs.openSync(`./tmp/logs/${ci.ref}.log`, 'a')
        exec(cmd, { stdio: [0, fd, fd] })
        fs.closeSync(fd)
    },
    runChecks: async repoData => {
        ci.ref = repoData.ref
        ci.logFile = fs.openSync(`./tmp/logs/${ci.ref}.log`, 'a')

        await gh.postState(GH_STATES.PENDING, repoData.repo, repoData.ref)

        const logsDir = './tmp/logs'
        if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir)

        const logFilePath = `${logsDir}/${repoData.ref}.log`
        if (fs.existsSync(logFilePath)) fs.unlinkSync(logFilePath)

        lokiConfPath = await ci.checkOutRepo(repoData)

        try {
            return await ci.runTests(lokiConfPath, repoData)
        } catch (err) {
            console.log(err)
            throw Error(`Checks failed. Error: ${err}`)
        }
    },
    checkOutRepo: async ({ gitUrl, repo, ref }) => {
        try {
            // clone repo and move into 
            path = `${REPO_BASE_PATH}/${repo}`
            if (fs.existsSync(path)) ci.runCommand(`rm -rf ${path}`)
            
            ci.runCommand(`git clone ${gitUrl} ${path}`)
            ci.runCommand(`cd ${path} && git checkout ${ref}`)

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
            ci.runCommand(cmd)
        }

        // run check scripts
        try {
            cmd = `cd ${dir}`
            lokiConf.cmd.forEach(c => cmd += ` && ${c}`)
            ci.runCommand(cmd)
            return 0
        } catch(err) {
            console.log(err)
            throw Error(`Tests failed. Error: ${err}`)
        }
    }
}

module.exports = ci