import { Request, Response } from 'express';
import { Pool } from 'pg';

// Database configuration pool (assumed to be injected or globally configured)
const db = new Pool();

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'EMPLOYEE' | 'MANAGER' | 'ADMIN';
  manager_id: number | null;
}

export interface LeaveRequest {
  id: number;
  employee_id: number;
  start_date: string;
  end_date: string;
  leave_type: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  current_approver_id: number | null;
}

export class ApprovalWorkflowController {
  
  /**
   * Submits a new leave request and automatically routes it to the employee's manager.
   */
  public static async submitRequest(req: Request, res: Response): Promise<Response> {
    const { employeeId, startDate, endDate, leaveType } = req.body;

    if (!employeeId || !startDate || !endDate || !leaveType) {
      return res.status(400).json({ error: 'Missing required leave request fields.' });
    }

    try {
      // Step 1: Retrieve the employee and identify their manager for routing
      const userRes = await db.query('SELECT * FROM users WHERE id = $1', [employeeId]);
      if (userRes.rowCount === 0) {
        return res.status(404).json({ error: 'Employee record not found.' });
      }

      const employee: User = userRes.rows[0];
      if (!employee.manager_id) {
        return res.status(400).json({ error: 'Employee has no designated manager to approve requests.' });
      }

      // Step 2: Create the leave request, routing it directly to the manager
      const insertQuery = `
        INSERT INTO leave_requests (employee_id, start_date, end_date, leave_type, status, current_approver_id)
        VALUES ($1, $2, $3, $4, 'PENDING', $5)
        RETURNING *
      `;
      const newRequestRes = await db.query(insertQuery, [
        employee.id,
        startDate,
        endDate,
        leaveType,
        employee.manager_id
      ]);

      return res.status(201).json({
        message: 'Leave request submitted and routed successfully.',
        request: newRequestRes.rows[0]
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Handles approval or rejection of a leave request with Role-Based Access Control (RBAC).
   */
  public static async processDecision(req: Request, res: Response): Promise<Response> {
    const { requestId } = req.params;
    const { actorId, action, comments } = req.body; // actorId is the current user executing the request

    if (!actorId || !['APPROVED', 'REJECTED'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action or missing actor ID.' });
    }

    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // Step 1: Fetch the actor (approver) and check their permissions
      const actorRes = await client.query('SELECT * FROM users WHERE id = $1', [actorId]);
      if (actorRes.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Actor user not found.' });
      }
      const actor: User = actorRes.rows[0];

      // Step 2: Fetch the targeted leave request
      const requestRes = await client.query('SELECT * FROM leave_requests WHERE id = $1', [requestId]);
      if (requestRes.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Leave request not found.' });
      }
      const leaveRequest: LeaveRequest = requestRes.rows[0];

      if (leaveRequest.status !== 'PENDING') {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'This leave request has already been processed.' });
      }

      // Step 3: Enforce Role-Based Access Control (RBAC)
      // Only the assigned manager/approver OR an Admin can approve/reject the request.
      const isAssignedApprover = leaveRequest.current_approver_id === actor.id;
      const isAdmin = actor.role === 'ADMIN';

      if (!isAssignedApprover && !isAdmin) {
        await client.query('ROLLBACK');
        return res.status(403).json({
          error: 'Access Denied: You are not authorized to approve or reject this request.'
        });
      }

      // Step 4: Update the Leave Request Status
      await client.query(
        'UPDATE leave_requests SET status = $1, current_approver_id = NULL WHERE id = $2',
        [action, requestId]
      );

      // Step 5: Log transaction into the Audit History
      const historyQuery = `
        INSERT INTO approval_history (request_id, approver_id, action, comments)
        VALUES ($1, $2, $3, $4)
      `;
      await client.query(historyQuery, [requestId, actor.id, action, comments || null]);

      await client.query('COMMIT');
      return res.status(200).json({
        message: `Leave request successfully ${action.toLowerCase()}d.`
      });
    } catch (error: any) {
      await client.query('ROLLBACK');
      return res.status(500).json({ error: error.message });
    } finally {
      client.release();
    }
  }
}