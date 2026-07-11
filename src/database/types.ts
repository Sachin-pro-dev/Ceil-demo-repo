// TypeScript Type Definitions representing the Leave Management Database Schema

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type ApprovalAction = 'APPROVE' | 'REJECT' | 'COMMENT';

export interface Employee {
  id: string; // UUID
  email: string;
  firstName: string;
  lastName: string;
  managerId?: string | null; // UUID referencing another Employee
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaveType {
  id: string; // UUID
  name: string;
  description?: string | null;
  isPaid: boolean;
  defaultAllowanceDays: number;
  requiresApproval: boolean;
  createdAt: Date;
}

export interface LeaveBalance {
  id: string; // UUID
  employeeId: string; // UUID
  leaveTypeId: string; // UUID
  year: number;
  entitledDays: number;
  carriedOverDays: number;
  usedDays: number;
  pendingDays: number;
  updatedAt: Date;
}

export interface LeaveRequest {
  id: string; // UUID
  employeeId: string; // UUID
  leaveTypeId: string; // UUID
  startDate: Date;
  endDate: Date;
  totalDays: number;
  status: LeaveStatus;
  reason?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaveApprovalHistory {
  id: string; // UUID
  leaveRequestId: string; // UUID
  actionedBy: string; // UUID (Employee ID)
  action: ApprovalAction;
  comment?: string | null;
  createdAt: Date;
}
