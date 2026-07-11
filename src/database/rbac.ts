export type Role = 'EMPLOYEE' | 'MANAGER' | 'ADMIN';
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  managerId: string | null;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  leaveTypeId: string;
  startDate: Date;
  endDate: Date;
  status: RequestStatus;
  reason: string | null;
  approverId: string | null;
}

export type Action =
  | 'CREATE_REQUEST'      // Submit own leave request
  | 'VIEW_OWN_REQUESTS'   // View own history
  | 'VIEW_TEAM_REQUESTS'  // View requests of direct reports
  | 'APPROVE_REQUEST'     // Approve/Reject direct reports' requests
  | 'MANAGE_SYSTEM'       // Admin configuration (leave types, user roles)
  | 'MANAGE_BALANCES';    // Update leave balances manually

/**
 * RBAC Policy Matrix defining which roles can perform which actions.
 * Dynamic checks (like matching user IDs or manager relationships) are handled in the checkPermission function.
 */
export function canUserPerformAction(
  actor: User,
  action: Action,
  context?: { requestOwner?: User; request?: LeaveRequest }
): boolean {
  // Admin bypass: Admins can perform all operational and system management tasks
  if (actor.role === 'ADMIN') {
    return true;
  }

  switch (action) {
    case 'CREATE_REQUEST':
    case 'VIEW_OWN_REQUESTS':
      // Any authenticated user can create or view their own requests
      if (context?.requestOwner) {
        return actor.id === context.requestOwner.id;
      }
      return true;

    case 'VIEW_TEAM_REQUESTS':
      // Managers can view team requests. Admins already bypassed above.
      return actor.role === 'MANAGER';

    case 'APPROVE_REQUEST':
      // Managers can approve requests if the target user reports to them
      if (actor.role === 'MANAGER' && context?.requestOwner) {
        return context.requestOwner.managerId === actor.id;
      }
      return false;

    case 'MANAGE_BALANCES':
      // Only Admins can manage balances globally (handled by admin bypass)
      return false;

    case 'MANAGE_SYSTEM':
      // Only Admins can manage system-wide tables (handled by admin bypass)
      return false;

    default:
      return false;
  }
}
