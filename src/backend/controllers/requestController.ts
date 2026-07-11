import { Request, Response } from 'express';
import { db } from '../db';

// Extend default Express Request to support authenticated user payload
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

/**
 * Cancels a request if it belongs to the authenticated employee and is still 'PENDING'.
 */
export async function cancelEmployeeRequest(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { requestId } = req.params;
  const employeeId = req.user?.id;

  if (!employeeId) {
    res.status(401).json({ error: 'Unauthorized: Employee session not found' });
    return;
  }

  const parsedRequestId = parseInt(requestId, 10);
  if (isNaN(parsedRequestId)) {
    res.status(400).json({ error: 'Invalid request ID format' });
    return;
  }

  try {
    // Fetch request to verify ownership and state
    const findQuery = 'SELECT id, employee_id, status FROM requests WHERE id = $1';
    const result = await db.query(findQuery, [parsedRequestId]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Request not found' });
      return;
    }

    const request = result.rows[0];

    // Security Check: Only the owner of the request can cancel it
    if (request.employee_id !== employeeId) {
      res.status(403).json({ error: 'Forbidden: You can only cancel your own requests' });
      return;
    }

    // Business Rule: Cancellation is only allowed before approval/rejection (status must be 'PENDING')
    if (request.status !== 'PENDING') {
      res.status(400).json({
        error: `Cannot cancel request. Current status is '${request.status}', but only 'PENDING' requests can be cancelled.`
      });
      return;
    }

    // Proceed to cancel request
    const updateQuery = `
      UPDATE requests 
      SET status = 'CANCELLED', updated_at = NOW() 
      WHERE id = $1 
      RETURNING id, employee_id, status, updated_at
    `;
    const updateResult = await db.query(updateQuery, [parsedRequestId]);

    res.status(200).json({
      message: 'Request successfully cancelled',
      request: updateResult.rows[0]
    });
  } catch (error) {
    console.error('Error cancelling request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
