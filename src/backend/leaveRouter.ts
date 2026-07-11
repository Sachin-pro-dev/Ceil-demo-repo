import { Router, Request, Response } from 'express';
import { Pool } from 'pg';

const router = Router();

// Initialize PostgreSQL connection pool (configured via standard environment variables)
const pool = new Pool();

interface LeaveRequestInput {
  employeeId: string;
  leaveType: 'SICK' | 'VACATION' | 'PERSONAL' | 'BEREAVEMENT' | 'OTHER';
  startDate: string; // Expected format: YYYY-MM-DD
  endDate: string;   // Expected format: YYYY-MM-DD
  reason?: string;
}

/**
 * POST /api/leaves
 * Submit a new leave request
 */
router.post('/leaves', async (req: Request, res: Response): Promise<void> => {
  try {
    const { employeeId, leaveType, startDate, endDate, reason } = req.body as LeaveRequestInput;

    // Input Validation
    if (!employeeId || !leaveType || !startDate || !endDate) {
      res.status(400).json({ error: 'Missing required fields: employeeId, leaveType, startDate, endDate' });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      res.status(400).json({ error: 'Invalid date formats. Use YYYY-MM-DD' });
      return;
    }

    if (end < start) {
      res.status(400).json({ error: 'End date cannot be before start date' });
      return;
    }

    const query = `
      INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, reason, status)
      VALUES ($1, $2, $3, $4, $5, 'PENDING')
      RETURNING id, employee_id as "employeeId", leave_type as "leaveType", start_date as "startDate", end_date as "endDate", reason, status, created_at as "createdAt"
    `;

    const result = await pool.query(query, [employeeId, leaveType, startDate, endDate, reason || null]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating leave request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/leaves/:id
 * Retrieve and track the status of a specific leave request
 */
router.get('/leaves/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const query = `
      SELECT id, employee_id as "employeeId", leave_type as "leaveType", start_date as "startDate", end_date as "endDate", reason, status, created_at as "createdAt", updated_at as "updatedAt"
      FROM leave_requests
      WHERE id = $1
    `;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Leave request not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching leave request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/leaves/employee/:employeeId
 * Retrieve all leave requests submitted by a specific employee
 */
router.get('/leaves/employee/:employeeId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { employeeId } = req.params;
    const query = `
      SELECT id, leave_type as "leaveType", start_date as "startDate", end_date as "endDate", reason, status, created_at as "createdAt"
      FROM leave_requests
      WHERE employee_id = $1
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [employeeId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching employee leave requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;