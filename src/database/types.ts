/**
 * TypeScript interfaces mapping to the database schema tables.
 * These types can be used across frontend and backend services.
 */

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface Role {
  id: string;
  name: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role_id: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface LeaveType {
  id: string;
  name: string;
  description?: string;
  created_at: Date;
}

export interface LeaveBalance {
  id: string;
  user_id: string;
  leave_type_id: string;
  year: number;
  allocated_days: number;
  used_days: number;
  created_at: Date;
  updated_at: Date;
}

export interface LeaveRequest {
  id: string;
  user_id: string;
  leave_type_id: string;
  start_date: Date;
  end_date: Date;
  total_days: number;
  status: LeaveStatus;
  reason?: string;
  reviewer_remarks?: string;
  reviewed_by?: string;
  reviewed_at?: Date;
  created_at: Date;
  updated_at: Date;
}
