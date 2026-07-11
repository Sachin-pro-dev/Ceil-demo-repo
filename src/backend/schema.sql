-- Database Schema for Leave Request Workflow Engine

CREATE TYPE user_role AS ENUM ('employee', 'manager', 'hr');
CREATE TYPE leave_status AS ENUM ('pending_manager', 'pending_hr', 'approved', 'rejected');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'employee',
    manager_id INT REFERENCES users(id)
);

CREATE TABLE leave_requests (
    id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL REFERENCES users(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    leave_type VARCHAR(50) NOT NULL, -- e.g., 'Sick', 'Vacation', 'Personal'
    reason TEXT,
    status leave_status NOT NULL DEFAULT 'pending_manager',
    current_approver_id INT REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE approval_history (
    id SERIAL PRIMARY KEY,
    leave_request_id INT NOT NULL REFERENCES leave_requests(id) ON DELETE CASCADE,
    approver_id INT NOT NULL REFERENCES users(id),
    action VARCHAR(20) NOT NULL, -- 'approved' or 'rejected'
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for quick access in lookup and dashboard views
CREATE INDEX idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_requests_approver ON leave_requests(current_approver_id);
