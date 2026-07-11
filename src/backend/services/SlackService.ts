/**
 * Service responsible for sending formatted real-time alerts to Slack
 * using Slack incoming webhooks and Slack Block Kit payloads.
 */

export interface LeaveRequest {
  id: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export class SlackService {
  private webhookUrl: string;

  constructor() {
    // Expects SLACK_WEBHOOK_URL to be defined in environment variables
    this.webhookUrl = process.env.SLACK_WEBHOOK_URL || '';
  }

  /**
   * Sends a structured payload to the configured Slack webhook URL.
   */
  private async sendNotification(payload: object): Promise<boolean> {
    if (!this.webhookUrl) {
      console.warn('[SlackService] Webhook URL not configured. Notification skipped.');
      return false;
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Slack API responded with status ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('[SlackService] Error sending Slack notification:', error);
      return false;
    }
  }

  /**
   * Triggers an alert when a new leave request is submitted and is pending approval.
   */
  public async sendPendingApprovalNotification(request: LeaveRequest): Promise<boolean> {
    const payload = {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🚨 New Leave Request Pending Approval',
            emoji: true,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Employee:*\n${request.employeeName}`,
            },
            {
              type: 'mrkdwn',
              text: `*Dates:*\n${request.startDate} to ${request.endDate}`,
            },
            {
              type: 'mrkdwn',
              text: `*Reason:*\n${request.reason}`,
            },
            {
              type: 'mrkdwn',
              text: `*Status:*\n⏳ Pending`,
            },
          ],
        },
      ],
    };

    return this.sendNotification(payload);
  }

  /**
   * Triggers an alert when a leave request status has been updated (Approved/Rejected).
   */
  public async sendStatusUpdateNotification(request: LeaveRequest): Promise<boolean> {
    const isApproved = request.status === 'APPROVED';
    const statusEmoji = isApproved ? '✅' : '❌';
    const statusText = isApproved ? 'Approved' : 'Rejected';

    const payload = {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `${statusEmoji} Leave Request Status Update`,
            emoji: true,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `The leave request submitted by *${request.employeeName}* for *${request.startDate}* to *${request.endDate}* has been *${statusText}*.`,
          },
        },
      ],
    };

    return this.sendNotification(payload);
  }
}
