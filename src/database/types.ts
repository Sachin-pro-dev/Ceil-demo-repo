/**
 * TypeScript interfaces and type definitions representing the Leave Management database schema.
 */

export type UserRole = 'EMPLOYEE' | 'MANAGER' | 'ADMIN';
export type LeaveType = 'ANNUAL' | 'SICK' | 'PARENTAL' | 'UNPAID' | 'BEREAVEMENT' | 'OTHER';
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  managerId: string | null;
  totalLeaveAllowance: number;
  remainingLeaveAllowance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  leaveType: LeaveType;
  startDate: string; // ISO Date format (YYYY-MM-DD)
  endDate: string;   // ISO Date format (YYYY-MM-DD)
  status: RequestStatus;
  reason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApprovalHistory {
  id: string;
  requestId: string;
  approverId: string;
  statusAction: RequestStatus;
  remarks: string | null;
  actionedAt: Date;
}
