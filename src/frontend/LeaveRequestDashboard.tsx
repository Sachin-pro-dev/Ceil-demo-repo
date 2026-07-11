import React, { useState, useEffect } from 'react';
import { LeaveRequest, LeaveType, LeaveBalance } from './types';

// Mock initial leave balances
const INITIAL_BALANCES: LeaveBalance[] = [
  { type: 'Vacation', allocated: 20, used: 8 },
  { type: 'Sick Leave', allocated: 10, used: 2 },
  { type: 'Personal Leave', allocated: 5, used: 1 },
  { type: 'Parental Leave', allocated: 40, used: 0 },
];

// Mock initial requests for realistic UI display
const INITIAL_REQUESTS: LeaveRequest[] = [
  {
    id: 'REQ-001',
    leaveType: 'Vacation',
    startDate: '2024-12-20',
    endDate: '2025-01-03',
    reason: 'Annual family winter holiday trip.',
    status: 'Approved',
    appliedDate: '2024-11-15',
    approverComments: 'Approved. Please ensure your handovers are complete.'
  },
  {
    id: 'REQ-002',
    leaveType: 'Sick Leave',
    startDate: '2024-11-02',
    endDate: '2024-11-03',
    reason: 'Dental surgery recovery.',
    status: 'Approved',
    appliedDate: '2024-10-31'
  },
  {
    id: 'REQ-003',
    leaveType: 'Personal Leave',
    startDate: '2024-11-10',
    endDate: '2024-11-10',
    reason: 'Moving to a new apartment.',
    status: 'Pending',
    appliedDate: '2024-11-08'
  }
];

export const LeaveRequestDashboard: React.FC = () => {
  const [requests, setRequests] = useState<LeaveRequest[]>(INITIAL_REQUESTS);
  const [balances, setBalances] = useState<LeaveBalance[]>(INITIAL_BALANCES);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Form State
  const [leaveType, setLeaveType] = useState<LeaveType>('Vacation');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState('');

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!startDate || !endDate || !reason.trim()) {
      setFormError('Please fill out all fields.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setFormError('Start date cannot be after end date.');
      return;
    }

    const newRequest: LeaveRequest = {
      id: `REQ-00${requests.length + 1}`,
      leaveType,
      startDate,
      endDate,
      reason,
      status: 'Pending',
      appliedDate: new Date().toISOString().split('T')[0]
    };

    // Update list and close modal
    setRequests([newRequest, ...requests]);
    setIsSubmitModalOpen(false);
    
    // Reset form
    setStartDate('');
    setEndDate('');
    setReason('');
    setLeaveType('Vacation');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-200 pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Employee Leave Portal</h1>
            <p className="text-sm text-gray-500 mt-1">Submit requests, track approvals, and manage your time off balance.</p>
          </div>
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="mt-4 md:mt-0 inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Request Leave
          </button>
        </div>

        {/* Leave Balances Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {balances.map((balance) => {
            const remaining = balance.allocated - balance.used;
            const percentUsed = (balance.used / balance.allocated) * 100;
            return (
              <div key={balance.type} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 transition-shadow hover:shadow-md">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-gray-500">{balance.type}</span>
                  <span className="text-xs font-semibold px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full">
                    {remaining} Days Left
                  </span>
                </div>
                <div className="mt-4">
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold text-gray-900">{balance.used}</span>
                    <span className="text-sm text-gray-400 ml-1">/ {balance.allocated} days used</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(percentUsed, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Requests List */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">My Leave History</h2>
              <span className="text-xs text-gray-500">Showing {requests.length} entries</span>
            </div>
            
            <div className="divide-y divide-gray-100 max-h-[550px] overflow-y-auto">
              {requests.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No leave requests found. Click "Request Leave" to get started.</div>
              ) : (
                requests.map((req) => (
                  <div 
                    key={req.id}
                    onClick={() => setSelectedRequest(req)}
                    className={`p-6 cursor-pointer hover:bg-gray-50 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${selectedRequest?.id === req.id ? 'bg-indigo-50/50 border-l-4 border-indigo-600 pl-5' : ''}`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{req.leaveType}</span>
                        <span className="text-xs text-gray-400">({req.id})</span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {req.startDate} to {req.endDate}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Applied on {req.appliedDate}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold
                        ${req.status === 'Approved' ? 'bg-green-100 text-green-800' : ''}
                        ${req.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${req.status === 'Rejected' ? 'bg-red-100 text-red-800' : ''}
                      `}>
                        {req.status}
                      </span>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Request Tracker / Detail View */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
            {selectedRequest ? (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-4 mb-4">Request Tracker</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Type & Duration</label>
                    <p className="text-base font-semibold text-gray-900 mt-1">{selectedRequest.leaveType}</p>
                    <p className="text-sm text-gray-600">{selectedRequest.startDate} to {selectedRequest.endDate}</p>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Reason</label>
                    <p className="text-sm text-gray-700 mt-1 bg-gray-50 p-3 rounded-lg border border-gray-100">"{selectedRequest.reason}"</p>
                  </div>

                  {selectedRequest.approverComments && (
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Approver Feedback</label>
                      <p className="text-sm text-indigo-900 mt-1 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">{selectedRequest.approverComments}</p>
                    </div>
                  )}

                  {/* Progress Timeline */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-4">Timeline Status</label>
                    <div className="relative pl-6 border-l-2 border-gray-200 space-y-6">
                      {/* Step 1: Applied */}
                      <div className="relative">
                        <span className="absolute -left-[31px] bg-green-500 rounded-full p-1 text-white">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        <p className="text-sm font-semibold text-gray-900">Request Submitted</p>
                        <p className="text-xs text-gray-500">Applied on {selectedRequest.appliedDate}</p>
                      </div>

                      {/* Step 2: Review/Decision */}
                      <div className="relative">
                        <span className={`absolute -left-[31px] rounded-full p-1 text-white 
                          ${selectedRequest.status === 'Approved' ? 'bg-green-500' : ''}
                          ${selectedRequest.status === 'Pending' ? 'bg-yellow-500' : ''}
                          ${selectedRequest.status === 'Rejected' ? 'bg-red-500' : ''}
                        `}>
                          {selectedRequest.status === 'Pending' ? (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4l3 3" />
                            </svg>
                          ) : (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </span>
                        <p className="text-sm font-semibold text-gray-900">
                          {selectedRequest.status === 'Pending' ? 'Pending Approval' : `Manager Decision: ${selectedRequest.status}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {selectedRequest.status === 'Pending' ? 'Under review by operations team' : 'Decision finalized'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                <p className="text-sm font-medium text-gray-600">No request selected</p>
                <p className="text-xs text-gray-400 mt-1">Select any leave history item to view full tracking history and details.</p>
              </div>
            )}
          </div>
        </div>

        {/* Request Submission Modal */}
        {isSubmitModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 transform transition-all">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
                <h3 className="text-lg font-bold text-gray-900">Submit New Leave Request</h3>
                <button 
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {formError && (
                  <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-100">
                    {formError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
                  >
                    <option value="Vacation">Vacation</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Personal Leave">Personal Leave</option>
                    <option value="Parental Leave">Parental Leave</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason / Remarks</label>
                  <textarea
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Provide a reason for your request..."
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsSubmitModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
