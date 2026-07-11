export interface ApprovalEvent {
  approvalId: string;
  title: string;
  requesterName: string;
  requesterEmail: string;
  approverName?: string;
  status: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED';
  amount?: string;
  detailsUrl: string;
}

export class SlackService {
  /**
   * Sends a structured, production-grade Block Kit message to a Slack webhook.
   */
  async sendApprovalNotification(webhookUrl: string, event: ApprovalEvent): Promise<boolean> {
    const statusColors: Record<string, string> = {
      SUBMITTED: "#36a64f", // Green
      APPROVED: "#2eb886",  // Teal
      REJECTED: "#a30200",  // Red
      REVISION_REQUESTED: "#e0a115" // Yellow/Orange
    };

    const formattedStatus = event.status.replace(/_/g, ' ');
    const payload = {
      attachments: [
        {
          color: statusColors[event.status] || "#cccccc",
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*Approval Event Notification: ${formattedStatus}*` 
              }
            },
            {
              type: "section",
              fields: [
                { type: "mrkdwn", text: `*Request ID:*\n${event.approvalId}` },
                { type: "mrkdwn", text: `*Title:*\n${event.title}` },
                { type: "mrkdwn", text: `*Requester:*\n${event.requesterName} (${event.requesterEmail})` },
                { type: "mrkdwn", text: `*Amount/Value:*\n${event.amount || 'N/A'}` }
              ]
            },
            {
              type: "actions",
              elements: [
                {
                  type: "button",
                  text: {
                    type: "plain_text",
                    text: "View Details",
                    emoji: true
                  },
                  url: event.detailsUrl,
                  style: "primary"
                }
              ]
            }
          ]
        }
      ]
    };

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Slack API error (${response.status}): ${errText}`);
      }
      return true;
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
      throw error;
    }
  }
}