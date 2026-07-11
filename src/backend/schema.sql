-- SQL schema representing the multi-tier approval structure for leave management

CREATE TYPE user_role AS ENUM ('EMPLOYEE', 'MANAGER', 'HR', 'DIRECTOR');
CREATE TYPE leave_status AS ENUM ('PENDING_MANAGER', 'PENDING_HR', 'APPROVED', 'REJECTED');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role user_role NOT NULL,
    manager_id INTEGER REFERENCES users(id)
);

CREATE TABLE leave_requests (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    leave_type VARCHAR(50) NOT NULL,
    status leave_status NOT NULL DEFAULT 'PENDING_MANAGER',
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE approval_logs (
    id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL REFERENCES leave_requests(id) ON DELETE CASCADE,
    approver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(20) NOT NULL, -- 'APPROVE' or 'REJECT'
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
