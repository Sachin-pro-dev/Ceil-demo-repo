import React, { useState } from 'react';
import { LeaveRequest, LeaveType } from './types';

// Mock initial data to populate the UI for testing and viewing
const INITIAL_REQUESTS: LeaveRequest[] = [
  {
    id: '1',
    startDate: '2024-05-10',
    endDate: '2024-05-15',
    type: 'Annual',
    reason: 'Family vacation abroad',
    status: 'Approved',
    createdAt: '2024-04-01',
  },
  {
    id: '2',
    startDate: '2024-06-01',
    endDate: '2024-06-02',
    type: 'Sick',
    reason: 'Routine medical checkup and recovery',
    status: 'Pending',
    createdAt: '2024-04-15',
  }
];

export const LeaveSubmissionUI: React.FC = () => {
  const [requests, setRequests] = useState<LeaveRequest[]>(INITIAL_REQUESTS);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [type, setType] = useState<LeaveType>('Annual');
  const [reason, setReason] = useState('');
  
  // UI Feedback States
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Handle form submission for both creation and editing
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation checks
    if (!startDate || !endDate || !reason.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('The start date cannot be later than the end date.');
      return;
    }

    if (editingId) {
      // Update existing request (Only permitted if request status is 'Pending')
      setRequests(prev => prev.map(req => {
        if (req.id === editingId) {
          if (req.status !== 'Pending') {
            setError('Only pending requests can be modified.');
            return req;
          }
          return { ...req, startDate, endDate, type, reason };
        }
        return req;
      }));
      setSuccess('Leave request updated successfully!');
      setEditingId(null);
    } else {
      // Submit a new request
      const newRequest: LeaveRequest = {
        id: Math.random().toString(36).substring(2, 9),
        startDate,
        endDate,
        type,
        reason,
        status: 'Pending',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setRequests(prev => [newRequest, ...prev]);
      setSuccess('Leave request submitted successfully!');
    }

    resetForm();
  };

  // Populate form with existing data for editing
  const handleEdit = (request: LeaveRequest) => {
    if (request.status !== 'Pending') {
      alert('Only pending leave requests can be updated.');
      return;
    }
    setEditingId(request.id);
    setStartDate(request.startDate);
    setEndDate(request.endDate);
    setType(request.type);
    setReason(request.reason);
    setError(null);
    setSuccess(null);
  };

  const handleCancel = () => {
    resetForm();
    setEditingId(null);
    setError(null);
  };

  const resetForm = () => {
    setStartDate('');
    setEndDate('');
    setType('Annual');
    setReason('');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen font-sans">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Leave Request Dashboard</h1>
        <p className="text-gray-600">Submit new requests, edit pending submissions, and monitor your leave history.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-fit">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {editingId ? 'Edit Leave Request' : 'Submit New Request'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
              {error}
            </div>
          )} 
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as LeaveType)}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              >
                <option value="Annual">Annual Leave</option>
                <option value="Sick">Sick Leave</option>
                <option value="Maternity">Maternity Leave</option>
                <option value="Paternity">Paternity Leave</option>
                <option value="Unpaid">Unpaid Leave</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Provide details or justification..."
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                {editingId ? 'Save Changes' : 'Submit'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* View/List Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Leave History</h2>
          <div className="overflow-x-auto">
            {requests.length === 0 ? (
              <p className="text-gray-500 py-4 text-center">No leave requests submitted yet.</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Leave Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Duration</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reason</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{request.type}</div>
                        <div className="text-xs text-gray-400">Submitted: {request.createdAt}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div>{request.startDate}</div>
                        <div className="text-xs text-gray-400">to</div>
                        <div>{request.endDate}</div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 max-w-xs truncate" title={request.reason}>
                        {request.reason}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                          request.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {request.status === 'Pending' ? (
                          <button
                            onClick={() => handleEdit(request)}
                            className="text-blue-600 hover:text-blue-900 focus:outline-none underline"
                          >
                            Edit
                          </button>
                        ) : (
                          <span className="text-gray-400 cursor-not-allowed" title="Approved or Rejected requests cannot be altered">
                            Locked
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
