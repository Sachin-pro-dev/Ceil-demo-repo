/**
 * Service responsible for interacting directly with the Slack API / Webhooks.
 */

export interface SlackMessagePayload {
  text: string;
  blocks?: Array<{
    type: string;
    text?: {
      type: string;
      text: string;
    };
    fields?: Array<{
      type: string;
      text: string;
    }>;
  }>;
}

export class SlackNotificationService {
  private webhookUrl: string;

  constructor(webhookUrl?: string) {
    // Retrieve webhook URL from configured parameter or environment variables
    this.webhookUrl = webhookUrl || process.env.SLACK_WEBHOOK_URL || '';
  }

  /**
   * Sends a structured message with blocks to the configured Slack webhook channel.
   * @param payload The structured Slack message payload.
   */
  async sendNotification(payload: SlackMessagePayload): Promise<boolean> {
    if (!this.webhookUrl) {
      console.warn('[SlackNotificationService] Slack Webhook URL is not configured. Skipping alert dispatch.');
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
        const errorText = await response.text();
        console.error(`[SlackNotificationService] Failed to send Slack alert: ${response.status} - ${errorText}`);
        return false;
      }

      return true;
    } catch (error) {
      console.error('[SlackNotificationService] Error sending Slack notification:', error);
      return false;
    }
  }
}
