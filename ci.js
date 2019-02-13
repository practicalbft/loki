const exec = require('child_process').execSync

const { DEF_REPO_PATH } = require('./constants')

ci = {
    runChecks: async () => {
        path = await ci.checkOutRepo()

        try {
            testResult = await ci.runTests()
            return 0
        } catch (err) {
            throw(`Tests failed. Error: ${err.stderr.toString('utf8')}`)
        }
    },
    checkOutRepo: async () => {
        // clone repo, check out correct commit and return path?
        return DEF_REPO_PATH
    },
    runTests: async path => {
        const testFile = process.env.TEST_SCRIPT
        if (!testFile) throw new Error("Test file not specified")

        try {
            // TODO exec testFile at path
            res = exec(testFile)
            return 0
        } catch(err) {
            throw(`Tests failed. Error: ${err.stderr.toString('utf8')}`)
        }
    }
}

module.exports = ci