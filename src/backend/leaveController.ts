import { Request, Response, Router } from 'express';
import { LeaveApprovalEngine, User } from './leaveService';
import { Pool } from 'pg';

export interface AuthenticatedRequest extends Request {
  user?: User; // Injected by authentication middleware in actual application
}

export function createLeaveRouter(dbPool: Pool): Router {
  const router = Router();
  const engine = new LeaveApprovalEngine(dbPool);

  // POST /leaves - Create a leave request
  router.post('/', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { start_date, end_date, reason } = req.body;
      const user = req.user;

      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!start_date || !end_date) {
        return res.status(400).json({ error: 'Start date and end date are required' });
      }

      const request = await engine.createRequest(
        user.id,
        new Date(start_date),
        new Date(end_date),
        reason || ''
      );

      return res.status(201).json({ success: true, data: request });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  });

  // POST /leaves/:id/approve - Approve or Reject a leave request (Manager only)
  router.post('/:id/approve', async (req: AuthenticatedRequest, res: Response) => {
    try {
      const requestId = parseInt(req.params.id, 10);
      const { action, comments } = req.body;
      const user = req.user;

      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!['approved', 'rejected'].includes(action)) {
        return res.status(400).json({ error: "Action must be either 'approved' or 'rejected'" });
      }

      const updatedRequest = await engine.transitionStatus(
        requestId,
        user,
        action,
        comments
      );

      return res.status(200).json({ success: true, data: updatedRequest });
    } catch (error: any) {
      const status = error.message.includes('Unauthorized') ? 403 : 400;
      return res.status(status).json({ error: error.message });
    }
  });

  return router;
}