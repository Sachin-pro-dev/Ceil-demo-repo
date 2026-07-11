/**
 * Approval Engine for Leave Requests
 * Enforces hierarchical role-based logic: Employee -> Manager Gate -> HR Gate -> Completed
 */

export type UserRole = 'EMPLOYEE' | 'MANAGER' | 'HR';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ApprovalGate = 'MANAGER_GATE' | 'HR_GATE' | 'COMPLETED';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface LeaveRequest {
  id: number;
  userId: number;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  status: LeaveStatus;
  currentGate: ApprovalGate;
}

export interface ApprovalAction {
  leaveRequestId: number;
  approver: User;
  action: 'APPROVE' | 'REJECT';
  comments?: string;
}

export class ApprovalEngine {
  /**
   * Processes an approval or rejection step, strictly enforcing the sequence:
   * 1. MANAGER_GATE must be approved by a user with 'MANAGER' (or 'HR') role.
   * 2. HR_GATE must be approved by a user with 'HR' role.
   * 3. Any rejection immediately marks the request as REJECTED and halts the pipeline.
   */
  public static transitionGate(
    request: LeaveRequest,
    action: ApprovalAction
  ): { updatedRequest: LeaveRequest; nextGate: ApprovalGate } {
    if (request.status === 'APPROVED' || request.status === 'REJECTED') {
      throw new Error('Cannot process action on a completed leave request.');
    }

    const approverRole = action.approver.role;

    if (action.action === 'REJECT') {
      return {
        updatedRequest: {
          ...request,
          status: 'REJECTED',
        },
        nextGate: 'COMPLETED',
      };
    }

    // Handle APPROVE actions
    switch (request.currentGate) {
      case 'MANAGER_GATE':
        if (approverRole !== 'MANAGER' && approverRole !== 'HR') {
          throw new Error('Unauthorized: Only Managers or HR can approve the Manager Gate.');
        }
        return {
          updatedRequest: {
            ...request,
            currentGate: 'HR_GATE',
          },
          nextGate: 'HR_GATE',
        };

      case 'HR_GATE':
        if (approverRole !== 'HR') {
          throw new Error('Unauthorized: Only HR can approve the HR Gate.');
        }
        return {
          updatedRequest: {
            ...request,
            status: 'APPROVED',
            currentGate: 'COMPLETED',
          },
          nextGate: 'COMPLETED',
        };

      case 'COMPLETED':
      default:
        throw new Error('Leave request is already in a completed gate.');
    }
  }
}