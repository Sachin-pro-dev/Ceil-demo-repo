import { Request, Response, Router } from 'express';
import { ApprovalEngine, LeaveRequest, User, UserRole } from './approvalEngine';

// In-Memory Database for demonstration/mocking production behavior
const mockUsers: User[] = [
  { id: 1, name: 'Alice Smith', email: 'alice@ceil.com', role: 'EMPLOYEE' },
  { id: 2, name: 'Bob Jones', email: 'bob@ceil.com', role: 'MANAGER' },
  { id: 3, name: 'Carol Danvers', email: 'carol@ceil.com', role: 'HR' },
];

const mockLeaveRequests: LeaveRequest[] = [];
let requestCounter = 1;

export const leaveRouter = Router();

/**
 * Submit a new leave request
 * POST /api/leaves
 */
leaveRouter.post('/', (req: Request, res: Response) => {
  try {
    const { userId, leaveType, startDate, endDate } = req.body;

    if (!userId || !leaveType || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const user = mockUsers.find((u) => u.id === Number(userId));
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const newRequest: LeaveRequest = {
      id: requestCounter++,
      userId: user.id,
      leaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: 'PENDING',
      currentGate: 'MANAGER_GATE',
    };

    mockLeaveRequests.push(newRequest);
    return res.status(201).json({ message: 'Leave request submitted successfully.', data: newRequest });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * Process an approval step (Manager or HR)
 * POST /api/leaves/:id/approve
 */
leaveRouter.post('/:id/approve', (req: Request, res: Response) => {
  try {
    const requestId = Number(req.params.id);
    const { approverId, action, comments } = req.body; // action: 'APPROVE' | 'REJECT'

    if (!approverId || !action) {
      return res.status(400).json({ error: 'Missing approverId or action.' });
    }

    const leaveRequest = mockLeaveRequests.find((r) => r.id === requestId);
    if (!leaveRequest) {
      return res.status(404).json({ error: 'Leave request not found.' });
    }

    const approver = mockUsers.find((u) => u.id === Number(approverId));
    if (!approver) {
      return res.status(404).json({ error: 'Approver not found.' });
    }

    // Execute transition logic via the Approval Engine
    const { updatedRequest } = ApprovalEngine.transitionGate(leaveRequest, {
      leaveRequestId: requestId,
      approver,
      action,
      comments,
    });

    // Update the record in memory
    const index = mockLeaveRequests.findIndex((r) => r.id === requestId);
    mockLeaveRequests[index] = updatedRequest;

    return res.status(200).json({
      message: `Request successfully processed: Gate transitioned to ${updatedRequest.currentGate}.`,
      data: updatedRequest,
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

/**
 * Get all leave requests (for dashboard visibility)
 * GET /api/leaves
 */
leaveRouter.get('/', (req: Request, res: Response) => {
  return res.status(200).json(mockLeaveRequests);
});