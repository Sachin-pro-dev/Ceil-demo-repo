import { LeaveRequest } from '../types/LeaveRequest';
import { SlackNotificationService } from '../services/SlackNotificationService';

export class LeaveController {
  private slackService: SlackNotificationService;

  constructor() {
    this.slackService = new SlackNotificationService();
  }

  /**
   * Handles submitting a leave request and triggers the Slack notification.
   */
  public async submitLeaveRequest(requestData: Omit<LeaveRequest, 'status'>): Promise<LeaveRequest> {
    // In production database logic, save to DB here.
    const newRequest: LeaveRequest = {
      ...requestData,
      status: 'PENDING',
    };

    try {
      await this.slackService.notifySubmission(newRequest);
    } catch (error) {
      console.error('Failed to send Slack notification for submission:', error);
    }

    return newRequest;
  }

  /**
   * Handles updating leave request status (Approve/Reject) and triggers the Slack notification.
   */
  public async updateLeaveStatus(
    request: LeaveRequest,
    status: 'APPROVED' | 'REJECTED',
    approverName: string
  ): Promise<LeaveRequest> {
    // In production database logic, update status in DB here.
    const updatedRequest: LeaveRequest = {
      ...request,
      status,
      approverName,
    };

    try {
      await this.slackService.notifyStatusChange(updatedRequest);
    } catch (error) {
      console.error('Failed to send Slack notification for status update:', error);
    }

    return updatedRequest;
  }
}
