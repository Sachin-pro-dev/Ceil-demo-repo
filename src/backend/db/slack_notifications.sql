-- Migration to set up Slack notifications configurations and delivery logging
CREATE TABLE IF NOT EXISTS slack_configs (
    id SERIAL PRIMARY KEY,
    team_id VARCHAR(50) NOT NULL,
    webhook_url TEXT NOT NULL,
    channel_name VARCHAR(100) NOT NULL,
    event_subscriptions TEXT[] NOT NULL, -- e.g., ARRAY['SUBMITTED', 'APPROVED', 'REJECTED']
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notification_logs (
    id SERIAL PRIMARY KEY,
    approval_id VARCHAR(100) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    recipient_email VARCHAR(255),
    slack_channel VARCHAR(100),
    status VARCHAR(20) NOT NULL, -- 'SUCCESS', 'FAILED'
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast auditing/status tracking of notifications per approval lifecycle
CREATE INDEX IF NOT EXISTS idx_notification_logs_approval_id ON notification_logs(approval_id);