import { Router, Request, Response } from 'express';

// TypeScript Interfaces representing our Database Entities
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  manager_id: number | null;
}

export interface LeaveRequest {
  id: number;
  employee_id: number;
  leave_type: 'VACATION' | 'SICK' | 'PERSONAL' | 'BEREAVEMENT';
  start_date: string;
  end_date: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ESCALATED';
  current_approver_id: number | null;
}

export interface ApprovalHistory {
  id: number;
  leave_request_id: number;
  approver_id: number;
  action: 'APPROVE' | 'REJECT' | 'ESCALATE';
  comments?: string;
  created_at: Date;
}

// Mock Database Client representing a real PostgreSQL/MySQL pool
// In production, replace with: import { pool } from './db';
export class MockDb {
  public users: User[] = [
    { id: 1, name: 'Alice Smith', email: 'alice@company.com', role: 'CEO', manager_id: null },
    { id: 2, name: 'Bob Jones', email: 'bob@company.com', role: 'Director', manager_id: 1 },
    { id: 3, name: 'Charlie Brown', email: 'charlie@company.com', role: 'Manager', manager_id: 2 },
    { id: 4, name: 'David Wright', email: 'david@company.com', role: 'Engineer', manager_id: 3 }
  ];
  public leaveRequests: LeaveRequest[] = [];
  public approvalHistory: ApprovalHistory[] = [];
}

const db = new MockDb();
const router = Router();

/**
 * Helper: Calculate duration in days
 */
function calculateDurationDays(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * POST /api/leaves
 * Submit a new leave request. Automatically routes to the employee's direct manager.
 */
router.post('/leaves', (req: Request, res: Response) => {
  const { employee_id, leave_type, start_date, end_date, reason } = req.body;

  if (!employee_id || !leave_type || !start_date || !end_date) {
    return res.status(400).json({ error: 'Missing required leave request fields.' });
  }

  const employee = db.users.find(u => u.id === Number(employee_id));
  if (!employee) {
    return res.status(404).json({ error: 'Employee not found.' });
  }

  if (!employee.manager_id) {
    return res.status(400).json({ error: 'Employee has no designated manager to route approval to.' });
  }

  const newRequest: LeaveRequest = {
    id: db.leaveRequests.length + 1,
    employee_id: Number(employee_id),
    leave_type,
    start_date,
    end_date,
    reason: reason || '',
    status: 'PENDING',
    current_approver_id: employee.manager_id
  };

  db.leaveRequests.push(newRequest);
  return res.status(201).json({ message: 'Leave request submitted successfully.', data: newRequest });
});

/**
 * POST /api/leaves/:id/action
 * Handles approval workflow decisions. Escalates automatically if criteria are met.
 */
router.post('/leaves/:id/action', (req: Request, res: Response) => {
  const requestId = Number(req.params.id);
  const { approver_id, action, comments } = req.body; // action: 'APPROVE' or 'REJECT'

  if (!approver_id || !action || !['APPROVE', 'REJECT'].includes(action)) {
    return res.status(400).json({ error: 'Invalid workflow payload.' });
  }

  const request = db.leaveRequests.find(r => r.id === requestId);
  if (!request) {
    return res.status(404).json({ error: 'Leave request not found.' });
  }

  if (request.status === 'APPROVED' || request.status === 'REJECTED') {
    return res.status(400).json({ error: 'This leave request has already been finalized.' });
  }

  if (request.current_approver_id !== Number(approver_id)) {
    return res.status(403).json({ error: 'You are not the designated current approver for this request.' });
  }

  const approver = db.users.find(u => u.id === Number(approver_id));
  if (!approver) {
    return res.status(404).json({ error: 'Approver user not found.' });
  }

  if (action === 'REJECT') {
    request.status = 'REJECTED';
    request.current_approver_id = null;

    db.approvalHistory.push({
      id: db.approvalHistory.length + 1,
      leave_request_id: requestId,
      approver_id: approver.id,
      action: 'REJECT',
      comments,
      created_at: new Date()
    });

    return res.json({ message: 'Leave request rejected.', data: request });
  }

  // Action is APPROVE -> Evaluate Workflow Hierarchy
  const durationDays = calculateDurationDays(request.start_date, request.end_date);
  
  // Workflow rule: If leave duration is > 5 days and current approver has a manager, escalate to next level.
  if (durationDays > 5 && approver.manager_id) {
    request.status = 'ESCALATED';
    request.current_approver_id = approver.manager_id;

    db.approvalHistory.push({
      id: db.approvalHistory.length + 1,
      leave_request_id: requestId,
      approver_id: approver.id,
      action: 'ESCALATE',
      comments: `Escalated automatically because duration (${durationDays} days) exceeds 5 days limit. ` + (comments || ''),
      created_at: new Date()
    });

    return res.json({ message: 'Leave escalated to next hierarchical tier.', data: request });
  } else {
    // Final approval
    request.status = 'APPROVED';
    request.current_approver_id = null;

    db.approvalHistory.push({
      id: db.approvalHistory.length + 1,
      leave_request_id: requestId,
      approver_id: approver.id,
      action: 'APPROVE',
      comments,
      created_at: new Date()
    });

    return res.json({ message: 'Leave request fully approved.', data: request });
  }
});

/**
 * GET /api/leaves/pending/:approverId
 * Retrieve all pending leave requests currently awaiting the specified approver's decision.
 */
router.get('/leaves/pending/:approverId', (req: Request, res: Response) => {
  const approverId = Number(req.params.approverId);
  const pendingLeaves = db.leaveRequests.filter(
    r => r.current_approver_id === approverId && (r.status === 'PENDING' || r.status === 'ESCALATED')
  );
  return res.json({ count: pendingLeaves.length, data: pendingLeaves });
});

export default router;
