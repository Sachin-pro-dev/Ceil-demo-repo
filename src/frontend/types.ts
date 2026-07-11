export type LeaveType = 'Vacation' | 'Sick Leave' | 'Personal Leave' | 'Parental Leave';

export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveRequest {
  id: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  appliedDate: string;
  approverComments?: string;
}

export interface LeaveBalance {
  type: LeaveType;
  allocated: number;
  used: number;
}
