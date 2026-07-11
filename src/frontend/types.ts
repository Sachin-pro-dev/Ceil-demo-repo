export interface LeaveStats {
  totalEmployees: number;
  activeLeaves: number;
  pendingApprovals: number;
  carryoverDaysLimit: number;
}

export interface DepartmentReport {
  department: string;
  takenDays: number;
  allocatedDays: number;
  pendingDays: number;
}

export interface SystemConfig {
  allowNegativeBalance: boolean;
  maxConsecutiveDays: number;
  autoApproveSickLeave: boolean;
  fiscalYearStart: string;
  defaultAnnualAllowance: number;
}
