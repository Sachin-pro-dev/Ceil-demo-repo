export type LeaveType = 'Annual' | 'Sick' | 'Maternity' | 'Paternity' | 'Unpaid' | 'Study';

export interface LeaveBalance {
  type: LeaveType;
  allocated: number;
  used: number;
  pending: number;
  remaining: number;
}

export interface LeaveRequest {
  id: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  submittedAt: string;
}
