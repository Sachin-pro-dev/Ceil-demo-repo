import { Pool } from 'pg';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'employee' | 'manager';
  manager_id?: number;
}

export interface LeaveRequest {
  id: number;
  user_id: number;
  start_date: Date;
  end_date: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: Date;
  updated_at: Date;
}

export class LeaveApprovalEngine {
  private db: Pool;

  constructor(dbPool: Pool) {
    this.db = dbPool;
  }

  /**
   * Creates a new leave request in 'pending' status
   */
  async createRequest(userId: number, startDate: Date, endDate: Date, reason: string): Promise<LeaveRequest> {
    if (startDate > endDate) {
      throw new Error('Start date cannot be after end date');
    }

    const query = `
      INSERT INTO leave_requests (user_id, start_date, end_date, reason, status)
      VALUES ($1, $2, $3, $4, 'pending')
      RETURNING *;
    `;
    const result = await this.db.query(query, [userId, startDate, endDate, reason]);
    return result.rows[0];
  }

  /**
   * Transitions leave request status. Only managers are permitted to execute transitions.
   */
  async transitionStatus(
    requestId: number,
    approver: User,
    action: 'approved' | 'rejected',
    comments?: string
  ): Promise<LeaveRequest> {
    // Role-based authorization guard
    if (approver.role !== 'manager') {
      throw new Error('Unauthorized: Only managers can approve or reject leave requests');
    }

    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      // Fetch and lock the row to avoid race conditions
      const requestRes = await client.query('SELECT * FROM leave_requests WHERE id = $1 FOR UPDATE', [requestId]);
      if (requestRes.rowCount === 0) {
        throw new Error('Leave request not found');
      }

      const request: LeaveRequest = requestRes.rows[0];
      if (request.status !== 'pending') {
        throw new Error(`Cannot transition leave request; current status is already ${request.status}`);
      }

      // Update the status of the request
      const updateQuery = `
        UPDATE leave_requests
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *;
      `;
      const updatedRes = await client.query(updateQuery, [action, requestId]);

      // Log workflow action inside audit trail
      const historyQuery = `
        INSERT INTO approval_history (leave_request_id, actioned_by, action, comments)
        VALUES ($1, $2, $3, $4);
      `;
      await client.query(historyQuery, [requestId, approver.id, action, comments || null]);

      await client.query('COMMIT');
      return updatedRes.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}