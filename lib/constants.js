const CONSTANTS = {
    REPO_BASE_PATH: './tmp',
    LOKI_CONF_FILE: '.loki.yml',
    INVALID_EVENTS: [
        'assigned',
        'unassigned',
        'review_requested',
        'review_request_removed',
        'labeled',
        'unlabeled',
        'closed',
        'reopened'
    ],
    GH_STATES: {
        PENDING: 'pending',
        FAILURE: 'failure',
        SUCCESS: 'success'
    },
    GH_CONTEXT: 'continuous-integration/loki',
    GH_API_BASE_URL: 'https://api.github.com',
    GH_PING_EVENT: 'x-github-event'
}

module.exports = CONSTANTS