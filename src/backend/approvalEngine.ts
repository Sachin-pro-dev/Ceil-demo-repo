import { Router, Request, Response } from 'express';

// Mock Database interface for demonstration. In production, replace with a real pool (e.g., pg or knex).
interface Database {
  query(sql: string, params?: any[]): Promise<{ rows: any[] }>;
}

export function createApprovalRouter(db: Database): Router {
  const router = Router();

  /**
   * Submit a new leave request
   * Dynamically routes to the user's manager, or directly to HR if no manager exists
   */
  router.post('/leave-requests', async (req: Request, res: Response) => {
    const { requesterId, type, startDate, endDate, reason } = req.body;

    if (!requesterId || !type || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      // Fetch the requester and their manager
      const userRes = await db.query(
        'SELECT id, role, manager_id FROM users WHERE id = $1',
        [requesterId]
      );
      if (userRes.rows.length === 0) {
        return res.status(404).json({ error: 'Requester not found' });
      }

      const requester = userRes.rows[0];
      let status: 'PENDING_MANAGER' | 'PENDING_HR' = 'PENDING_MANAGER';
      let currentApproverId = requester.manager_id;

      // If the requester has no manager or is already a MANAGER, route directly to HR
      if (!currentApproverId || requester.role === 'MANAGER') {
        status = 'PENDING_HR';
        // Find any active HR user to assign as the default target, or leave NULL for pool-based HR pickup
        const hrRes = await db.query("SELECT id FROM users WHERE role = 'HR' LIMIT 1");
        currentApproverId = hrRes.rows[0]?.id || null;
      }

      const insertRes = await db.query(
        `INSERT INTO leave_requests (requester_id, type, start_date, end_date, reason, status, current_approver_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [requesterId, type, startDate, endDate, reason, status, currentApproverId]
      );

      return res.status(201).json({
        message: 'Leave request submitted successfully',
        request: insertRes.rows[0]
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  /**
   * Approve or Deny a pending leave request
   * Enforces role-based transition rules and updates current path
   */
  router.post('/leave-requests/:id/action', async (req: Request, res: Response) => {
    const requestId = parseInt(req.params.id);
    const { approverId, action, comments } = req.body; // action: 'APPROVE' | 'DENY'

    if (!approverId || !['APPROVE', 'DENY'].includes(action)) {
      return res.status(400).json({ error: 'Invalid or missing action parameters' });
    }

    try {
      // Fetch the leave request and the approver details
      const [requestRes, approverRes] = await Promise.all([
        db.query('SELECT * FROM leave_requests WHERE id = $1', [requestId]),
        db.query('SELECT id, role FROM users WHERE id = $1', [approverId])
      ]);

      const request = requestRes.rows[0];
      const approver = approverRes.rows[0];

      if (!request) {
        return res.status(404).json({ error: 'Leave request not found' });
      }
      if (!approver) {
        return res.status(404).json({ error: 'Approver user not found' });
      }

      // Validate if request is already finalized
      if (['APPROVED', 'DENIED'].includes(request.status)) {
        return res.status(400).json({ error: 'Leave request has already been finalized' });
      }

      // Role-Based Authorization Checks
      if (request.status === 'PENDING_MANAGER') {
        if (approver.id !== request.current_approver_id && approver.role !== 'HR') {
          return res.status(403).json({ error: 'Only the designated manager or HR can approve this stage' });
        }
      } else if (request.status === 'PENDING_HR') {
        if (approver.role !== 'HR') {
          return res.status(403).json({ error: 'Only HR personnel can approve this stage' });
        }
      }

      let nextStatus = request.status;
      let nextApproverId = request.current_approver_id;

      if (action === 'DENY') {
        nextStatus = 'DENIED';
        nextApproverId = null;
      } else if (action === 'APPROVE') {
        if (request.status === 'PENDING_MANAGER') {
          // Transition from Manager approval to HR approval
          nextStatus = 'PENDING_HR';
          const hrRes = await db.query("SELECT id FROM users WHERE role = 'HR' LIMIT 1");
          nextApproverId = hrRes.rows[0]?.id || null;
        } else if (request.status === 'PENDING_HR') {
          // Final approval
          nextStatus = 'APPROVED';
          nextApproverId = null;
        }
      }

      // Execute updates inside a transaction pattern
      await db.query(
        `UPDATE leave_requests
         SET status = $1, current_approver_id = $2, updated_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [nextStatus, nextApproverId, requestId]
      );

      await db.query(
        `INSERT INTO approval_logs (request_id, approver_id, action, comments)
         VALUES ($1, $2, $3, $4)`,
        [requestId, approverId, action === 'APPROVE' ? 'APPROVED' : 'DENIED', comments || '']
      );

      return res.status(200).json({
        message: `Request successfully ${action === 'APPROVE' ? 'approved' : 'denied'}`,
        status: nextStatus,
        nextApproverId
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  /**
   * Get pending requests for a specific user based on their role
   */
  router.get('/leave-requests/pending', async (req: Request, res: Response) => {
    const userId = req.query.userId ? parseInt(req.query.userId as string) : null;

    if (!userId) {
      return res.status(400).json({ error: 'userId query parameter is required' });
    }

    try {
      const userRes = await db.query('SELECT id, role FROM users WHERE id = $1', [userId]);
      const user = userRes.rows[0];

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      let query = '';
      let params: any[] = [];

      if (user.role === 'HR') {
        // HR can see everything pending HR approval, plus any overall pending requests
        query = "SELECT * FROM leave_requests WHERE status IN ('PENDING_HR', 'PENDING_MANAGER') ORDER BY created_at DESC";
      } else if (user.role === 'MANAGER') {
        // Managers see requests where they are explicitly the designated current approver
        query = 'SELECT * FROM leave_requests WHERE status = \'PENDING_MANAGER\' AND current_approver_id = $1 ORDER BY created_at DESC';
        params = [user.id];
      } else {
        // Standard employees only see their own submitted pending requests
        query = 'SELECT * FROM leave_requests WHERE requester_id = $1 AND status IN (\'PENDING_MANAGER\', \'PENDING_HR\') ORDER BY created_at DESC';
        params = [user.id];
      }

      const requestsRes = await db.query(query, params);
      return res.status(200).json(requestsRes.rows);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  return router;
}
