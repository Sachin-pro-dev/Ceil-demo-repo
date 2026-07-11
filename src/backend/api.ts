import { Request, Response, Router } from 'express';
import { getNextState, LeaveStatus, UserRole, WorkflowAction } from './workflow';

const router = Router();

// PostgreSQL database client stub interface
interface DBClient {
    query: (text: string, params?: any[]) => Promise<{ rows: any[] }>;
}
declare const db: DBClient;

/**
 * POST /api/leave-requests
 * Creates a new leave request. Default status is 'PENDING_MANAGER'.
 */
router.post('/leave-requests', async (req: Request, res: Response) => {
    try {
        const { employeeId, leaveType, startDate, endDate, reason } = req.body;

        if (!employeeId || !leaveType || !startDate || !endDate) {
            return res.status(400).json({ error: 'Missing required leave request fields' });
        }

        const result = await db.query(
            `INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, status, reason)
             VALUES ($1, $2, $3, $4, 'PENDING_MANAGER', $5) RETURNING *`,
            [employeeId, leaveType, startDate, endDate, reason]
        );

        return res.status(201).json(result.rows[0]);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/leave-requests/:id/transition
 * Evaluates and processes state transition workflow for a specific leave request.
 */
router.post('/leave-requests/:id/transition', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { actorId, role, action, comment } = req.body as {
            actorId: string;
            role: UserRole;
            action: WorkflowAction;
            comment?: string;
        };

        if (!actorId || !role || !action) {
            return res.status(400).json({ error: 'Fields actorId, role, and action are required' });
        }

        // Retrieve existing leave request
        const requestRes = await db.query('SELECT status FROM leave_requests WHERE id = $1', [id]);
        if (requestRes.rows.length === 0) {
            return res.status(404).json({ error: 'Leave request not found' });
        }

        const currentStatus = requestRes.rows[0].status as LeaveStatus;

        // Calculate next state using workflow engine
        let nextStatus: LeaveStatus;
        try {
            nextStatus = getNextState(currentStatus, role, action);
        } catch (err: any) {
            return res.status(400).json({ error: err.message });
        }

        // Perform transition and log history atomically
        await db.query('BEGIN');
        try {
            const updatedRequest = await db.query(
                `UPDATE leave_requests 
                 SET status = $1, updated_at = CURRENT_TIMESTAMP 
                 WHERE id = $2 RETURNING *`,
                [nextStatus, id]
            );

            await db.query(
                `INSERT INTO approval_logs (leave_request_id, actor_id, actor_role, action, comment)
                 VALUES ($1, $2, $3, $4, $5)`,
                [id, actorId, role, action, comment || null]
            );

            await db.query('COMMIT');

            return res.status(200).json({
                message: 'Transition successful',
                currentStatus,
                nextStatus,
                request: updatedRequest.rows[0]
            });
        } catch (txError) {
            await db.query('ROLLBACK');
            throw txError;
        }
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

export default router;