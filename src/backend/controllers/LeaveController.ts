import { Request, Response } from 'express';
import { LeaveRequest } from '../types/LeaveRequest';
import { SlackNotificationService } from '../services/SlackNotificationService';

export class LeaveController {
  private slackService: SlackNotificationService;
  private leaveRequests: Map<string, LeaveRequest>;

  constructor() {
    this.slackService = new SlackNotificationService();
    this.leaveRequests = new Map();
  }

  public submitLeave = async (req: Request, res: Response): Promise<void> => {
    try {
      const { employeeName, employeeEmail, startDate, endDate, leaveType, reason } = req.body;

      const newRequest: LeaveRequest = {
        id: Math.random().toString(36).substring(7),
        employeeName,
        employeeEmail,
        startDate,
        endDate,
        leaveType,
        reason,
        status: 'SUBMITTED'
      };

      this.leaveRequests.set(newRequest.id, newRequest);

      // Dispatch real-time Slack alert
      await this.slackService.notifySubmitted(newRequest);

      res.status(201).json({ success: true, data: newRequest });
    } catch (error) {
      console.error('Error submitting leave request:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  };

  public approveLeave = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const request = this.leaveRequests.get(id);

      if (!request) {
        res.status(404).json({ success: false, error: 'Leave request not found' });
        return;
      }

      request.status = 'APPROVED';
      this.leaveRequests.set(id, request);

      // Dispatch real-time Slack alert
      await this.slackService.notifyApproved(request);

      res.status(200).json({ success: true, data: request });
    } catch (error) {
      console.error('Error approving leave request:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  };

  public rejectLeave = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const request = this.leaveRequests.get(id);

      if (!request) {
        res.status(404).json({ success: false, error: 'Leave request not found' });
        return;
      }

      request.status = 'REJECTED';
      this.leaveRequests.set(id, request);

      // Dispatch real-time Slack alert
      await this.slackService.notifyRejected(request);

      res.status(200).json({ success: true, data: request });
    } catch (error) {
      console.error('Error rejecting leave request:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  };
}
