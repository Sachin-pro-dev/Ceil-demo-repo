/**
 * Type definitions representing system analytics, leave reports, and configuration settings
 * for the HR Admin Dashboard.
 */

export interface LeaveAnalytics {
  totalRequests: number;
  approvedRequests: number;
  pendingRequests: number;
  rejectedRequests: number;
  utilizationRate: number; // percentage of workforce on leave
  departmentBreakdown: {
    department: string;
    takenDays: number;
    activeLeaves: number;
  }[];
}

export interface LeaveReportItem {
  id: string;
  employeeName: string;
  department: string;
  leaveType: 'Vacation' | 'Sick' | 'Personal' | 'Maternity/Paternity' | 'Bereavement';
  startDate: string;
  endDate: string;
  durationDays: number;
  status: 'Approved' | 'Pending' | 'Rejected';
}

export interface SystemConfig {
  allowAutoApproval: boolean;
  maxConsecutiveDays: number;
  carryOverDaysLimit: number;
  notifyHRThresholdDays: number;
  blackoutDates: string[];
}
