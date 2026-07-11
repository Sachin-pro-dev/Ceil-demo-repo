/**
 * Type definitions for the Admin Dashboard metrics, configurations, and overrides.
 */

export interface LeaveReport {
  totalEmployees: number;
  activeLeavesToday: number;
  pendingApprovals: number;
  leaveTypeDistribution: {
    annual: number;
    sick: number;
    unpaid: number;
    parental: number;
  };
}

export interface UserLeaveBalance {
  userId: string;
  userName: string;
  email: string;
  annualLeaveRemaining: number;
  sickLeaveRemaining: number;
  unpaidLeaveUsed: number;
}

export interface SystemOverrideAction {
  id: string;
  actionType: 'FREEZE_ALL_LEAVES' | 'AUTO_APPROVE_PENDING' | 'RESET_ALL_BALANCES';
  status: 'ACTIVE' | 'INACTIVE' | 'EXECUTED';
  timestamp: string;
  performedBy: string;
  reason: string;
}