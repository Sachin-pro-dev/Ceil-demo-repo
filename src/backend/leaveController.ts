import { Request, Response, Router } from 'express';

// TypeScript Interfaces representing our DB Models
interface User {
  id: number;
  name: string;
  email: string;
  role: 'EMPLOYEE' | 'MANAGER' | 'HR';
}

interface LeaveRequest {
  id: number;
  user_id: number;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'PENDING' | 'APPROVED_BY_MANAGER' | 'APPROVED' | 'REJECTED';
}

// Mock DB Client Interface for demonstration purposes.
// In a production app, this would import from your DB connection pool (e.g., pg, TypeORM, or Prisma).
interface DbClient {
  query: (sql: string, params?: any[]) => Promise<{ rows: any[] }>;
}

export function createLeaveRouter(db: DbClient): Router {
  const router = Router();

  /**
   * POST /leaves
   * Submit a new leave request.
   * Accessible by any authenticated user.
   */
  router.post('/', async (req: Request, res: Response) => {
    try {
      const { userId, startDate, endDate, reason } = req.body;

      if (!userId || !startDate || !endDate || !reason) {
        return res.status(400).json({ error: 'Missing required fields: userId, startDate, endDate, reason' });
      }

      // Validate that start_date is before or equal to end_date
      if (new Date(startDate) > new Date(endDate)) {
        return res.status(400).json({ error: 'Start date must be before or equal to end date' });
      }

      const queryText = `
        INSERT INTO leave_requests (user_id, start_date, end_date, reason, status)
        VALUES ($1, $2, $3, $4, 'PENDING')
        RETURNING *
      `;
      const result = await db.query(queryText, [userId, startDate, endDate, reason]);
      
      return res.status(201).json({
        message: 'Leave request submitted successfully.',
        leaveRequest: result.rows[0]
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /leaves/:id/approve
   * Approve or Reject a leave request with sequential role-based workflow validation:
   * 1. PENDING -> APPROVED_BY_MANAGER (Requires MANAGER or HR)
   * 2. APPROVED_BY_MANAGER -> APPROVED (Requires HR)
   * 3. Any active request can be REJECTED by either MANAGER or HR.
   */
  router.post('/:id/approve', async (req: Request, res: Response) => {
    try {
      const leaveId = parseInt(req.params.id, 10);
      const { approverId, action, comments } = req.body; // action: 'APPROVE' | 'REJECT'

      if (!approverId || !action || !['APPROVE', 'REJECT'].includes(action)) {
        return res.status(400).json({ error: 'Valid approverId and action (APPROVE/REJECT) are required.' });
      }

      // Fetch Approver Details
      const userRes = await db.query('SELECT * FROM users WHERE id = $1', [approverId]);
      if (userRes.rows.length === 0) {
        return res.status(404).json({ error: 'Approver user not found.' });
      }
      const approver: User = userRes.rows[0];

      // Verify Role Access
      if (approver.role !== 'MANAGER' && approver.role !== 'HR') {
        return res.status(403).json({ error: 'Access denied. Only Managers and HR can approve/reject leave requests.' });
      }

      // Fetch Leave Request Details
      const leaveRes = await db.query('SELECT * FROM leave_requests WHERE id = $1', [leaveId]);
      if (leaveRes.rows.length === 0) {
        return res.status(404).json({ error: 'Leave request not found.' });
      }
      const leaveRequest: LeaveRequest = leaveRes.rows[0];

      // Prevent processing finalized requests
      if (leaveRequest.status === 'APPROVED' || leaveRequest.status === 'REJECTED') {
        return res.status(400).json({ error: `Cannot update a request that is already ${leaveRequest.status}.` });
      }

      let nextStatus: LeaveRequest['status'];

      if (action === 'REJECT') {
        nextStatus = 'REJECTED';
      } else {
        // Action is 'APPROVE'. Apply workflow state machine logic:
        if (leaveRequest.status === 'PENDING') {
          // Managers or HR can perform the first tier approval
          nextStatus = approver.role === 'HR' ? 'APPROVED' : 'APPROVED_BY_MANAGER';
        } else if (leaveRequest.status === 'APPROVED_BY_MANAGER') {
          // Only HR can perform the final tier approval
          if (approver.role !== 'HR') {
            return res.status(403).json({ error: 'Only HR can perform the final approval on manager-approved requests.' });
          }
          nextStatus = 'APPROVED';
        } else {
          return res.status(400).json({ error: 'Invalid workflow transition state.' });
        }
      }

      // Update Leave Request Status and log the approval transition in a simple transaction flow
      await db.query('BEGIN');
      
      const updateQuery = 'UPDATE leave_requests SET status = $1 WHERE id = $2 RETURNING *';
      const updatedRequestRes = await db.query(updateQuery, [nextStatus, leaveId]);

      const logQuery = `
        INSERT INTO approval_history (request_id, approver_id, action, comments)
        VALUES ($1, $2, $3, $4)
      `;
      await db.query(logQuery, [leaveId, approverId, action, comments || '']);

      await db.query('COMMIT');

      return res.status(200).json({
        message: `Leave request successfully updated to: ${nextStatus}`,
        leaveRequest: updatedRequestRes.rows[0]
      });
    } catch (error: any) {
      await db.query('ROLLBACK').catch(() => {});
      return res.status(500).json({ error: error.message });
    }
  });

  return router;
}
