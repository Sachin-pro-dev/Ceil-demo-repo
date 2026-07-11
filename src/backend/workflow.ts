/**
 * State Machine configuration and transitions for role-based leave request approvals.
 */

export type LeaveStatus = 'PENDING_MANAGER' | 'PENDING_HR' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type UserRole = 'EMPLOYEE' | 'MANAGER' | 'HR';
export type WorkflowAction = 'APPROVE' | 'REJECT' | 'CANCEL';

export interface WorkflowTransition {
    from: LeaveStatus;
    role: UserRole;
    action: WorkflowAction;
    to: LeaveStatus;
}

// State Machine transitions mapping valid actions to target states based on user roles
const TRANSITIONS: WorkflowTransition[] = [
    // Manager approvals transition to HR review
    { from: 'PENDING_MANAGER', role: 'MANAGER', action: 'APPROVE', to: 'PENDING_HR' },
    { from: 'PENDING_MANAGER', role: 'MANAGER', action: 'REJECT', to: 'REJECTED' },

    // HR approvals transition directly to Approved
    { from: 'PENDING_HR', role: 'HR', action: 'APPROVE', to: 'APPROVED' },
    { from: 'PENDING_HR', role: 'HR', action: 'REJECT', to: 'REJECTED' },

    // Employee is permitted to cancel requests that are still pending
    { from: 'PENDING_MANAGER', role: 'EMPLOYEE', action: 'CANCEL', to: 'CANCELLED' },
    { from: 'PENDING_HR', role: 'EMPLOYEE', action: 'CANCEL', to: 'CANCELLED' }
];

/**
 * Evaluates the next leave status based on the current state, action, and user role.
 * Throws an informative error if a transition is invalid.
 */
export function getNextState(currentState: LeaveStatus, role: UserRole, action: WorkflowAction): LeaveStatus {
    const transition = TRANSITIONS.find(
        t => t.from === currentState && t.role === role && t.action === action
    );
    if (!transition) {
        throw new Error(`Transition rejected: Role '${role}' is not allowed to perform action '${action}' on a request with status '${currentState}'.`);
    }
    return transition.to;
}