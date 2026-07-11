/**
 * Supported stages in the Ceil approval lifecycle.
 */
export type ApprovalStage = 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';

/**
 * Standard payload describing an approval event.
 */
export interface ApprovalDetails {
  id: string;
  title: string;
  requesterName: string;
  requesterEmail: string;
  approverName?: string;
  stage: ApprovalStage;
  project?: string;
  comments?: string;
  timestamp: string;
}

/**
 * Configuration options for Slack integration.
 */
export interface SlackConfig {
  webhookUrl: string;
  channel?: string;
}
