import { SlackService, SlackBlock } from "./slackService";

export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface User {
  id: string;
  name: string;
  email: string;
  slackWebhookUrl?: string; // Webhook for direct DM or dedicated channel notification
}

export interface LeaveRequest {
  id: string;
  applicant: User;
  manager: User;
  startDate: string;
  endDate: string;
  leaveType: string;
  reason?: string;
  status: LeaveStatus;
}

export class LeaveStatusListener {
  /**
   * Listens to leave request status changes and notifies both applicant and manager via Slack.
   * 
   * @param leaveRequest The leave request with updated status and nested user information.
   * @returns Notification status object.
   */
  static async onLeaveStatusChange(leaveRequest: LeaveRequest): Promise<{
    applicantNotified: boolean;
    managerNotified: boolean;
  }> {
    const {
      id,
      applicant,
      manager,
      status,
      leaveType,
      startDate,
      endDate,
      reason
    } = leaveRequest;

    let applicantNotified = false;
    let managerNotified = false;

    // Status-specific configuration for visual mapping
    const statusConfig = {
      APPROVED: { emoji: "🟢", text: "Approved" },
      REJECTED: { emoji: "🔴", text: "Rejected" },
      CANCELLED: { emoji: "⚪", text: "Cancelled" },
      PENDING: { emoji: "🟡", text: "Pending Review" }
    };

    const currentStatus = statusConfig[status] || { emoji: "ℹ️", text: status };

    // 1. Notify Applicant of the decision
    if (applicant.slackWebhookUrl) {
      const applicantText = `Your leave request (#${id}) has been ${currentStatus.text.toLowerCase()} by ${manager.name}.`;
      const applicantBlocks: SlackBlock[] = [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Leave Request Update* ${currentStatus.emoji}\nHi *${applicant.name}*, your leave request status has been updated.`
          }
        },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*Status:*\n${currentStatus.emoji} ${currentStatus.text}` },
            { type: "mrkdwn", text: `*Leave Type:*\n${leaveType}` },
            { type: "mrkdwn", text: `*Dates:*\n${startDate} to ${endDate}` },
            { type: "mrkdwn", text: `*Reviewed By:*\n${manager.name}` }
          ]
        }
      ];

      if (reason) {
        applicantBlocks.push({
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Reason/Notes:*\n_${reason}_`
          }
        });
      }

      applicantNotified = await SlackService.sendNotification(applicant.slackWebhookUrl, {
        text: applicantText,
        blocks: applicantBlocks
      });
    }

    // 2. Notify Manager (Audit trail/confirmation of status change)
    if (manager.slackWebhookUrl) {
      const managerText = `Leave request (#${id}) for ${applicant.name} is now ${currentStatus.text}.`;
      const managerBlocks: SlackBlock[] = [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Leave Action Confirmation* \nLeave request status updated for *${applicant.name}*.`
          }
        },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*Applicant:*\n${applicant.name}` },
            { type: "mrkdwn", text: `*Status:*\n${currentStatus.emoji} ${currentStatus.text}` },
            { type: "mrkdwn", text: `*Leave Type:*\n${leaveType}` },
            { type: "mrkdwn", text: `*Duration:*\n${startDate} to ${endDate}` }
          ]
        }
      ];

      managerNotified = await SlackService.sendNotification(manager.slackWebhookUrl, {
        text: managerText,
        blocks: managerBlocks
      });
    }

    return { applicantNotified, managerNotified };
  }
}