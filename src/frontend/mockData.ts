export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';
export type LeaveType = 'Vacation' | 'Sick Leave' | 'Personal' | 'Maternity/Paternity' | 'Bereavement';

export interface LeaveRequest {
  id: string;
  employeeName: string;
  department: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  status: LeaveStatus;
  reason: string;
}

export const MOCK_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'LR-101',
    employeeName: 'Sarah Connor',
    department: 'Engineering',
    leaveType: 'Vacation',
    startDate: '2024-11-10',
    endDate: '2024-11-17',
    days: 5,
    status: 'Approved',
    reason: 'Family trip to Hawaii'
  },
  {
    id: 'LR-102',
    employeeName: 'John Doe',
    department: 'Sales',
    leaveType: 'Sick Leave',
    startDate: '2024-11-05',
    endDate: '2024-11-06',
    days: 2,
    status: 'Approved',
    reason: 'Dental surgery recovery'
  },
  {
    id: 'LR-103',
    employeeName: 'Alice Johnson',
    department: 'Marketing',
    leaveType: 'Personal',
    startDate: '2024-11-12',
    endDate: '2024-11-13',
    days: 1,
    status: 'Pending',
    reason: 'Moving to new apartment'
  },
  {
    id: 'LR-104',
    employeeName: 'Michael Scott',
    department: 'Management',
    leaveType: 'Vacation',
    startDate: '2024-12-20',
    endDate: '2024-12-31',
    days: 8,
    status: 'Pending',
    reason: 'Annual holiday vacation'
  },
  {
    id: 'LR-105',
    employeeName: 'Pam Beesly',
    department: 'Design',
    leaveType: 'Maternity/Paternity',
    startDate: '2024-11-25',
    endDate: '2025-02-15',
    days: 60,
    status: 'Approved',
    reason: 'Maternity leave'
  },
  {
    id: 'LR-106',
    employeeName: 'Dwight Schrute',
    department: 'Sales',
    leaveType: 'Bereavement',
    startDate: '2024-11-08',
    endDate: '2024-11-10',
    days: 3,
    status: 'Rejected',
    reason: 'Personal loss'
  },
  {
    id: 'LR-107',
    employeeName: 'Jim Halpert',
    department: 'Sales',
    leaveType: 'Vacation',
    startDate: '2024-11-15',
    endDate: '2024-11-22',
    days: 6,
    status: 'Pending',
    reason: 'Camping trip'
  }
];

export const DEPARTMENTS = ['All Departments', 'Engineering', 'Sales', 'Marketing', 'Management', 'Design'];
export const STATUSES = ['All Statuses', 'Pending', 'Approved', 'Rejected'];
