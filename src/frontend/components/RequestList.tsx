import React, { useState } from 'react';
import { Request } from '../types/request';
import { cancelRequest } from '../services/requestService';

interface RequestListProps {
  currentUserId: string;
  initialRequests: Request[];
}

export const RequestList: React.FC<RequestListProps> = ({ currentUserId, initialRequests }) => {
  const [requests, setRequests] = useState<Request[]>(initialRequests);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async (requestId: string) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) {
      return;
    }

    setLoadingId(requestId);
    setError(null);
    try {
      await cancelRequest(requestId);
      
      // Optimistically or reactively update state to reflect the cancelled status locally
      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId ? { ...req, status: 'cancelled' as const } : req
        )
      );
    } catch (err: any) {
      setError(err.message || 'An error occurred while trying to cancel the request.');
    } finally {
      setLoadingId(null);
    }
  };

  // Business logic: Allow cancellation only if the current user owns it and it's still pending
  const canCancel = (request: Request): boolean => {
    return request.employeeId === currentUserId && request.status === 'pending';
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">My Submitted Requests</h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.map((request) => (
              <tr key={request.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  {request.type}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {request.details}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${request.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                    ${request.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                    ${request.status === 'cancelled' ? 'bg-gray-100 text-gray-800' : ''}
                  `}>
                    {request.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {canCancel(request) ? ( 
                    <button
                      onClick={() => handleCancel(request.id)}
                      disabled={loadingId === request.id}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50 font-semibold transition-colors duration-150"
                    >
                      {loadingId === request.id ? 'Cancelling...' : 'Cancel Request'}
                    </button>
                  ) : (
                    <span className="text-gray-400 text-xs italic">
                      {request.status !== 'pending' ? 'Finalized' : 'Read-only'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500">
                  No requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
