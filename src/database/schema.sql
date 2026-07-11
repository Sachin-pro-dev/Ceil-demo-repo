-- PostgreSQL Leave Request Management Schema

-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Leave Types Table
CREATE TABLE IF NOT EXISTS leave_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_paid BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Leave Balances Table
CREATE TABLE IF NOT EXISTS leave_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL, -- References external/existing employee or user table
    leave_type_id UUID NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
    allocated_days NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    used_days NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    remaining_days NUMERIC(5, 2) GENERATED ALWAYS AS (allocated_days - used_days) STORED,
    year INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (employee_id, leave_type_id, year)
);

-- 3. Leave Request Status Enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'leave_status') THEN
        CREATE TYPE leave_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
    END IF;
END
$$;

-- 4. Leave Requests Table
CREATE TABLE IF NOT EXISTS leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL,
    leave_type_id UUID NOT NULL REFERENCES leave_types(id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days NUMERIC(5, 2) NOT NULL,
    status leave_status NOT NULL DEFAULT 'PENDING',
    reason TEXT,
    approver_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_dates CHECK (end_date >= start_date),
    CONSTRAINT positive_days CHECK (total_days > 0)
);

-- 5. Audit Actions Enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_action') THEN
        CREATE TYPE audit_action AS ENUM ('SUBMITTED', 'APPROVED', 'REJECTED', 'CANCELLED', 'UPDATED');
    END IF;
END
$$;

-- 6. Leave Request Audit Logs Table
CREATE TABLE IF NOT EXISTS leave_request_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    leave_request_id UUID NOT NULL REFERENCES leave_requests(id) ON DELETE CASCADE,
    action audit_action NOT NULL,
    performed_by UUID NOT NULL, -- References external user executing the action
    previous_status leave_status,
    new_status leave_status NOT NULL,
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for optimized querying
CREATE INDEX IF NOT EXISTS idx_leave_balances_employee ON leave_balances(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_request ON leave_request_audit_logs(leave_request_id);
