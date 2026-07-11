import { SlackService } from '../services/slackService';

interface RequestPayload {
  id: string;
  title: string;
  requester: string;
  details: string;
  status: 'pending' | 'approved' | 'rejected';
}

export class RequestController {
  private slackService: SlackService;
  // Mock in-memory database storage
  private requestsDb: Map<string, RequestPayload> = new Map();

  constructor() {
    this.slackService = new SlackService();
  }

  /**
   * Handles creation of a new request and triggers a Slack notification.
   */
  public async createRequest(payload: Omit<RequestPayload, 'status'>): Promise<RequestPayload> {
    const newRequest: RequestPayload = { ...payload, status: 'pending' };
    this.requestsDb.set(newRequest.id, newRequest);

    // Trigger asynchronous Slack alert
    this.slackService.notifyNewRequest({
      id: newRequest.id,
      title: newRequest.title,
      requester: newRequest.requester,
      details: newRequest.details,
    }).catch((err) => console.error('Slack notification failed:', err));

    return newRequest;
  }

  /**
   * Approves an existing request and triggers a Slack notification.
   */
  public async approveRequest(requestId: string, approver: string, comments?: string): Promise<RequestPayload> {
    const request = this.requestsDb.get(requestId);
    if (!request) {
      throw new Error(`Request with ID ${requestId} not found.`);
    }

    request.status = 'approved';
    this.requestsDb.set(requestId, request);

    // Trigger asynchronous Slack alert
    this.slackService.notifyApproval({
      requestId: request.id,
      title: request.title,
      approver,
      comments,
    }).catch((err) => console.error('Slack notification failed:', err));

    return request;
  }

  /**
   * Rejects an existing request and triggers a Slack notification.
   */
  public async rejectRequest(requestId: string, rejector: string, reason: string): Promise<RequestPayload> {
    const request = this.requestsDb.get(requestId);
    if (!request) {
      throw new Error(`Request with ID ${requestId} not found.`);
    }

    request.status = 'rejected';
    this.requestsDb.set(requestId, request);

    // Trigger asynchronous Slack alert
    this.slackService.notifyRejection({
      requestId: request.id,
      title: request.title,
      rejector,
      reason,
    }).catch((err) => console.error('Slack notification failed:', err));

    return request;
  }
}
