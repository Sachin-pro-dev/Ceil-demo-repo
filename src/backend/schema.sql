-- Database schema for Hierarchical Leave Management and Workflow Engine

-- Users table establishing organization hierarchy via manager_id
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL,
    manager_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Leave requests tracking current status and active workflow actor
CREATE TYPE leave_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ESCALATED');
CREATE TYPE leave_type AS ENUM ('VACATION', 'SICK', 'PERSONAL', 'BEREAVEMENT');

CREATE TABLE leave_requests (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES users(id),
    leave_type leave_type NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status leave_status DEFAULT 'PENDING',
    current_approver_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit trail of workflow decisions
CREATE TABLE approval_history (
    id SERIAL PRIMARY KEY,
    leave_request_id INTEGER NOT NULL REFERENCES leave_requests(id) ON DELETE CASCADE,
    approver_id INTEGER NOT NULL REFERENCES users(id),
    action VARCHAR(20) NOT NULL, -- 'APPROVE', 'REJECT', 'ESCALATE'
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed data for testing hierarchical approvals
-- CEO (id: 1) -> Director (id: 2, managed by 1) -> Manager (id: 3, managed by 2) -> Employee (id: 4, managed by 3)
INSERT INTO users (id, name, email, role, manager_id) VALUES
(1, 'Alice Smith', 'alice@company.com', 'CEO', NULL),
(2, 'Bob Jones', 'bob@company.com', 'Director', 1),
(3, 'Charlie Brown', 'charlie@company.com', 'Manager', 2),
(4, 'David Wright', 'david@company.com', 'Software Engineer', 3);
