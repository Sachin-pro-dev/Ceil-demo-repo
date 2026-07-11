export type Role = 'SUBMITTER' | 'MANAGER' | 'ADMIN';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  username: string;
  role: Role;
}

export interface ApprovalRequest {
  id: string;
  title: string;
  submitterId: string;
  status: ApprovalStatus;
  assignedToRole: Role;
  updatedBy?: string;
  updatedAt?: Date;
}

/**
 * State machine governing transition logic for workflow requests.
 * Restricts transitions to valid roles and prevents users from approving their own submissions.
 */
export class ApprovalStateMachine {
  static transition(
    request: ApprovalRequest,
    actor: User,
    action: 'APPROVE' | 'REJECT'
  ): ApprovalRequest {
    // Only MANAGERS or ADMINS can approve/reject workflow requests
    if (actor.role !== 'MANAGER' && actor.role !== 'ADMIN') {
      throw new Error(`Unauthorized: Role '${actor.role}' cannot perform approval actions.`);
    }

    // Prevent self-approval (segregation of duties) unless they are an Admin overriding
    if (request.submitterId === actor.id && actor.role !== 'ADMIN') {
      throw new Error('Unauthorized: Submitters cannot approve or reject their own requests.');
    }

    // State validation: only PENDING requests can be approved or rejected
    if (request.status !== 'PENDING') {
      throw new Error(`Invalid transition: Cannot action a request that is already ${request.status}.`);
    }

    const nextStatus: ApprovalStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

    return {
      ...request,
      status: nextStatus,
      updatedBy: actor.id,
      updatedAt: new Date(),
    };
  }
}
