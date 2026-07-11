import { 
  SlackMessagePayload, 
  LeaveStatusNotification, 
  PendingActionNotification 
} from '../types/slack';

/**
 * Service responsible for sending formatted rich notifications to Slack
 * using the Slack Webhook API.
 */
export class SlackNotificationService {
  private webhookUrl: string;

  /**
   * Initializes the service with a target Slack Webhook URL.
   * @param webhookUrl The Slack Incoming Webhook URL.
   */
  constructor(webhookUrl?: string) {
    const url = webhookUrl || process.env.SLACK_WEBHOOK_URL;
    if (!url) {
      throw new Error('Slack Notification Service initialization failed: Missing webhook URL.');
    }
    this.webhookUrl = url;
  }

  /**
   * Sends a general raw Slack payload to the configured webhook.
   */
  public async sendPayload(payload: SlackMessagePayload): Promise<boolean> {
    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const responseText = await response.text();
        console.error(`Slack API error [Status ${response.status}]: ${responseText}`);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to dispatch Slack notification:', error);
      return false;
    }
  }

  /**
   * Formats and triggers an alert for a change in leave request status.
   */
  public async notifyLeaveStatus(data: LeaveStatusNotification): Promise<boolean> {
    let statusEmoji = '⏳';
    let statusColor = 'Pending';
    
    if (data.status === 'APPROVED') {
      statusEmoji = '✅';
      statusColor = 'Approved';
    } else if (data.status === 'REJECTED') {
      statusEmoji = '❌';
      statusColor = 'Rejected';
    }

    const fallbackText = `Leave Request Update: ${data.employeeName}'s request is ${statusColor}.`;

    const payload: SlackMessagePayload = {
      text: fallbackText,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `${statusEmoji} Leave Request Status Update`,
            emoji: true
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${data.employeeName}*'s leave request has been *${statusColor.toLowerCase()}*.`
          }
        },
        {
          type: 'divider'
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Leave Type:*
${data.leaveType}` },
            { type: 'mrkdwn', text: `*Duration:*
${data.startDate} to ${data.endDate}` },
            { type: 'mrkdwn', text: `*Status:*
${statusEmoji} ${statusColor}` },
            { type: 'mrkdwn', text: `*Handled By:*
${data.approverName || 'N/A'}` }
          ]
        }
      ]
    };

    if (data.comments && payload.blocks) {
      payload.blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Approver Comments:*
> ${data.comments}`
        }
      });
    }

    return this.sendPayload(payload);
  }

  /**
   * Formats and triggers an alert for a pending action requiring attention.
   */
  public async notifyPendingAction(data: PendingActionNotification): Promise<boolean> {
    const fallbackText = `Pending Action Required: ${data.title}`;

    const payload: SlackMessagePayload = {
      text: fallbackText,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🔔 Action Required' 
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Title:* ${data.title}
*Requested By:* ${data.requesterName}`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Description:*
${data.description}`
          }
        }
      ]
    };

    if (data.dueDate && payload.blocks) {
      payload.blocks.push({
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `⏰ *Due Date:* ${data.dueDate}`
          }
        ]
      });
    }

    if (payload.blocks) {
      payload.blocks.push({
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'View & Action Request'
            },
            style: 'primary',
            url: data.actionUrl,
            action_id: `action_link_${data.actionId}`
          }
        ]
      });
    }

    return this.sendPayload(payload);
  }
}
