import * as https from 'https';
import { URL } from 'url';
import { LeaveRequest } from '../types/LeaveRequest';

export class SlackNotificationService {
  private webhookUrl: string;

  constructor() {
    this.webhookUrl = process.env.SLACK_WEBHOOK_URL || '';
  }

  /**
   * Sends a formatted JSON payload to the configured Slack Webhook URL using standard Node https.
   */
  private async sendNotification(payload: object): Promise<void> {
    if (!this.webhookUrl) {
      console.warn('Slack Webhook URL is not configured. Skipping real-time notification.');
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        const url = new URL(this.webhookUrl);
        const data = JSON.stringify(payload);

        const options = {
          hostname: url.hostname,
          path: url.pathname + url.search,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data),
          },
        };

        const req = https.request(options, (res) => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve();
          } else {
            reject(new Error(`Slack API returned status code ${res.statusCode}`));
          }
        });

        req.on('error', (error) => {
          reject(error);
        });

        req.write(data);
        req.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Triggers a Slack notification when a new leave request is submitted.
   */
  public async notifySubmitted(request: LeaveRequest): Promise<void> {
    const payload = {
      text: `📅 New Leave Request Submitted by ${request.employeeName}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '📅 New Leave Request Submitted',
            emoji: true
          }
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Employee:* ${request.employeeName}` },
            { type: 'mrkdwn', text: `*Type:* ${request.leaveType}` },
            { type: 'mrkdwn', text: `*Dates:* ${request.startDate} to ${request.endDate}` },
            { type: 'mrkdwn', text: `*Status:* \`PENDING\`` }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Reason:* _${request.reason || 'No reason provided'}_`
          }
        }
      ]
    };

    await this.sendNotification(payload);
  }

  /**
   * Triggers a Slack notification when a leave request is approved.
   */
  public async notifyApproved(request: LeaveRequest): Promise<void> {
    const payload = {
      text: `✅ Leave Request Approved for ${request.employeeName}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '✅ Leave Request Approved',
            emoji: true
          }
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Employee:* ${request.employeeName}` },
            { type: 'mrkdwn', text: `*Type:* ${request.leaveType}` },
            { type: 'mrkdwn', text: `*Dates:* ${request.startDate} to ${request.endDate}` },
            { type: 'mrkdwn', text: `*Status:* *APPROVED*` }
          ]
        }
      ]
    };

    await this.sendNotification(payload);
  }

  /**
   * Triggers a Slack notification when a leave request is rejected.
   */
  public async notifyRejected(request: LeaveRequest): Promise<void> {
    const payload = {
      text: `❌ Leave Request Rejected for ${request.employeeName}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '❌ Leave Request Rejected',
            emoji: true
          }
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Employee:* ${request.employeeName}` },
            { type: 'mrkdwn', text: `*Type:* ${request.leaveType}` },
            { type: 'mrkdwn', text: `*Dates:* ${request.startDate} to ${request.endDate}` },
            { type: 'mrkdwn', text: `*Status:* ~REJECTED~` }
          ]
        }
      ]
    };

    await this.sendNotification(payload);
  }
}
