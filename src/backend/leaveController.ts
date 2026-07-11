import { Request, Response } from 'express';
import { LeaveWorkflowEngine, User } from './leaveEngine';

// Seed initial mock data mapping directly to the database role models
const mockUsers: User[] = [
  { id: 1, name: 'Alice Employee', email: 'alice@company.com', role: 'EMPLOYEE', managerId: 2 },
  { id: 2, name: 'Bob Manager', email: 'bob@company.com', role: 'MANAGER', managerId: 4 },
  { id: 3, name: 'Charlie HR', email: 'charlie@company.com', role: 'HR' },
  { id: 4, name: 'Diana Director', email: 'diana@company.com', role: 'DIRECTOR' }
];

const engine = new LeaveWorkflowEngine(mockUsers);

/**
 * REST API Controller for handling Leave CRUD operations and Approvals.
 */
export const LeaveController = {
  /**
   * POST /api/leaves
   */
  create: (req: Request, res: Response) => {
    try {
      const { employeeId, startDate, endDate, leaveType, reason } = req.body;
      if (!employeeId || !startDate || !endDate || !leaveType) {
        return res.status(400).json({ error: 'Missing required request parameters.' });
      }

      const request = engine.createRequest(Number(employeeId), startDate, endDate, leaveType, reason);
      return res.status(201).json(request);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  },

  /**
   * POST /api/leaves/:id/approve
   */
  approve: (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { approverId, comments } = req.body;

      if (!approverId) {
        return res.status(400).json({ error: 'Approver ID is required' });
      }

      const request = engine.processApproval(Number(approverId), Number(id), 'APPROVE', comments);
      return res.status(200).json(request);
    } catch (error: any) {
      return res.status(403).json({ error: error.message });
    }
  },

  /**
   * POST /api/leaves/:id/reject
   */
  reject: (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { approverId, comments } = req.body;

      if (!approverId) {
        return res.status(400).json({ error: 'Approver ID is required' });
      }

      const request = engine.processApproval(Number(approverId), Number(id), 'REJECT', comments);
      return res.status(200).json(request);
    } catch (error: any) {
      return res.status(403).json({ error: error.message });
    }
  },

  /**
   * GET /api/leaves/:id
   */
  get: (req: Request, res: Response) => {
    const { id } = req.params;
    const request = engine.getRequest(Number(id));
    if (!request) {
      return res.status(404).json({ error: 'Leave request not found' });
    }
    const logs = engine.getLogsForRequest(Number(id));
    return res.status(200).json({ ...request, logs });
  }
};
