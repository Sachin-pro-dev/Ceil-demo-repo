/**
 * Represents the valid states of a leave request.
 */
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

/**
 * System roles for authorization and access control.
 */
export interface Role {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
}

/**
 * Core user profile definition.
 */
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Junction entity mapping users to their respective roles.
 */
export interface UserRole {
  userId: string;
  roleId: string;
  assignedAt: Date;
}

/**
 * Types of leaves configurable within the system.
 */
export interface LeaveType {
  id: string;
  name: string;
  daysAllocated: number;
  description: string | null;
}

/**
 * Leave request record capturing requesting user, status, and processing audit metadata.
 */
export interface LeaveRequest {
  id: string;
  userId: string;
  leaveTypeId: string;
  startDate: Date;
  endDate: Date;
  status: LeaveStatus;
  reason: string | null;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}
