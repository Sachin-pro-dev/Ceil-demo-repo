-- Database schema for tracking employee leave requests
CREATE TABLE IF NOT EXISTS leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id VARCHAR(100) NOT NULL,
    leave_type VARCHAR(50) NOT NULL CHECK (leave_type IN ('SICK', 'VACATION', 'PERSONAL', 'BEREAVEMENT', 'OTHER')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_dates CHECK (end_date >= start_date)
);

-- Index to quickly query leave history for a specific employee
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee_id ON leave_requests(employee_id);