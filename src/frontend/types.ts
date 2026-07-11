export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';
export type LeaveType = 'Sick' | 'Vacation' | 'Personal' | 'Maternity/Paternity' | 'Bereavement';

export interface LeaveRequest {
  id: string;
  employeeName: string;
  employeeEmail: string;
  department: string;
  avatarUrl?: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  submissionDate: string;
  adminNotes?: string;
}

export interface DashboardStats {
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
  mostRequestedType: string;
}
