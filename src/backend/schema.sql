-- Database schema for the Role-Based Approval Engine

CREATE TYPE user_role AS ENUM ('EMPLOYEE', 'MANAGER', 'HR');
CREATE TYPE leave_status AS ENUM ('PENDING_MANAGER', 'PENDING_HR', 'APPROVED', 'DENIED');
CREATE TYPE leave_type AS ENUM ('SICK', 'VACATION', 'BEREAVEMENT', 'PERSONAL');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'EMPLOYEE',
    manager_id INTEGER REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE leave_requests (
    id SERIAL PRIMARY KEY,
    requester_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type leave_type NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status leave_status NOT NULL DEFAULT 'PENDING_MANAGER',
    current_approver_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE approval_logs (
    id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL REFERENCES leave_requests(id) ON DELETE CASCADE,
    approver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(20) NOT NULL, -- 'APPROVED' or 'DENIED'
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for quick routing lookups
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_requests_current_approver ON leave_requests(current_approver_id);
