import { LeaveRequest } from './types';

/**
 * Mock dataset representing leave requests for the organization.
 */
export const initialLeaveRequests: LeaveRequest[] = [
  {
    id: 'LR-101',
    employeeName: 'Sarah Jenkins',
    department: 'Engineering',
    leaveType: 'Vacation',
    startDate: '2023-11-10',
    endDate: '2023-11-17',
    totalDays: 5,
    status: 'Pending',
    reason: 'Annual family trip to Hawaii.',
    appliedDate: '2023-10-25'
  },
  {
    id: 'LR-102',
    employeeName: 'Michael Chen',
    department: 'Product',
    leaveType: 'Sick',
    startDate: '2023-11-02',
    endDate: '2023-11-03',
    totalDays: 2,
    status: 'Approved',
    reason: 'Dental surgery recovery.',
    appliedDate: '2023-11-01'
  },
  {
    id: 'LR-103',
    employeeName: 'Elena Rostova',
    department: 'Design',
    leaveType: 'Personal',
    startDate: '2023-11-15',
    endDate: '2023-11-16',
    totalDays: 1,
    status: 'Pending',
    reason: 'Moving to a new apartment.',
    appliedDate: '2023-10-28'
  },
  {
    id: 'LR-104',
    employeeName: 'Marcus Aurelius',
    department: 'Engineering',
    leaveType: 'Maternity/Paternity',
    startDate: '2023-12-01',
    endDate: '2023-12-15',
    totalDays: 10,
    status: 'Pending',
    reason: 'Paternity leave for newborn child.',
    appliedDate: '2023-10-29'
  },
  {
    id: 'LR-105',
    employeeName: 'Emily Watson',
    department: 'Marketing',
    leaveType: 'Vacation',
    startDate: '2023-11-20',
    endDate: '2023-11-24',
    totalDays: 5,
    status: 'Rejected',
    reason: 'Overlapping with critical campaign launch.',
    appliedDate: '2023-10-20'
  }
];
