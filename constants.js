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
    ]
}

module.exports = CONSTANTS