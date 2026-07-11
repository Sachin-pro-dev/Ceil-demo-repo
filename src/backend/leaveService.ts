/**
 * State machine and business logic service for Leave Requests and RBAC workflows.
 */

export type UserRole = 'EMPLOYEE' | 'MANAGER' | 'HR';
export type LeaveStatus = 'PENDING_MANAGER' | 'PENDING_HR' | 'APPROVED' | 'REJECTED';

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
}

export interface LeaveRequest {
  id: number;
  userId: number;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: LeaveStatus;
}

export interface ApprovalAction {
  approverId: number;
  approverRole: UserRole;
  action: 'APPROVE' | 'REJECT';
  note?: string;
}

// Simple in-memory database mock for self-contained execution
export class LeaveService {
  private leaveRequests: Map<number, LeaveRequest> = new Map();
  private users: Map<number, User> = new Map();
  private history: Array<any> = [];
  private nextId = 1;

  constructor() {
    // Seed sample users
    this.users.set(1, { id: 1, email: 'emp@ceil.com', name: 'Alice Employee', role: 'EMPLOYEE' });
    this.users.set(2, { id: 2, email: 'mgr@ceil.com', name: 'Bob Manager', role: 'MANAGER' });
    this.users.set(3, { id: 3, email: 'hr@ceil.com', name: 'Charlie HR', role: 'HR' });
  }

  public async createRequest(userId: number, startDate: Date, endDate: Date, reason: string): Promise<LeaveRequest> {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');
    if (startDate > endDate) throw new Error('Start date cannot be after end date');

    const request: LeaveRequest = {
      id: this.nextId++,
      userId,
      startDate,
      endDate,
      reason,
      status: 'PENDING_MANAGER'
    };
    this.leaveRequests.set(request.id, request);
    return request;
  }

  public async getRequestById(id: number): Promise<LeaveRequest | null> {
    return this.leaveRequests.get(id) || null;
  }

  /**
   * State Machine transition logic enforcing RBAC rules.
   */
  public async processApproval(requestId: number, action: ApprovalAction): Promise<LeaveRequest> {
    const request = this.leaveRequests.get(requestId);
    if (!request) {
      throw new Error('Leave request not found');
    }

    const currentStatus = request.status;
    let nextStatus: LeaveStatus;

    // State machine transitions depending on current state, user role, and action
    switch (currentStatus) {
      case 'PENDING_MANAGER':
        if (action.approverRole !== 'MANAGER') {
          throw new Error('Only Managers can perform actions on manager-pending requests');
        }
        nextStatus = action.action === 'APPROVE' ? 'PENDING_HR' : 'REJECTED';
        break;

      case 'PENDING_HR':
        if (action.approverRole !== 'HR') {
          throw new Error('Only HR can perform actions on HR-pending requests');
        }
        nextStatus = action.action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
        break;

      case 'APPROVED':
      case 'REJECTED':
        throw new Error('Cannot change status of a finalized leave request');

      default:
        throw new Error('Invalid leave request state');
    }

    // Apply state change
    request.status = nextStatus;
    this.leaveRequests.set(requestId, request);

    // Log action
    this.history.push({
      id: this.history.length + 1,
      leaveRequestId: requestId,
      approverId: action.approverId,
      previousStatus: currentStatus,
      newStatus: nextStatus,
      note: action.note || '',
      timestamp: new Date()
    });

    return request;
  }

  public async getHistory(requestId: number) {
    return this.history.filter(h => h.leaveRequestId === requestId);
  }
}