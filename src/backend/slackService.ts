/**
 * Slack Notification Service
 * Handles low-level formatting and HTTP POST requests to Slack Webhooks.
 */

export interface SlackBlock {
  type: "section" | "divider" | "actions" | "context";
  text?: {
    type: "plain_text" | "mrkdwn";
    text: string;
  };
  fields?: Array<{
    type: "plain_text" | "mrkdwn";
    text: string;
  }>;
}

export interface SlackPayload {
  text: string;
  blocks?: SlackBlock[];
}

export class SlackService {
  /**
   * Dispatches a structured payload to a target Slack Webhook URL.
   * 
   * @param webhookUrl The incoming webhook URL configured in Slack.
   * @param payload The structured text and blocks payload.
   * @returns Promise<boolean> indicating success status.
   */
  static async sendNotification(webhookUrl: string, payload: SlackPayload): Promise<boolean> {
    if (!webhookUrl) {
      console.warn("[SlackService] Missing webhook URL. Skipping notification.");
      return false;
    }

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[SlackService] Failed to send notification. HTTP ${response.status}: ${errorText}`);
        return false;
      }

      return true;
    } catch (error) {
      console.error("[SlackService] Connection error sending to Slack:", error);
      return false;
    }
  }
}