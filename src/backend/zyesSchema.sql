-- Database schema to track Slack-initiated requirement changes and approvals
CREATE TABLE IF NOT EXISTS slack_approvals (
    id SERIAL PRIMARY KEY,
    slack_user_id VARCHAR(50) NOT NULL,
    approval_code VARCHAR(50) NOT NULL,
    payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_slack_approvals_user_code ON slack_approvals(slack_user_id, approval_code);