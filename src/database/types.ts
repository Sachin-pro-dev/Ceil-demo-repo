/**
 * TypeScript type definitions mapping directly to the database schema
 * for users, leave requests, and approval logs.
 */

export type UserRole = 'employee' | 'manager' | 'admin';
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type LeaveType = 'vacation' | 'sick' | 'personal' | 'parental' | 'unpaid';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  managerId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  leaveType: LeaveType;
  startDate: string; // ISO Date String (YYYY-MM-DD)
  endDate: string;   // ISO Date String (YYYY-MM-DD)
  reason: string | null;
  status: LeaveStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApprovalLog {
  id: string;
  leaveRequestId: string;
  approverId: string;
  action: LeaveStatus;
  comment: string | null;
  createdAt: Date;
}
