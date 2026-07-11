/**
 * Core workflow engine for processing multi-tier role-based leave approvals.
 * Validates transitions and enforces RBAC policies.
 */

export type UserRole = 'EMPLOYEE' | 'MANAGER' | 'HR' | 'DIRECTOR';
export type LeaveStatus = 'PENDING_MANAGER' | 'PENDING_HR' | 'APPROVED' | 'REJECTED';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  managerId?: number;
}

export interface LeaveRequest {
  id: number;
  employeeId: number;
  startDate: string;
  endDate: string;
  leaveType: string;
  status: LeaveStatus;
  reason?: string;
}

export interface ApprovalLog {
  id: number;
  requestId: number;
  approverId: number;
  action: 'APPROVE' | 'REJECT';
  comments?: string;
  createdAt: Date;
}

export class LeaveWorkflowEngine {
  // Simulated database state for demonstration & testing
  private users: Map<number, User> = new Map();
  private requests: Map<number, LeaveRequest> = new Map();
  private logs: ApprovalLog[] = [];
  private nextRequestId = 1;
  private nextLogId = 1;

  constructor(initialUsers: User[]) {
    initialUsers.forEach(u => this.users.set(u.id, u));
  }

  /**
   * Submits a new leave request. Initiates workflow at PENDING_MANAGER.
   */
  public createRequest(employeeId: number, startDate: string, endDate: string, leaveType: string, reason?: string): LeaveRequest {
    const employee = this.users.get(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    const request: LeaveRequest = {
      id: this.nextRequestId++,
      employeeId,
      startDate,
      endDate,
      leaveType,
      status: 'PENDING_MANAGER',
      reason
    };

    this.requests.set(request.id, request);
    return request;
  }

  /**
   * Processes an approval action, enforcing multi-tier RBAC rules.
   */
  public processApproval(approverId: number, requestId: number, action: 'APPROVE' | 'REJECT', comments?: string): LeaveRequest {
    const approver = this.users.get(approverId);
    const request = this.requests.get(requestId);

    if (!approver) throw new Error('Approver not found');
    if (!request) throw new Error('Leave request not found');

    const employee = this.users.get(request.employeeId);
    if (!employee) throw new Error('Request owner not found');

    // Rejecting immediately moves status to REJECTED regardless of tier
    if (action === 'REJECT') {
      this.validateCanApprove(approver, request, employee);
      request.status = 'REJECT';
      this.logApproval(requestId, approverId, 'REJECT', comments);
      return request;
    }

    // Multi-tier workflow state machine validation
    this.validateCanApprove(approver, request, employee);

    if (request.status === 'PENDING_MANAGER') {
      // If approved by Manager (or Director/HR bypass), elevate to PENDING_HR
      request.status = 'PENDING_HR';
    } else if (request.status === 'PENDING_HR') {
      // If approved by HR (or Director bypass), mark as APPROVED
      request.status = 'APPROVED';
    }

    this.logApproval(requestId, approverId, 'APPROVE', comments);
    return request;
  }

  /**
   * Enforces RBAC permissions based on roles and hierarchy.
   */
  private validateCanApprove(approver: User, request: LeaveRequest, employee: User): void {
    // Directors override all checks
    if (approver.role === 'DIRECTOR') return;

    if (request.status === 'PENDING_MANAGER') {
      // Must be HR, or the employee's direct manager
      const isDirectManager = employee.managerId === approver.id;
      const isManagerRole = approver.role === 'MANAGER';
      const isHr = approver.role === 'HR';
      
      if (!isHr && !(isManagerRole && isDirectManager)) {
        throw new Error('Unauthorized: Only the designated manager or HR can approve this tier');
      }
    }

    if (request.status === 'PENDING_HR') {
      // Must be HR to complete final tier
      if (approver.role !== 'HR') {
        throw new Error('Unauthorized: Only HR can approve the final tier');
      }
    }

    if (request.status === 'APPROVED' || request.status === 'REJECTED') {
      throw new Error('Workflow is already in a terminal state');
    }
  }

  private logApproval(requestId: number, approverId: number, action: 'APPROVE' | 'REJECT', comments?: string): void {
    this.logs.push({
      id: this.nextLogId++,
      requestId,
      approverId,
      action,
      comments,
      createdAt: new Date()
    });
  }

  public getRequest(id: number): LeaveRequest | undefined {
    return this.requests.get(id);
  }

  public getLogsForRequest(requestId: number): ApprovalLog[] {
    return this.logs.filter(log => log.requestId === requestId);
  }
}
