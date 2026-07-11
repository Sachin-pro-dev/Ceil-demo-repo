import { ApprovalDetails, SlackConfig } from '../types/ApprovalTypes';

/**
 * Service class responsible for formatting and dispatching messages to Slack.
 */
export class SlackService {
  private webhookUrl: string;

  constructor(config: SlackConfig) {
    if (!config.webhookUrl) {
      throw new Error('Slack Webhook URL is required to send notifications.');
    }
    this.webhookUrl = config.webhookUrl;
  }

  /**
   * Sends a rich Block Kit notification to the configured Slack channel.
   */
  public async sendApprovalNotification(details: ApprovalDetails): Promise<void> {
    const blocks = this.buildSlackBlocks(details);

    const response = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ blocks }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Slack API returned status ${response.status}: ${errorText}`);
    }
  }

  /**
   * Formats the approval details into rich Slack Block Kit components.
   */
  private buildSlackBlocks(details: ApprovalDetails): Array<any> {
    const stageLabels: Record<string, string> = {
      SUBMITTED: '🟡 *Pending Approval*',
      APPROVED: '🟢 *Approved*',
      REJECTED: '🔴 *Rejected*',
      CHANGES_REQUESTED: '🟠 *Changes Requested*',
    };

    const statusLabel = stageLabels[details.stage] || `*${details.stage}*`;

    const blocks: Array<any> = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: 'Ceil Approval Lifecycle Update',
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Item:* ${details.title}\n*Status:* ${statusLabel}`,
        },
      },
      {
        type: 'divider',
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Requester:*\n${details.requesterName} (${details.requesterEmail})`,
          },
          {
            type: 'mrkdwn',
            text: `*Project:*\n${details.project || 'N/A'}`,
          },
        ],
      },
    ];

    if (details.approverName) {
      blocks.push({
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Actioned By:*\n${details.approverName}`,
          },
          {
            type: 'mrkdwn',
            text: `*Time:*\n${new Date(details.timestamp).toLocaleString()}`,
          },
        ],
      });
    }

    if (details.comments) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Comments:*\n>${details.comments}`,
        },
      });
    }

    // Add action button for pending requests
    if (details.stage === 'SUBMITTED') {
      blocks.push({
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'View Approval Request',
              emoji: true,
            },
            value: details.id,
            url: `https://ceil.delivery/approvals/${details.id}`,
            style: 'primary',
          },
        ],
      });
    }

    return blocks;
  }
}
