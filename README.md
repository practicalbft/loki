# Loki
Integration test runner as a GitHub status check.

## Integrating with Loki
### Writing a configuration file
Add a `.loki.yml` file to the project root. This file tells loki what commands to run, in what order and where they should be run. Ideally these commands run checks that should pass, such as integration tests or linting.

`dir` - this specifies where the commands will be executed
`bootstrap` - these commands are executed when cloning the repository
`cmd` - these are the actual commands that should indiciate failing/successful builds by their exit codes

```yml
# sample .loki.yml

dir: .
bootstrap:
    - chmod +x /scripts*.sh
cmd:
    - source env/bin/activate
    - ./scripts/test
```

### Configuring webhook
// TODO

## Running Loki locally
```
git clone https://github.com/practicalbft/loki.git && cd loki
yarn
cp .env.example .env
# edit .env with appropriate details
yarn start
```

Loki is now listening for webhooks on either `process.env.PORT` or `3000`!