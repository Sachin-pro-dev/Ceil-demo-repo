/**
 * TypeScript interfaces mapping to the database schema for the Leave Management System.
 */

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type LeaveCategory = 'ANNUAL' | 'SICK' | 'UNPAID' | 'MATERNITY' | 'PATERNITY' | 'BEREAVEMENT';

export interface UserLeaveBalance {
  id: number;
  userId: string;
  leaveType: LeaveCategory;
  allocatedDays: number;
  usedDays: number;
  pendingDays: number;
  updatedAt: Date;
}

export interface LeaveRequest {
  id: number;
  userId: string;
  leaveType: LeaveCategory;
  startDate: Date;
  endDate: Date;
  requestedDays: number;
  status: LeaveStatus;
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaveApprovalAuditLog {
  id: number;
  leaveRequestId: number;
  actionByUserId: string;
  action: LeaveStatus;
  comment?: string;
  createdAt: Date;
}
