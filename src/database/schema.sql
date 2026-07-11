-- SQL Schema for Leave Management System
-- This schema handles employee leave balances, requests, approval states, and historical logs.

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Custom ENUMs for Leave Request Statuses and Approval Actions
CREATE TYPE leave_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
CREATE TYPE approval_action AS ENUM ('APPROVE', 'REJECT', 'COMMENT');

-- 1. Employees Table (Minimal representation for foreign key constraints)
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    manager_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Leave Types Table (e.g., Annual, Sick, Parental, Unpaid)
CREATE TABLE leave_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_paid BOOLEAN DEFAULT TRUE NOT NULL,
    default_allowance_days DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    requires_approval BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Leave Balances Table (Tracks yearly entitlements, used, and remaining balances per employee)
CREATE TABLE leave_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type_id UUID NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
    year INT NOT NULL,
    entitled_days DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    carried_over_days DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    used_days DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    pending_days DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_employee_leave_year UNIQUE (employee_id, leave_type_id, year)
);

-- 4. Leave Requests Table (Tracks employee leave submissions and current status)
CREATE TABLE leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type_id UUID NOT NULL REFERENCES leave_types(id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days DECIMAL(5, 2) NOT NULL,
    status leave_status DEFAULT 'PENDING' NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_dates CHECK (start_date <= end_date),
    CONSTRAINT chk_total_days CHECK (total_days > 0)
);

-- 5. Leave Approval History Table (Audit log of approval states and comments)
CREATE TABLE leave_approval_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    leave_request_id UUID NOT NULL REFERENCES leave_requests(id) ON DELETE CASCADE,
    actioned_by UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    action approval_action NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Performance and Fast Lookups
CREATE INDEX idx_leave_balances_employee ON leave_balances(employee_id);
CREATE INDEX idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_approval_history_request ON leave_approval_history(leave_request_id);
