/**
 * Type definitions representing leave requests and dashboard visual statistics.
 */

export type LeaveType = 'Sick' | 'Vacation' | 'Personal' | 'Maternity/Paternity' | 'Other';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveRequest {
  id: string;
  employeeName: string;
  department: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: LeaveStatus;
  reason: string;
  appliedDate: string;
}

export interface DashboardStats {
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  totalDaysRequested: number;
}
