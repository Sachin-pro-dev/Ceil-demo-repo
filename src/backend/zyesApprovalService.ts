import { Pool } from 'pg';

export interface ApprovalRecord {
  id?: number;
  slackUserId: string;
  approvalCode: string;
  payload: Record<string, any>;
  createdAt?: Date;
}

/**
 * Service to manage and audit requirement changes and approvals initiated via Slack,
 * specifically handling the 'zyes' confirmation flag.
 */
export class ZYesApprovalService {
  private dbPool: Pool;

  constructor(dbPool: Pool) {
    this.dbPool = dbPool;
  }

  /**
   * Records a 'zyes' confirmation or requirement change approval from a specific Slack user.
   * @param slackUserId The Slack user ID (e.g., 'U0BGMA29U9L')
   * @param payload Additional metadata or context about the requirement change
   */
  async recordZYesApproval(slackUserId: string, payload: Record<string, any> = {}): Promise<ApprovalRecord> {
    const query = `
      INSERT INTO slack_approvals (slack_user_id, approval_code, payload)
      VALUES ($1, $2, $3)
      RETURNING id, slack_user_id AS "slackUserId", approval_code AS "approvalCode", payload, created_at AS "createdAt"
    `;
    const values = [slackUserId, 'zyes', JSON.stringify(payload)];
    const res = await this.dbPool.query(query, values);
    return res.rows[0];
  }

  /**
   * Checks if a 'zyes' approval exists in the system, optionally filtered by a specific Slack user.
   * @param slackUserId Optional Slack user ID to filter by
   */
  async hasZYesApproval(slackUserId?: string): Promise<boolean> {
    let query = 'SELECT EXISTS(SELECT 1 FROM slack_approvals WHERE approval_code = \'zyes\'';
    const values: any[] = [];

    if (slackUserId) {
      query += ' AND slack_user_id = $1';
      values.push(slackUserId);
    }
    query += ')';

    const res = await this.dbPool.query(query, values);
    return res.rows[0]?.exists || false;
  }
}