export interface LeaveRequest {
  id: string;
  employeeName: string;
  department: string;
  leaveType: 'Annual' | 'Sick' | 'Maternity/Paternity' | 'Unpaid' | 'Other';
  startDate: string;
  endDate: string;
  days: number;
  status: 'Approved' | 'Pending' | 'Rejected';
}

export interface DepartmentMetric {
  department: string;
  approvedDays: number;
  pendingRequests: number;
  headcount: number;
}

export interface GlobalConfig {
  defaultAnnualAllowance: number;
  maxCarryOverDays: number;
  allowNegativeBalance: boolean;
  autoApproveSickLeave: boolean;
  blackoutPeriods: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
  }[];
}
