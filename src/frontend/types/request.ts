export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface Request {
  id: string;
  employeeId: string;
  employeeName: string;
  type: string;
  details: string;
  status: RequestStatus;
  createdAt: string;
}
