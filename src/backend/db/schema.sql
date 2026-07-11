-- Database migration to define the requests table with status constraint supporting 'CANCELLED'
CREATE TABLE IF NOT EXISTS requests (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    details TEXT,
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
