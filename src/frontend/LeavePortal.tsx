import React, { useState } from 'react';
import { LeaveType, LeaveBalance, LeaveRequest } from './types';

// Mock initial data for balances
const INITIAL_BALANCES: LeaveBalance[] = [
  { type: 'Annual', allocated: 25, used: 10, pending: 2, remaining: 13 },
  { type: 'Sick', allocated: 10, used: 3, pending: 0, remaining: 7 },
  { type: 'Maternity', allocated: 90, used: 0, pending: 0, remaining: 90 },
  { type: 'Study', allocated: 5, used: 2, pending: 1, remaining: 2 },
];

// Mock initial data for requests
const INITIAL_REQUESTS: LeaveRequest[] = [
  {
    id: 'LR-101',
    leaveType: 'Annual',
    startDate: '2023-12-20',
    endDate: '2023-12-27',
    reason: 'Family Christmas holiday trip.',
    status: 'Approved',
    submittedAt: '2023-11-15',
  },
  {
    id: 'LR-102',
    leaveType: 'Sick',
    startDate: '2023-11-05',
    endDate: '2023-11-06',
    reason: 'Dental surgery and recovery.',
    status: 'Approved',
    submittedAt: '2023-11-05',
  },
  {
    id: 'LR-103',
    leaveType: 'Study',
    startDate: '2024-01-15',
    endDate: '2024-01-16',
    reason: 'Final semester exams preparation.',
    status: 'Pending',
    submittedAt: '2023-12-01',
  },
];

export const LeavePortal: React.FC = () => {
  const [balances, setBalances] = useState<LeaveBalance[]>(INITIAL_BALANCES);
  const [requests, setRequests] = useState<LeaveRequest[]>(INITIAL_REQUESTS);
  const [filter, setFilter] = useState<string>('All');

  // Form State
  const [leaveType, setLeaveType] = useState<LeaveType>('Annual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!startDate || !endDate || !reason.trim()) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      setError('End date cannot be earlier than start date.');
      return;
    }

    // Calculate duration in days
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Check leave balance availability
    const currentBalance = balances.find((b) => b.type === leaveType);
    if (currentBalance && currentBalance.remaining < diffDays) {
      setError(`Insufficient balance. You requested ${diffDays} days but only have ${currentBalance.remaining} remaining.`);
      return;
    }

    // Create new leave request
    const newRequest: LeaveRequest = {
      id: `LR-${Math.floor(100 + Math.random() * 900)}`,
      leaveType,
      startDate,
      endDate,
      reason,
      status: 'Pending',
      submittedAt: new Date().toISOString().split('T')[0],
    };

    // Update leave request list
    setRequests([newRequest, ...requests]);

    // Update corresponding leave balance (add to pending, decrease remaining)
    setBalances((prevBalances) =>
      prevBalances.map((b) =>
        b.type === leaveType
          ? {
              ...b,
              pending: b.pending + diffDays,
              remaining: b.remaining - diffDays,
            }
          : b
      )
    );

    // Reset Form
    setStartDate('');
    setEndDate('');
    setReason('');
    setSuccess(`Successfully submitted request for ${diffDays} day(s) of ${leaveType} leave!`);
  };

  // Filter requests based on status
  const filteredRequests = requests.filter(
    (req) => filter === 'All' || req.status === filter
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Employee Leave Portal</h1>
            <p className="text-gray-500 mt-1">Submit requests, track approvals, and view your remaining balances.</p>
          </div>
          <div className="mt-4 md:mt-0 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold">
            Employee ID: EMP-4091
          </div>
        </div>

        {/* Leave Balances Grid */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Your Leave Balances</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {balances.map((balance) => (
              <div key={balance.type} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{balance.type}</span>
                  <span className="px-2 py-1 text-xs font-bold rounded-full bg-indigo-50 text-indigo-700">
                    {balance.allocated} Days Aloc.
                  </span>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-extrabold text-gray-900">{balance.remaining}</span>
                  <span className="text-sm font-medium text-gray-500">days left</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 pt-3 border-t border-gray-50 text-xs text-gray-500">
                  <div>Used: <span className="font-bold text-gray-700">{balance.used}d</span></div>
                  <div>Pending: <span className="font-bold text-yellow-600">{balance.pending}d</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Two-Column Layout: Form & History */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Request Form */}
          <div className="lg:col-span-5 bg-white rounded-xl shadow-sm border border-gray-100 p-6 self-start">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Request Leave</h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm rounded">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 bg-white text-gray-800 text-sm"
                >
                  {balances.map((b) => (
                    <option key={b.type} value={b.type}>
                      {b.type} Leave ({b.remaining} days remaining)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 text-gray-800 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 text-gray-800 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Reason / Description</label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Please state the reason for your leave request..."
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 text-gray-800 text-sm"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm transition-colors text-sm"
              >
                Submit Leave Request
              </button>
            </form>
          </div>

          {/* Request History */}
          <div className="lg:col-span-7 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Request History</h2>
              
              {/* Filters */}
              <div className="flex space-x-1 mt-3 sm:mt-0 bg-gray-100 p-1 rounded-lg text-xs">
                {['All', 'Pending', 'Approved', 'Rejected'].map((statusOption) => (
                  <button
                    key={statusOption}
                    onClick={() => setFilter(statusOption)}
                    className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                      filter === statusOption
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {statusOption}
                  </button>
                ))}
              </div>
            </div>

            {/* Requests Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID / Submitted</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type & Dates</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100 text-sm">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                        No leave requests found for this filter.
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-gray-50/55">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="font-semibold text-gray-900">{req.id}</div>
                          <div className="text-xs text-gray-400">{req.submittedAt}</div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-medium text-gray-800">{req.leaveType}</span>
                          <div className="text-xs text-gray-500">
                            {req.startDate} to {req.endDate}
                          </div>
                        </td>
                        <td className="px-4 py-4 max-w-xs truncate text-gray-600">
                          {req.reason}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                              req.status === 'Approved'
                                ? 'bg-green-100 text-green-800'
                                : req.status === 'Pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {req.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
