import { SlackNotificationService, SlackMessagePayload } from './SlackNotificationService';

export interface User {
  id: string;
  name: string;
  email: string;
  slackUserId?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  type: 'Vacation' | 'Sick' | 'Personal' | 'Maternity/Paternity';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason?: string;
  managerNotes?: string;
}

/**
 * Handler class to orchestrate formatting and dispatching notifications
 * whenever a leave request status changes.
 */
export class LeaveStatusChangeHandler {
  private slackService: SlackNotificationService;

  constructor(slackService?: SlackNotificationService) {
    this.slackService = slackService || new SlackNotificationService();
  }

  /**
   * Builds structured Slack Block Kit payload and dispatches notifications.
   */
  async handleStatusChange(
    leaveRequest: LeaveRequest,
    employee: User,
    manager: User
  ): Promise<{ notified: boolean }> {
    console.log(`[LeaveStatusChangeHandler] Processing status change notification for Request ID: ${leaveRequest.id}`);

    const statusEmoji = leaveRequest.status === 'APPROVED' ? '🟢' : leaveRequest.status === 'REJECTED' ? '🔴' : '🟡';
    const mentionEmployee = employee.slackUserId ? `<@${employee.slackUserId}>` : `*${employee.name}*`;
    const mentionManager = manager.slackUserId ? `<@${manager.slackUserId}>` : `*${manager.name}*`;

    const payload: SlackMessagePayload = {
      text: `Leave request status update for ${employee.name}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `${statusEmoji} Leave Request Status Update`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `Hello ${mentionEmployee}, your manager ${mentionManager} has updated your leave request status.`
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Type:*
${leaveRequest.type}`
            },
            {
              type: 'mrkdwn',
              text: `*Status:*
*${leaveRequest.status}*`
            },
            {
              type: 'mrkdwn',
              text: `*Dates:*
${leaveRequest.startDate} to ${leaveRequest.endDate}`
            },
            {
              type: 'mrkdwn',
              text: `*Reason:*
${leaveRequest.reason || 'Not specified'}`
            }
          ]
        }
      ]
    };

    if (leaveRequest.managerNotes) {
      payload.blocks?.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Manager's Notes:*
_${leaveRequest.managerNotes}_`
        }
      });
    }

    const notified = await this.slackService.sendNotification(payload);
    return { notified };
  }
}
