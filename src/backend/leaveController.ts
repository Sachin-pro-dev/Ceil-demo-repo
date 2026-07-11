import { Request, Response } from 'express';
import { LeaveWorkflowEngine } from './leaveService';

export class LeaveController {
  private workflowEngine: LeaveWorkflowEngine;

  constructor(workflowEngine: LeaveWorkflowEngine) {
    this.workflowEngine = workflowEngine;
  }

  /**
   * Endpoint: POST /api/leave/submit
   */
  submitLeave = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeId, startDate, endDate, leaveType, reason } = req.body;

      if (!employeeId || !startDate || !endDate || !leaveType) {
        res.status(400).json({ error: 'Missing required fields: employeeId, startDate, endDate, leaveType' });
        return;
      }

      const newRequest = await this.workflowEngine.submitRequest({
        employeeId: Number(employeeId),
        startDate,
        endDate,
        leaveType,
        reason
      });

      res.status(201).json({
        message: 'Leave request submitted successfully and routed to manager.',
        data: newRequest
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  };

  /**
   * Endpoint: POST /api/leave/approve
   */
  processApproval = async (req: Request, res: Response): Promise<void> => {
    try {
      const { requestId, approverId, action, comments } = req.body;

      if (!requestId || !approverId || !action) {
        res.status(400).json({ error: 'Missing required fields: requestId, approverId, action' });
        return;
      }

      if (action !== 'approve' && action !== 'reject') {
        res.status(400).json({ error: "Action must be either 'approve' or 'reject'" });
        return;
      }

      const updatedRequest = await this.workflowEngine.processApproval({
        requestId: Number(requestId),
        approverId: Number(approverId),
        action,
        comments
      });

      res.status(200).json({
        message: `Leave request successfully ${action}d.`,
        data: updatedRequest
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Workflow processing error' });
    }
  };
}
