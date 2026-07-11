import * as https from 'https';

export interface SlackMessage {
  text: string;
  blocks?: any[];
}

export class SlackClient {
  /**
   * Sends a structured JSON payload to a designated Slack Webhook URL.
   */
  public static async sendWebhook(webhookUrl: string, message: SlackMessage): Promise<void> {
    if (!webhookUrl) {
      throw new Error('Slack webhook URL is not configured.');
    }

    const payload = JSON.stringify(message);

    return new Promise((resolve, reject) => {
      const url = new URL(webhookUrl);
      const options = {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      };

      const req = https.request(options, (res) => {
        let responseBody = '';
        res.on('data', (chunk) => {
          responseBody += chunk;
        });

        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve();
          } else {
            reject(new Error(`Slack API responded with status ${res.statusCode}: ${responseBody}`));
          }
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.write(payload);
      req.end();
    });
  }
}