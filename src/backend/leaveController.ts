import { LeaveService, UserRole } from './leaveService';

// Dummy interface mirroring Express Request/Response structure for seamless framework integration
export interface SimpleRequest {
  body: any;
  params: { [key: string]: string };
  user?: { id: number; role: UserRole };
}

export interface SimpleResponse {
  status(code: number): SimpleResponse;
  json(data: any): void;
}

export class LeaveController {
  private leaveService: LeaveService;

  constructor(leaveService: LeaveService) {
    this.leaveService = leaveService;
  }

  public createLeaveRequest = async (req: SimpleRequest, res: SimpleResponse): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { startDate, endDate, reason } = req.body;
      if (!startDate || !endDate || !reason) {
        res.status(400).json({ error: 'Missing required parameters' });
        return;
      }

      const request = await this.leaveService.createRequest(
        req.user.id,
        new Date(startDate),
        new Date(endDate),
        reason
      );
      res.status(201).json(request);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  public handleApproval = async (req: SimpleRequest, res: SimpleResponse): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const requestId = parseInt(req.params.id, 10);
      const { action, note } = req.body;

      if (!action || (action !== 'APPROVE' && action !== 'REJECT')) {
        res.status(400).json({ error: 'Invalid or missing action. Must be APPROVE or REJECT' });
        return;
      }

      const updatedRequest = await this.leaveService.processApproval(requestId, {
        approverId: req.user.id,
        approverRole: req.user.role,
        action,
        note
      });

      res.status(200).json(updatedRequest);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  public getRequestDetails = async (req: SimpleRequest, res: SimpleResponse): Promise<void> => {
    try {
      const requestId = parseInt(req.params.id, 10);
      const request = await this.leaveService.getRequestById(requestId);
      if (!request) {
        res.status(404).json({ error: 'Leave request not found' });
        return;
      }

      const history = await this.leaveService.getHistory(requestId);
      res.status(200).json({ request, history });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}