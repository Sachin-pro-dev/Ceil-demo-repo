// Type definitions for User Roles, Leave Statuses, and extended Express Requests

export type UserRole = 'Employee' | 'Manager' | 'Admin';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface User {
  id: number;
  email: string;
  role: UserRole;
}

export interface LeaveRequest {
  id: number;
  userId: number;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  reviewedBy?: number;
  createdAt: string;
  updatedAt: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
