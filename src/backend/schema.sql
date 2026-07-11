-- Database schema defining leave request statuses, user roles, and full audit logs
CREATE TYPE leave_status AS ENUM ('SUBMITTED', 'PENDING_MANAGER', 'PENDING_HR', 'APPROVED', 'REJECTED', 'CANCELLED');
CREATE TYPE user_role AS ENUM ('EMPLOYEE', 'MANAGER', 'HR');

CREATE TABLE leave_requests (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL,
    leave_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status leave_status NOT NULL DEFAULT 'PENDING_MANAGER',
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE approval_logs (
    id SERIAL PRIMARY KEY,
    leave_request_id INTEGER REFERENCES leave_requests(id) ON DELETE CASCADE,
    actor_id VARCHAR(50) NOT NULL,
    actor_role user_role NOT NULL,
    action VARCHAR(20) NOT NULL, -- 'APPROVE', 'REJECT', 'CANCEL'
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);