/**
 * TypeScript interfaces mapping to the PostgreSQL database schema
 * for Employee Leave Requests and Approval Workflows.
 */

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Role {
  id: number;
  name: string;
  description?: string;
  created_at: Date;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role_id: number | null;
  manager_id: number | null; // Self-referencing hierarchical link
  created_at: Date;
}

export interface LeaveRequest {
  id: number;
  user_id: number;
  leave_type: string;
  start_date: string; // ISO Date string
  end_date: string;   // ISO Date string
  reason?: string;
  status: LeaveStatus;
  created_at: Date;
}

export interface ApprovalWorkflow {
  id: number;
  leave_request_id: number;
  approver_id: number;
  sequence_order: number; // Workflow step sequence (e.g., 1 = Manager, 2 = Director)
  status: ApprovalStatus;
  comments?: string;
  updated_at: Date;
}

/**
 * Helper type representing a Leave Request populated with its current hierarchical workflow status
 */
export interface LeaveRequestWithWorkflow extends LeaveRequest {
  employee: {
    id: number;
    name: string;
    email: string;
    manager_name?: string;
  };
  approvals: Array<{
    id: number;
    approver_name: string;
    sequence_order: number;
    status: ApprovalStatus;
    comments?: string;
    updated_at: Date;
  }>;
}
