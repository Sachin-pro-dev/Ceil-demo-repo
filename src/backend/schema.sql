-- Database schema for the Leave Submission and Approval system

-- Create User Roles enum
CREATE TYPE user_role AS ENUM ('EMPLOYEE', 'MANAGER', 'HR');

-- Create Leave Status enum
CREATE TYPE leave_status AS ENUM ('PENDING', 'APPROVED_BY_MANAGER', 'APPROVED', 'REJECTED');

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'EMPLOYEE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Leave Requests Table
CREATE TABLE leave_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    status leave_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_dates CHECK (start_date <= end_date)
);

-- Approval Logs Table
CREATE TABLE approval_history (
    id SERIAL PRIMARY KEY,
    request_id INTEGER REFERENCES leave_requests(id) ON DELETE CASCADE,
    approver_id INTEGER REFERENCES users(id) ON DELETE RESTRICT,
    action VARCHAR(20) NOT NULL, -- 'APPROVE' or 'REJECT'
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
