/**
 * Slack Notification Service
 * Handles sending real-time, rich-formatted alerts to a Slack channel via Webhooks.
 */

interface SlackPayload {
  text: string;
  blocks?: Array<{
    type: string;
    text?: { type: string; text: string };
    fields?: Array<{ type: string; text: string }>;
  }>;
}

export class SlackService {
  private webhookUrl: string;

  constructor() {
    // In production, ensure SLACK_WEBHOOK_URL is set in your environment variables
    this.webhookUrl = process.env.SLACK_WEBHOOK_URL || '';
  }

  /**
   * Sends a payload to the configured Slack Webhook URL.
   */
  private async sendNotification(payload: SlackPayload): Promise<boolean> {
    if (!this.webhookUrl) {
      console.warn('[SlackService] Webhook URL not configured. Skipping notification.');
      return false;
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Slack API responded with status ${response.status}`);
      }
      return true;
    } catch (error) {
      console.error('[SlackService] Failed to send Slack notification:', error);
      return false;
    }
  }

  /**
   * Triggers an alert for a newly created request.
   */
  public async notifyNewRequest(request: {
    id: string;
    title: string;
    requester: string;
    details: string;
  }): Promise<boolean> {
    const payload: SlackPayload = {
      text: `🆕 New Request Created: ${request.title}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🆕 New Request Submitted',
          },
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Request ID:*
${request.id}` },
            { type: 'mrkdwn', text: `*Requester:*
${request.requester}` },
            { type: 'mrkdwn', text: `*Title:*
${request.title}` },
          ],
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Details:*
${request.details}`,
          },
        },
      ],
    };

    return this.sendNotification(payload);
  }

  /**
   * Triggers an alert when a request is approved.
   */
  public async notifyApproval(approval: {
    requestId: string;
    title: string;
    approver: string;
    comments?: string;
  }): Promise<boolean> {
    const payload: SlackPayload = {
      text: `✅ Request Approved: ${approval.title}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '✅ Request Approved',
          },
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Request ID:*
${approval.requestId}` },
            { type: 'mrkdwn', text: `*Approver:*
${approval.approver}` },
            { type: 'mrkdwn', text: `*Title:*
${approval.title}` },
          ],
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Comments:*
${approval.comments || '_No comments provided._'}`,
          },
        },
      ],
    };

    return this.sendNotification(payload);
  }

  /**
   * Triggers an alert when a request is rejected.
   */
  public async notifyRejection(rejection: {
    requestId: string;
    title: string;
    rejector: string;
    reason: string;
  }): Promise<boolean> {
    const payload: SlackPayload = {
      text: `❌ Request Rejected: ${rejection.title}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '❌ Request Rejected',
          },
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Request ID:*
${rejection.requestId}` },
            { type: 'mrkdwn', text: `*Rejected By:*
${rejection.rejector}` },
            { type: 'mrkdwn', text: `*Title:*
${rejection.title}` },
          ],
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Reason for Rejection:*
${rejection.reason}`,
          },
        },
      ],
    };

    return this.sendNotification(payload);
  }
}
