/**
 * Type definitions for the Leave Submission UI.
 */

export type LeaveType = 'Annual' | 'Sick' | 'Maternity' | 'Paternity' | 'Unpaid' | 'Other';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  type: LeaveType;
  reason: string;
  status: LeaveStatus;
  createdAt: string;
}
