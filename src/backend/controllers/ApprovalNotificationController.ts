import { Request, Response } from 'express';
import { SlackService } from '../services/SlackService';
import { ApprovalDetails } from '../types/ApprovalTypes';

/**
 * Express controller handling incoming approval lifecycle events and executing Slack notifications.
 */
export class ApprovalNotificationController {
  private slackService: SlackService;

  constructor() {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL || '';
    this.slackService = new SlackService({ webhookUrl });
  }

  /**
   * Receives approval lifecycle webhook events and dispatches Slack notifications.
   */
  public handleApprovalEvent = async (req: Request, res: Response): Promise<void> => {
    try {
      const details: ApprovalDetails = req.body;

      if (!details || !details.id || !details.stage || !details.title) {
        res.status(400).json({
          success: false,
          error: 'Missing required approval details (id, stage, title).',
        });
        return;
      }

      await this.slackService.sendApprovalNotification(details);

      res.status(200).json({
        success: true,
        message: 'Slack notification dispatched successfully.',
      });
    } catch (error: any) {
      console.error('Error dispatching Slack notification:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error while processing notification.',
      });
    }
  };
}
