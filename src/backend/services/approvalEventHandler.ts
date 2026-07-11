import { SlackService, ApprovalEvent } from './slackService';

interface DbClient {
  query: (text: string, params: any[]) => Promise<{ rows: any[] }>;
}

export class ApprovalEventHandler {
  private slackService: SlackService;
  private db: DbClient;

  constructor(db: DbClient) {
    this.slackService = new SlackService();
    this.db = db;
  }

  /**
   * Handles incoming approval lifecycle events, matches them to registered channels,
   * delivers real-time Slack updates, and persists logs for delivery auditing.
   */
  async handleEvent(event: ApprovalEvent): Promise<void> {
    // 1. Fetch matching Slack configurations subscribed to this event status
    const queryText = `
      SELECT webhook_url, channel_name 
      FROM slack_configs 
      WHERE $1 = ANY(event_subscriptions)
    `;
    
    let configs: Array<{ webhook_url: string; channel_name: string }> = [];
    try {
      const res = await this.db.query(queryText, [event.status]);
      configs = res.rows;
    } catch (err) {
      console.error('Database query failed while fetching Slack configs:', err);
      return;
    }

    if (configs.length === 0) {
      console.log(`No Slack configurations subscribed to event status: ${event.status}`);
      return;
    }

    // 2. Dispatch notifications and record outcome status in logs
    for (const config of configs) {
      let deliveryStatus: 'SUCCESS' | 'FAILED' = 'SUCCESS';
      let errorMessage: string | null = null;

      try {
        await this.slackService.sendApprovalNotification(config.webhook_url, event);
      } catch (err: any) {
        deliveryStatus = 'FAILED';
        errorMessage = err.message || String(err);
      }

      // Log notification attempt
      try {
        await this.db.query(
          `INSERT INTO notification_logs 
           (approval_id, event_type, recipient_email, slack_channel, status, error_message) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            event.approvalId,
            event.status,
            event.requesterEmail,
            config.channel_name,
            deliveryStatus,
            errorMessage
          ]
        );
      } catch (logErr) {
        console.error('Failed to write to notification_logs:', logErr);
      }
    }
  }
}