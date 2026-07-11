import { SlackClient } from './slackClient';

export interface RequestDetails {
  id: string;
  title: string;
  description: string;
  requesterName: string;
  requesterEmail: string;
  createdAt: Date;
}

export interface StatusUpdateDetails {
  requestId: string;
  requestTitle: string;
  employeeName: string;
  employeeEmail: string;
  oldStatus: string;
  newStatus: string;
  updatedBy: string;
  comments?: string;
}

export class NotificationService {
  private managerWebhookUrl: string;
  private employeeWebhookUrl: string;

  constructor() {
    // Retrieve webhook URLs from environment configuration
    this.managerWebhookUrl = process.env.SLACK_MANAGER_WEBHOOK_URL || '';
    this.employeeWebhookUrl = process.env.SLACK_EMPLOYEE_WEBHOOK_URL || '';
  }

  /**
   * Dispatches a real-time alert to managers when a new request is submitted.
   */
  public async notifyManagerOnNewRequest(request: RequestDetails): Promise<void> {
    if (!this.managerWebhookUrl) {
      console.warn('Slack Manager Webhook URL is not configured. Skipping notification.');
      return;
    }

    const message = {
      text: `🚨 New Request Submitted: ${request.title}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*🚨 New Request Submitted*
*Requester:* ${request.requesterName} (<mailto:${request.requesterEmail}|${request.requesterEmail}>)
*Title:* ${request.title}`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Description:*
${request.description}`,
          },
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `*ID:* ${request.id} | *Submitted At:* ${request.createdAt.toISOString()}`,
            },
          ],
        },
      ],
    };

    await SlackClient.sendWebhook(this.managerWebhookUrl, message);
  }

  /**
   * Dispatches a real-time status update alert to the respective employee.
   */
  public async notifyEmployeeOnStatusUpdate(update: StatusUpdateDetails): Promise<void> {
    if (!this.employeeWebhookUrl) {
      console.warn('Slack Employee Webhook URL is not configured. Skipping notification.');
      return;
    }

    const message = {
      text: `🔄 Request Status Updated: ${update.requestTitle}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*🔄 Request Status Updated*
*Hi ${update.employeeName},* the status of your request *"${update.requestTitle}"* has been updated.`,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Old Status:*
~${update.oldStatus}~`,
            },
            {
              type: 'mrkdwn',
              text: `*New Status:*
*${update.newStatus}*`,
            },
          ],
        },
        ...(update.comments ? [{
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Comments:*
_${update.comments}_`,
          },
        }] : []),
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `*Updated By:* ${update.updatedBy} | *Request ID:* ${update.requestId}`,
            },
          ],
        },
      ],
    };

    await SlackClient.sendWebhook(this.employeeWebhookUrl, message);
  }
}