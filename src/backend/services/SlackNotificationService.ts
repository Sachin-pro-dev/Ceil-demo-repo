import * as https from 'https';
import { LeaveRequest } from '../types/LeaveRequest';

export class SlackNotificationService {
  private webhookUrl: string;

  constructor() {
    this.webhookUrl = process.env.SLACK_WEBHOOK_URL || '';
  }

  /**
   * Sends a JSON payload to the configured Slack Webhook URL using Node's HTTPS module.
   */
  private async sendPayload(payload: object): Promise<void> {
    if (!this.webhookUrl) {
      console.warn('Slack Webhook URL is not configured. Skipping notification.');
      return;
    }

    return new Promise((resolve, reject) => {
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
          reject(new Error(`Slack notification failed with status code ${res.statusCode}`));
        }
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(data);
      req.end();
    });
  }

  /**
   * Triggers a Slack notification for a new leave request submission.
   */
  public async notifySubmission(request: LeaveRequest): Promise<void> {
    const payload = {
      text: `📅 *New Leave Request Submitted*`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${request.employeeName}* has submitted a new leave request.`,
          },
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Type:* ${request.type}` },
            { type: 'mrkdwn', text: `*Dates:* ${request.startDate} to ${request.endDate}` },
            { type: 'mrkdwn', text: `*Reason:* ${request.reason || 'N/A'}` },
            { type: 'mrkdwn', text: `*Status:* \`PENDING\`` },
          ],
        },
      ],
    };

    await this.sendPayload(payload);
  }

  /**
   * Triggers a Slack notification for a leave request approval or rejection event.
   */
  public async notifyStatusChange(request: LeaveRequest): Promise<void> {
    const statusEmoji = request.status === 'APPROVED' ? '✅' : '❌';
    const payload = {
      text: `${statusEmoji} *Leave Request ${request.status}*`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `Leave request for *${request.employeeName}* has been *${request.status}* by *${request.approverName || 'Manager'}*.`,
          },
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Dates:* ${request.startDate} to ${request.endDate}` },
            { type: 'mrkdwn', text: `*Type:* ${request.type}` },
          ],
        },
      ],
    };

    await this.sendPayload(payload);
  }
}
