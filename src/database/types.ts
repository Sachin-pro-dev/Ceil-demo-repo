/**
 * TypeScript interfaces and type definitions matching the database schema.
 * These types provide safe interaction with database queries on the backend.
 */

export type UserRoleName = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';

export type LeaveType = 'ANNUAL' | 'SICK' | 'PARENTAL' | 'UNPAID';

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface Role {
  id: number;
  name: UserRoleName;
  description: string | null;
  created_at: Date;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role_id: number;
  created_at: Date;
}

export interface LeaveBalance {
  id: number;
  user_id: number;
  leave_type: LeaveType;
  allocated_days: number;
  used_days: number;
  year: number;
  updated_at: Date;
}

export interface LeaveRequest {
  id: number;
  user_id: number;
  leave_type: LeaveType;
  start_date: string; // ISO date format YYYY-MM-DD
  end_date: string;   // ISO date format YYYY-MM-DD
  status: LeaveStatus;
  reason: string | null;
  approver_id: number | null;
  created_at: Date;
  updated_at: Date;
}