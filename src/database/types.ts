// TypeScript type definitions corresponding to the relational database schema

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type WorkflowStepStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Role {
  id: string;
  name: string;
  description: string | null;
  created_at: Date;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role_id: string;
  manager_id: string | null;
  created_at: Date;
}

export interface LeaveType {
  id: string;
  name: string;
  description: string | null;
  default_days_allowed: number;
  created_at: Date;
}

export interface LeaveRequest {
  id: string;
  user_id: string;
  leave_type_id: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  reason: string | null;
  status: LeaveStatus;
  created_at: Date;
}

export interface WorkflowStep {
  id: string;
  leave_request_id: string;
  approver_id: string;
  step_order: number;
  status: WorkflowStepStatus;
  comment: string | null;
  actioned_at: Date | null;
  created_at: Date;
}
