# Loki
Integration test runner as a GitHub status check.

## Setup
```
git clone https://github.com/practicalbft/loki.git && cd loki
yarn
cp .env.example .env
# edit .env with appropriate details and add executable test script at specified path
yarn start
```

Loki is now listening for webhooks on either `process.env.PORT` or `3000`!

## Webhooks
event `pull_request`, `data.action` not in `[closed, assigned, labeled, unlabeled]`
branch: `data.pull_request.head.ref`
commit sha: `data.pull_request.head.sha`
title: `data.pull_request.title`
git url: `data.pull_request.head.repo.clone_url`

```
git clone $CLONE_URL ./repo
cd ./repo
git checkout $PR_BRANCH
git pull
./scripts/test it
send API req to API for status check depending on test results
rm -r ./repo
```