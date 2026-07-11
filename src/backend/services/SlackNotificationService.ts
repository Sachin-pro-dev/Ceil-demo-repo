/**
 * Slack Notification Service
 * Handles integration with Slack Web API using rich Block Kit layouts
 * for real-time leave request alerts.
 */

export interface LeaveRequest {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  leaveType: string;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export class SlackNotificationService {
  private readonly slackApiToken: string;
  private readonly slackApiUrl = 'https://slack.com/api/chat.postMessage';

  constructor() {
    const token = process.env.SLACK_BOT_TOKEN;
    if (!token) {
      console.warn('SLACK_BOT_TOKEN is not defined. Slack notifications will be simulated.');
    }
    this.slackApiToken = token || 'mock-token';
  }

  /**
   * Sends a rich notification to a manager when an employee submits a new leave request.
   */
  async notifyLeaveSubmission(
    request: LeaveRequest,
    employeeName: string,
    managerSlackId: string
  ): Promise<boolean> {
    const blocks = [
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
        text: {
          type: 'mrkdwn',
          text: `*${employeeName}* has submitted a request for leave.`
        }
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Type:*
${request.leaveType}` },
          { type: 'mrkdwn', text: `*Dates:*
${request.startDate} to ${request.endDate}` }
        ]
      }
    ];

    if (request.reason) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Reason:*
_${request.reason}_`
        }
      });
    }

    // Add action buttons for the manager directly inside Slack
    blocks.push({
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: 'Approve', emoji: true },
          style: 'primary',
          value: `approve_${request.id}`,
          action_id: 'approve_leave'
        },
        {
          type: 'button',
          text: { type: 'plain_text', text: 'Reject', emoji: true },
          style: 'danger',
          value: `reject_${request.id}`,
          action_id: 'reject_leave'
        }
      ]
    });

    return this.sendSlackMessage(managerSlackId, 'New Leave Request', blocks);
  }

  /**
   * Sends an alert to the employee when their leave request status changes.
   */
  async notifyLeaveStatusChange(
    request: LeaveRequest,
    employeeSlackId: string,
    managerName: string
  ): Promise<boolean> {
    const isApproved = request.status === 'APPROVED';
    const statusEmoji = isApproved ? '✅' : '❌';
    const statusColor = isApproved ? '#2eb886' : '#a30200';

    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${statusEmoji} Leave Request Update`,
          emoji: true
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Your leave request for *${request.startDate} to ${request.endDate}* has been *${request.status.toLowerCase()}* by ${managerName}.`
        }
      }
    ];

    return this.sendSlackMessage(employeeSlackId, `Leave Request ${request.status}`, blocks);
  }

  /**
   * Internal helper to dispatch POST request to Slack API
   */
  private async sendSlackMessage(
    channelOrUserId: string,
    fallbackText: string,
    blocks: any[]
  ): Promise<boolean> {
    if (this.slackApiToken === 'mock-token') {
      console.log(`[Mock Slack] Sending message to ${channelOrUserId}:`, JSON.stringify({ fallbackText, blocks }, null, 2));
      return true;
    }

    try {
      const response = await fetch(this.slackApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': `Bearer ${this.slackApiToken}`
        },
        body: JSON.stringify({
          channel: channelOrUserId,
          text: fallbackText,
          blocks: blocks
        })
      });

      const data = await response.json() as { ok: boolean; error?: string };
      if (!data.ok) {
        console.error('Slack API error:', data.error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
      return false;
    }
  }
}