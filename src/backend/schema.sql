-- Database schema for the multi-level approval workflow engine.

CREATE TYPE user_role AS ENUM ('EMPLOYEE', 'MANAGER', 'HR');
CREATE TYPE request_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE step_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'EMPLOYEE'
);

CREATE TABLE approval_requests (
    id SERIAL PRIMARY KEY,
    requester_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status request_status NOT NULL DEFAULT 'PENDING',
    current_step INT NOT NULL DEFAULT 1,
    total_steps INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE approval_steps (
    id SERIAL PRIMARY KEY,
    request_id INT NOT NULL REFERENCES approval_requests(id) ON DELETE CASCADE,
    step_number INT NOT NULL,
    required_role user_role NOT NULL,
    status step_status NOT NULL DEFAULT 'PENDING',
    approver_id INT REFERENCES users(id) ON DELETE SET NULL,
    actioned_at TIMESTAMP WITH TIME ZONE,
    comment TEXT,
    UNIQUE(request_id, step_number)
);
