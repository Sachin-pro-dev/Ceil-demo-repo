export interface LeavePolicy {
  id: string;
  name: string;
  type: 'paid' | 'unpaid';
  daysAllowed: number;
  accrualRate: 'yearly' | 'monthly';
  carryOverMax: number;
  status: 'active' | 'inactive';
}

export interface LeaveRequest {
  id: string;
  employeeName: string;
  department: string;
  policyType: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
}

export interface AnalyticsSummary {
  totalEmployees: number;
  onLeaveToday: number;
  pendingApprovals: number;
  utilizationRate: number;
}
