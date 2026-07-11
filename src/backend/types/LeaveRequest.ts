export interface LeaveRequest {
  id: string;
  employeeName: string;
  type: 'Annual' | 'Sick' | 'Personal' | 'Maternity/Paternity' | 'Other';
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approverName?: string;
}
