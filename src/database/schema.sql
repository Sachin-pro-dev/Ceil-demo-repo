-- Database Schema for Leave Management System
-- Supports leave requests, user balances, and audit logs with integrity constraints and indexes.

-- Create custom types/enums for leave status and leave types
CREATE TYPE leave_status_type AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
CREATE TYPE leave_category_type AS ENUM ('ANNUAL', 'SICK', 'UNPAID', 'MATERNITY', 'PATERNITY', 'BEREAVEMENT');

-- 1. User Leave Balances Table
-- Tracks the allocated, used, and pending leave days per user per leave type.
CREATE TABLE user_leave_balances (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    leave_type leave_category_type NOT NULL,
    allocated_days NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    used_days NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    pending_days NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_leave_type UNIQUE (user_id, leave_type),
    CONSTRAINT chk_allocated_positive CHECK (allocated_days >= 0),
    CONSTRAINT chk_used_positive CHECK (used_days >= 0),
    CONSTRAINT chk_pending_positive CHECK (pending_days >= 0)
);

-- 2. Leave Requests Table
-- Stores historical and current leave requests submitted by users.
CREATE TABLE leave_requests (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    leave_type leave_category_type NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    requested_days NUMERIC(5, 2) NOT NULL,
    status leave_status_type NOT NULL DEFAULT 'PENDING',
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_date_order CHECK (end_date >= start_date),
    CONSTRAINT chk_requested_days_positive CHECK (requested_days > 0)
);

-- 3. Approval Audit Logs Table
-- Tracks transition history, comments, and actions taken by admins/managers on leave requests.
CREATE TABLE leave_approval_audit_logs (
    id SERIAL PRIMARY KEY,
    leave_request_id INT NOT NULL REFERENCES leave_requests(id) ON DELETE CASCADE,
    action_by_user_id VARCHAR(255) NOT NULL,
    action leave_status_type NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for optimized querying
CREATE INDEX idx_user_leave_balances_user ON user_leave_balances(user_id);
CREATE INDEX idx_leave_requests_user ON leave_requests(user_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_audit_logs_request ON leave_approval_audit_logs(leave_request_id);
