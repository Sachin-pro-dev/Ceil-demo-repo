/**
 * Approval Workflow Engine
 * Handles role-based access control and state transitions for multi-level approval requests.
 */

export type UserRole = 'EMPLOYEE' | 'MANAGER' | 'HR';
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type StepStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: number;
  name: string;
  role: UserRole;
}

export interface ApprovalRequest {
  id: number;
  requesterId: number;
  title: string;
  description: string;
  status: RequestStatus;
  currentStep: number;
  totalSteps: number;
}

export interface ApprovalStep {
  id: number;
  requestId: number;
  stepNumber: number;
  requiredRole: UserRole;
  status: StepStatus;
  approverId?: number;
  actionedAt?: Date;
  comment?: string;
}

export class ApprovalWorkflowEngine {
  // In a real production scenario, these methods would execute SQL queries against a database pool.
  // This implementation encapsulates the core domain logic, validation, and state machine transitions.

  /**
   * Initiates a new approval request with defined multi-level steps.
   */
  public async createRequest(
    requester: User,
    title: string,
    description: string,
    workflowTemplate: UserRole[]
  ): Promise<{ request: Omit<ApprovalRequest, 'id'>; steps: Omit<ApprovalStep, 'id'>[] }> {
    if (workflowTemplate.length === 0) {
      throw new Error('An approval workflow must contain at least one step.');
    }

    const request: Omit<ApprovalRequest, 'id'> = {
      requesterId: requester.id,
      title,
      description,
      status: 'PENDING',
      currentStep: 1,
      totalSteps: workflowTemplate.length,
    };

    const steps: Omit<ApprovalStep, 'id'>[] = workflowTemplate.map((role, index) => ({
      requestId: 0, // Assigned upon database insertion
      stepNumber: index + 1,
      requiredRole: role,
      status: 'PENDING',
    }));

    return { request, steps };
  }

  /**
   * Processes an action (APPROVE/REJECT) on a specific workflow step with RBAC validation.
   */
  public async processStepAction(
    approver: User,
    request: ApprovalRequest,
    currentStep: ApprovalStep,
    action: 'APPROVE' | 'REJECT',
    comment?: string
  ): Promise<{
    updatedRequest: ApprovalRequest;
    updatedStep: ApprovalStep;
  }> {
    // 1. Validate request is still active
    if (request.status !== 'PENDING') {
      throw new Error(`Cannot action request. Current status is ${request.status}.`);
    }

    // 2. Validate current step alignment
    if (request.currentStep !== currentStep.stepNumber) {
      throw new Error('This step is not currently active for approval.');
    }

    // 3. Prevent self-approval (Employees cannot approve their own requests)
    if (request.requesterId === approver.id) {
      throw new Error('Requesters are not permitted to approve or reject their own requests.');
    }

    // 4. Validate Role-Based Access Control (RBAC)
    if (approver.role !== currentStep.requiredRole) {
      throw new Error(
        `Unauthorized. This step requires the role: ${currentStep.requiredRole}. User has role: ${approver.role}.`
      );
    }

    // Clone objects to maintain immutability
    const updatedStep: ApprovalStep = {
      ...currentStep,
      status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
      approverId: approver.id,
      actionedAt: new Date(),
      comment,
    };

    const updatedRequest: ApprovalRequest = { ...request };

    if (action === 'REJECT') {
      // Rejection immediately terminates the entire workflow
      updatedRequest.status = 'REJECTED';
    } else {
      // If approved, check if there are further steps
      if (request.currentStep < request.totalSteps) {
        updatedRequest.currentStep += 1;
      } else {
        // Last step completed successfully
        updatedRequest.status = 'APPROVED';
      }
    }

    return { updatedRequest, updatedStep };
  }
}
