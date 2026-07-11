// TypeScript interfaces representing the Leave Management Database Schema

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface Role {
  id: number;
  name: string;
  description?: string;
  created_at: Date;
}

export interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role_id: number | null;
  manager_id: number | null; // Establishes organizational hierarchy
  created_at: Date;
}

export interface LeaveType {
  id: number;
  name: string;
  default_allowance_days: number;
  is_paid: boolean;
}

export interface LeaveRequest {
  id: number;
  employee_id: number;
  leave_type_id: number;
  start_date: Date;
  end_date: Date;
  reason?: string;
  status: LeaveStatus;
  created_at: Date;
  updated_at: Date;
}

export interface LeaveApproval {
  id: number;
  request_id: number;
  approver_id: number;
  status: LeaveStatus;
  comments?: string;
  processed_at: Date;
}