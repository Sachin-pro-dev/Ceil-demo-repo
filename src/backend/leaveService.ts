import { Pool } from 'pg';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'employee' | 'manager' | 'hr';
  manager_id: number | null;
}

export interface LeaveRequest {
  id: number;
  employee_id: number;
  start_date: Date;
  end_date: Date;
  leave_type: string;
  reason: string | null;
  status: 'pending_manager' | 'pending_hr' | 'approved' | 'rejected';
  current_approver_id: number | null;
  created_at: Date;
}

export class LeaveWorkflowEngine {
  private db: Pool;

  constructor(dbPool: Pool) {
    this.db = dbPool;
  }

  /**
   * Submits a new leave request and routes it to the appropriate manager.
   */
  async submitRequest(params: {
    employeeId: number;
    startDate: string;
    endDate: string;
    leaveType: string;
    reason?: string;
  }): Promise<LeaveRequest> {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      // 1. Fetch employee and their manager
      const userRes = await client.query<User>('SELECT * FROM users WHERE id = $1', [params.employeeId]);
      if (userRes.rowCount === 0) {
        throw new Error('Employee not found');
      }
      const employee = userRes.rows[0];

      let initialStatus: LeaveRequest['status'] = 'pending_manager';
      let nextApproverId: number | null = employee.manager_id;

      // Role-based routing logic:
      // If employee has no manager (e.g. Executive), route directly to HR
      if (!nextApproverId) {
        const hrRes = await client.query<User>("SELECT id FROM users WHERE role = 'hr' LIMIT 1");
        if (hrRes.rowCount === 0) {
          throw new Error('No HR personnel configured in system to route request.');
        }
        nextApproverId = hrRes.rows[0].id;
        initialStatus = 'pending_hr';
      }

      // 2. Insert leave request
      const insertQuery = `
        INSERT INTO leave_requests (employee_id, start_date, end_date, leave_type, reason, status, current_approver_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      const requestRes = await client.query<LeaveRequest>(insertQuery, [
        params.employeeId,
        params.startDate,
        params.endDate,
        params.leaveType,
        params.reason || null,
        initialStatus,
        nextApproverId
      ]);

      await client.query('COMMIT');
      return requestRes.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Processes approval or rejection decisions and advances the workflow engine state.
   */
  async processApproval(params: {
    requestId: number;
    approverId: number;
    action: 'approve' | 'reject';
    comments?: string;
  }): Promise<LeaveRequest> {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      // 1. Fetch current leave request and lock for update
      const requestRes = await client.query<LeaveRequest>(
        'SELECT * FROM leave_requests WHERE id = $1 FOR UPDATE',
        [params.requestId]
      );
      if (requestRes.rowCount === 0) {
        throw new Error('Leave request not found');
      }
      const request = requestRes.rows[0];

      // 2. Authorization checks
      if (request.status === 'approved' || request.status === 'rejected') {
        throw new Error('Leave request has already been finalized');
      }
      if (request.current_approver_id !== params.approverId) {
        throw new Error('You are not authorized to approve this request at this stage');
      }

      const approverRes = await client.query<User>('SELECT role FROM users WHERE id = $1', [params.approverId]);
      const approver = approverRes.rows[0];

      let nextStatus: LeaveRequest['status'] = request.status;
      let nextApproverId: number | null = null;

      // 3. Workflow Engine State Transitions
      if (params.action === 'reject') {
        nextStatus = 'rejected';
        nextApproverId = null;
      } else if (params.action === 'approve') {
        if (request.status === 'pending_manager') {
          // Route to HR for final approval
          const hrRes = await client.query<User>("SELECT id FROM users WHERE role = 'hr' LIMIT 1");
          if (hrRes.rowCount === 0) {
            // Fallback: If no HR is configured, finalize approval
            nextStatus = 'approved';
            nextApproverId = null;
          } else {
            nextStatus = 'pending_hr';
            nextApproverId = hrRes.rows[0].id;
          }
        } else if (request.status === 'pending_hr') {
          // Finalized approval
          nextStatus = 'approved';
          nextApproverId = null;
        }
      }

      // 4. Update request status
      const updateRes = await client.query<LeaveRequest>(
        `UPDATE leave_requests 
         SET status = $1, current_approver_id = $2
         WHERE id = $3
         RETURNING *`,
        [nextStatus, nextApproverId, params.requestId]
      );

      // 5. Log approval history
      await client.query(
        `INSERT INTO approval_history (leave_request_id, approver_id, action, comments)
         VALUES ($1, $2, $3, $4)`,
        [params.requestId, params.approverId, params.action, params.comments || null]
      );

      await client.query('COMMIT');
      return updateRes.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
