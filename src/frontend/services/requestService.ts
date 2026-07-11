import { Request } from '../types/request';

/**
 * Triggers the API request to cancel an employee's own request.
 * This endpoint should validate that the requester owns the request and that it is still pending.
 */
export async function cancelRequest(requestId: string): Promise<Request> {
  const response = await fetch(`/api/requests/${requestId}/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to cancel the request.');
  }

  return response.json();
}
