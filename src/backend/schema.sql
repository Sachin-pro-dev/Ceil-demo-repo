-- PostgreSQL Schema for Leave Submission and Hierarchical Approval Engine

CREATE TYPE user_role AS ENUM ('EMPLOYEE', 'MANAGER', 'HR');
CREATE TYPE leave_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE approval_gate AS ENUM ('MANAGER_GATE', 'HR_GATE', 'COMPLETED');

-- Users table to store organizational identities and roles
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'EMPLOYEE'
);

-- Leave requests table tracking the status and current approval gate
CREATE TABLE leave_requests (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    leave_type VARCHAR(50) NOT NULL, -- e.g., 'SICK', 'VACATION', 'PERSONAL'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status leave_status NOT NULL DEFAULT 'PENDING',
    current_gate approval_gate NOT NULL DEFAULT 'MANAGER_GATE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit trail table capturing each gate's decision
CREATE TABLE approval_history (
    id SERIAL PRIMARY KEY,
    leave_request_id INT REFERENCES leave_requests(id) ON DELETE CASCADE,
    approver_id INT REFERENCES users(id) ON DELETE SET NULL,
    approver_role user_role NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('APPROVE', 'REJECT')),
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for optimized querying
CREATE INDEX idx_leave_requests_user ON leave_requests(user_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_requests_gate ON leave_requests(current_gate);
CREATE INDEX idx_approval_history_request ON approval_history(leave_request_id);