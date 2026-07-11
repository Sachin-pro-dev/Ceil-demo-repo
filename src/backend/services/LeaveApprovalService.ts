import { LeaveRequest, SlackService } from './SlackService';

/**
 * Service handling core leave request workflows and tying in automatic Slack notification alerts.
 */
export class LeaveApprovalService {
  private slackService: SlackService;
  // In-memory data store mimicking a database repository
  private leaveRequests: Map<string, LeaveRequest> = new Map();

  constructor(slackService: SlackService) {
    this.slackService = slackService;
  }

  /**
   * Submits a new leave request and automatically triggers a pending approval Slack notification.
   */
  public async createLeaveRequest(requestData: Omit<LeaveRequest, 'id' | 'status'>): Promise<LeaveRequest> {
    const newRequest: LeaveRequest = {
      ...requestData,
      id: `leave_${Math.random().toString(36).substr(2, 9)}`,
      status: 'PENDING',
    };

    this.leaveRequests.set(newRequest.id, newRequest);

    // Fire-and-forget real-time Slack notification
    this.slackService.sendPendingApprovalNotification(newRequest).catch((err) => {
      console.error('Failed to dispatch pending leave request notification:', err);
    });

    return newRequest;
  }

  /**
   * Updates the status of an existing leave request and triggers a status update Slack notification.
   */
  public async updateLeaveStatus(id: string, status: 'APPROVED' | 'REJECTED'): Promise<LeaveRequest | null> {
    const request = this.leaveRequests.get(id);
    if (!request) {
      return null;
    }

    request.status = status;
    this.leaveRequests.set(id, request);

    // Fire-and-forget real-time Slack notification
    this.slackService.sendStatusUpdateNotification(request).catch((err) => {
      console.error('Failed to dispatch leave status update notification:', err);
    });

    return request;
  }

  /**
   * Retrieves a specific leave request by ID.
   */
  public getLeaveRequest(id: string): LeaveRequest | undefined {
    return this.leaveRequests.get(id);
  }
}
