-- Database schema for mapping system users and departments to Slack identifiers

CREATE TABLE IF NOT EXISTS slack_user_mappings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    slack_user_id VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS slack_channel_mappings (
    id SERIAL PRIMARY KEY,
    department_id UUID UNIQUE REFERENCES departments(id) ON DELETE CASCADE,
    slack_channel_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexing for quick lookups during notification dispatching
CREATE INDEX IF NOT EXISTS idx_slack_user_mappings_slack_id ON slack_user_mappings(slack_user_id);