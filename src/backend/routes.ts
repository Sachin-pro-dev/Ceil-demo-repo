import { Router, Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import { UserRole, LeaveStatus } from './types';

const router = Router();
const pool = new Pool(); // Configured via standard environment variables

/**
 * Authentication Middleware
 * In production, this would verify a real JWT. For testing/demo, it parses
 * an authorization header formatted as 'Bearer <id>:<role>:<email>'
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const [id, role, email] = token.split(':');
    req.user = {
      id: parseInt(id, 10),
      role: role as UserRole,
      email
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token format' });
  }
};

/**
 * Role-Based Access Control Middleware
 */
export const authorize = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};

/**
 * POST /leave-requests
 * Submit a new leave request (Available to all authenticated users)
 */
router.post('/leave-requests', authenticate, async (req: Request, res: Response) => {
  const { startDate, endDate, reason } = req.body;
  if (!startDate || !endDate || !reason) {
    return res.status(400).json({ error: 'Missing required fields: startDate, endDate, reason' });
  }

  try {
    const query = `
      INSERT INTO leave_requests (user_id, start_date, end_date, reason, status)
      VALUES ($1, $2, $3, $4, 'Pending')
      RETURNING *;
    `;
    const values = [req.user!.id, startDate, endDate, reason];
    const result = await pool.query(query, values);
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error submitting leave request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /leave-requests
 * Retrieve leave requests (Employees view only theirs; Managers/Admins view all)
 */
router.get('/leave-requests', authenticate, async (req: Request, res: Response) => {
  try {
    let query = 'SELECT * FROM leave_requests';
    let values: any[] = [];

    if (req.user!.role === 'Employee') {
      query += ' WHERE user_id = $1';
      values = [req.user!.id];
    }

    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, values);
    return res.json(result.rows);
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /leave-requests/:id/status
 * Approve or Reject a leave request (Managers and Admins only)
 */
router.patch('/leave-requests/:id/status', authenticate, authorize(['Manager', 'Admin']), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowedStatuses: LeaveStatus[] = ['Approved', 'Rejected'];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be Approved or Rejected.' });
  }

  try {
    const query = `
      UPDATE leave_requests
      SET status = $1, reviewed_by = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *;
    `;
    const values = [status, req.user!.id, id];
    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating leave request status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
