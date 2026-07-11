/**
 * TypeScript interfaces and types mapping directly to the Leave Request database schema.
 */

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export type AuditAction = 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'UPDATED';

export interface LeaveType {
  id: string;
  name: string;
  description: string | null;
  is_paid: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface LeaveBalance {
  id: string;
  employee_id: string;
  leave_type_id: string;
  allocated_days: number;
  used_days: number;
  remaining_days: number; // Generated column
  year: number;
  created_at: Date;
  updated_at: Date;
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type_id: string;
  start_date: Date;
  end_date: Date;
  total_days: number;
  status: LeaveStatus;
  reason: string | null;
  approver_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface LeaveRequestAuditLog {
  id: string;
  leave_request_id: string;
  action: AuditAction;
  performed_by: string;
  previous_status: LeaveStatus | null;
  new_status: LeaveStatus;
  comments: string | null;
  created_at: Date;
}
