/**
 * TypeScript interfaces and type definitions matching the Leave Management schema.
 */

export type UserRole = 'EMPLOYEE' | 'MANAGER' | 'HR_ADMIN';
export type LeaveType = 'ANNUAL' | 'SICK' | 'MATERNITY' | 'PATERNITY' | 'UNPAID' | 'OTHER';
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  managerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaveBalance {
  id: string;
  userId: string;
  leaveType: LeaveType;
  year: number;
  allocatedDays: number;
  usedDays: number;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  leaveType: LeaveType;
  startDate: string; // ISO Date String (YYYY-MM-DD)
  endDate: string;   // ISO Date String (YYYY-MM-DD)
  totalDays: number;
  reason: string | null;
  status: RequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApprovalStep {
  id: string;
  requestId: string;
  approverId: string;
  stepOrder: number;
  status: ApprovalStatus;
  comments: string | null;
  actionedAt: Date | null;
  createdAt: Date;
}
