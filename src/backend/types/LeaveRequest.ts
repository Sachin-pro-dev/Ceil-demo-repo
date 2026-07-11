export type LeaveStatus = 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export interface LeaveRequest {
  id: string;
  employeeName: string;
  employeeEmail: string;
  startDate: string;
  endDate: string;
  leaveType: string;
  reason: string;
  status: LeaveStatus;
}
