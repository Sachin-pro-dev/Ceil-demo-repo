/**
 * Slack API Block Kit structures for rich messaging layouts.
 */
export interface SlackBlock {
  type: 'section' | 'actions' | 'divider' | 'header' | 'context';
  text?: {
    type: 'mrkdwn' | 'plain_text';
    text: string;
    emoji?: boolean;
  };
  fields?: Array<{
    type: 'mrkdwn' | 'plain_text';
    text: string;
  }>;
  elements?: Array<any>;
}

export interface SlackMessagePayload {
  text: string; // Fallback text for notifications/mobile alerts
  blocks?: SlackBlock[];
}

/**
 * Data structure for Leave Status Update events.
 */
export interface LeaveStatusNotification {
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: 'APPROVED' | 'REJECTED' | 'PENDING';
  approverName?: string;
  comments?: string;
}

/**
 * Data structure for Pending Action alerts (e.g., approval requests).
 */
export interface PendingActionNotification {
  actionId: string;
  title: string;
  requesterName: string;
  description: string;
  dueDate?: string;
  actionUrl: string;
}
