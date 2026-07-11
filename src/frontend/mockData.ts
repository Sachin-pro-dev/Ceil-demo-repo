export interface LeaveRequest {
  id: string;
  employeeName: string;
  leaveType: 'Annual' | 'Sick' | 'Maternity/Paternity' | 'Unpaid';
  startDate: string;
  endDate: string;
  days: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  reason: string;
}

export interface EmployeeBalance {
  id: string;
  employeeName: string;
  department: string;
  annualAllocated: number;
  annualUsed: number;
  sickAllocated: number;
  sickUsed: number;
}

export const initialRequests: LeaveRequest[] = [
  {
    id: 'req-1',
    employeeName: 'Sarah Jenkins',
    leaveType: 'Annual',
    startDate: '2023-11-10',
    endDate: '2023-11-15',
    days: 5,
    status: 'Pending',
    reason: 'Family vacation'
  },
  {
    id: 'req-2',
    employeeName: 'Michael Chen',
    leaveType: 'Sick',
    startDate: '2023-11-02',
    endDate: '2023-11-03',
    days: 2,
    status: 'Pending',
    reason: 'Dental surgery'
  },
  {
    id: 'req-3',
    employeeName: 'Emily Rodriguez',
    leaveType: 'Annual',
    startDate: '2023-12-20',
    endDate: '2024-01-03',
    days: 10,
    status: 'Approved',
    reason: 'Christmas & New Year holidays'
  },
  {
    id: 'req-4',
    employeeName: 'David Kim',
    leaveType: 'Unpaid',
    startDate: '2023-11-20',
    endDate: '2023-11-21',
    days: 1,
    status: 'Pending',
    reason: 'Personal urgent matter'
  }
];

export const initialBalances: EmployeeBalance[] = [
  {
    id: 'emp-1',
    employeeName: 'Sarah Jenkins',
    department: 'Engineering',
    annualAllocated: 25,
    annualUsed: 12,
    sickAllocated: 10,
    sickUsed: 2
  },
  {
    id: 'emp-2',
    employeeName: 'Michael Chen',
    department: 'Product Management',
    annualAllocated: 25,
    annualUsed: 18,
    sickAllocated: 10,
    sickUsed: 4
  },
  {
    id: 'emp-3',
    employeeName: 'Emily Rodriguez',
    department: 'Design',
    annualAllocated: 30,
    annualUsed: 20,
    sickAllocated: 12,
    sickUsed: 0
  },
  {
    id: 'emp-4',
    employeeName: 'David Kim',
    department: 'QA Engineering',
    annualAllocated: 25,
    annualUsed: 5,
    sickAllocated: 10,
    sickUsed: 1
  }
];
