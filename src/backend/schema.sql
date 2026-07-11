-- Database schema for Leave Management System

CREATE TYPE user_role AS ENUM ('Employee', 'Manager', 'Admin');
CREATE TYPE leave_status AS ENUM ('Pending', 'Approved', 'Rejected');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'Employee'
);

CREATE TABLE leave_requests (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    status leave_status NOT NULL DEFAULT 'Pending',
    reviewed_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
