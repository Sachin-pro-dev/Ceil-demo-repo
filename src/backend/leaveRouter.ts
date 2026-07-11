import { Router, Request, Response, RequestHandler } from 'express';
import { Pool } from 'pg';

// Initialize database connection pool using environment configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export const leaveRouter = Router();

interface LeaveRequestInput {
  employeeId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

/**
 * POST /api/leaves
 * Submit a new leave request.
 */
const createLeave: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { employeeId, leaveType, startDate, endDate, reason } = req.body as LeaveRequestInput;

    if (!employeeId || !leaveType || !startDate || !endDate) {
      res.status(400).json({ error: 'Missing required fields: employeeId, leaveType, startDate, endDate' });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      res.status(400).json({ error: 'Invalid dates provided. Start date must be before or equal to end date.' });
      return;
    }

    const query = `
      INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, reason)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, employee_id AS "employeeId", leave_type AS "leaveType", start_date AS "startDate", end_date AS "endDate", reason, status, created_at AS "createdAt";
    `;
    
    const result = await pool.query(query, [employeeId, leaveType, startDate, endDate, reason || null]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating leave request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET /api/leaves
 * Retrieve leave request history. Filterable by employeeId via query parameters.
 */
const getLeaves: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { employeeId } = req.query;
    let query = `
      SELECT id, employee_id AS "employeeId", leave_type AS "leaveType", start_date AS "startDate", end_date AS "endDate", reason, status, created_at AS "createdAt"
      FROM leave_requests
    `;
    const params: any[] = [];

    if (employeeId) {
      query += ' WHERE employee_id = $1';
      params.push(employeeId);
    }

    query += ' ORDER BY start_date DESC';

    const result = await pool.query(query, params);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching leave history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * PATCH /api/leaves/:id
 * Update the status of a leave request (e.g., CANCELLED by employee or APPROVED/REJECTED by manager).
 */
const updateLeaveStatus: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowedStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

    if (!status || !allowedStatuses.includes(status)) {
      res.status(400).json({ error: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}` });
      return;
    }

    const query = `
      UPDATE leave_requests
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, employee_id AS "employeeId", leave_type AS "leaveType", start_date AS "startDate", end_date AS "endDate", reason, status, updated_at AS "updatedAt";
    `;

    const result = await pool.query(query, [status, id]);

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Leave request not found' });
      return;
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating leave status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Register routes
leaveRouter.post('/', createLeave);
leaveRouter.get('/', getLeaves);
leaveRouter.patch('/:id', updateLeaveStatus);
