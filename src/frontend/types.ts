/**
 * Types and Interfaces for the Leave Request System
 */

export type LeaveType = 'Annual Leave' | 'Sick Leave' | 'Maternity/Paternity' | 'Unpaid Leave' | 'Compassionate Leave';

export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveRequest {
  id: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  createdAt: string;
  reviewedBy?: string;
  reviewComment?: string;
}

export interface LeaveBalance {
  leaveType: LeaveType;
  allocated: number;
  used: number;
  pending: number;
}
