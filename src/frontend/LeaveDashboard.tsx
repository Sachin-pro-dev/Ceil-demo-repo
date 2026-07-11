import React, { useState, useEffect, useMemo } from 'react';
import { LeaveRequest, LeaveType, LeaveStatus, LeaveBalance } from './types';

const STORAGE_KEY = 'ceil_leave_requests';

// Prepopulated data for a professional and functional initial load
const INITIAL_REQUESTS: LeaveRequest[] = [
  {
    id: 'req-1',
    leaveType: 'Annual Leave',
    startDate: '2024-12-24',
    endDate: '2025-01-03',
    reason: 'Christmas holidays and family reunion.',
    status: 'Approved',
    createdAt: '2024-11-10T09:30:00.000Z',
    reviewedBy: 'Sarah Jenkins (HR Manager)',
    reviewComment: 'Approved. Have a wonderful holiday season!'
  },
  {
    id: 'req-2',
    leaveType: 'Sick Leave',
    startDate: '2024-11-14',
    endDate: '2024-11-15',
    reason: 'Dental procedure and recovery.',
    status: 'Approved',
    createdAt: '2024-11-13T08:15:00.000Z',
    reviewedBy: 'Sarah Jenkins (HR Manager)'
  },
  {
    id: 'req-3',
    leaveType: 'Annual Leave',
    startDate: '2025-03-10',
    endDate: '2025-03-14',
    reason: 'Spring family vacation.',
    status: 'Pending',
    createdAt: '2024-11-20T14:05:00.000Z'
  }
];

// Initial leave balances for the employee
const INITIAL_BALANCES: LeaveBalance[] = [
  { leaveType: 'Annual Leave', allocated: 25, used: 9, pending: 5 },
  { leaveType: 'Sick Leave', allocated: 10, used: 2, pending: 0 },
  { leaveType: 'Maternity/Paternity', allocated: 40, used: 0, pending: 0 },
  { leaveType: 'Unpaid Leave', allocated: 15, used: 0, pending: 0 },
  { leaveType: 'Compassionate Leave', allocated: 5, used: 0, pending: 0 }
];

export const LeaveDashboard: React.FC = () => {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>(INITIAL_BALANCES);
  const [filter, setFilter] = useState<LeaveStatus | 'All'>('All');

  // Form State
  const [leaveType, setLeaveType] = useState<LeaveType>('Annual Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Load initial data from localStorage or fallback to defaults
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setRequests(JSON.parse(stored));
      } catch (e) {
        setRequests(INITIAL_REQUESTS);
      }
    } else {
      setRequests(INITIAL_REQUESTS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REQUESTS));
    }
  }, []);

  // Save to localStorage and recalculate balances when requests change
  useEffect(() => {
    if (requests.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
      
      // Dynamically recalculate balances based on updated requests state
      const updatedBalances = INITIAL_BALANCES.map(bal => {
        const typeRequests = requests.filter(r => r.leaveType === bal.leaveType);
        const used = typeRequests
          .filter(r => r.status === 'Approved')
          .reduce((acc, curr) => acc + calculateDays(curr.startDate, curr.endDate), 0);
        const pending = typeRequests
          .filter(r => r.status === 'Pending')
          .reduce((acc, curr) => acc + calculateDays(curr.startDate, curr.endDate), 0);
        return { ...bal, used, pending };
      });
      setBalances(updatedBalances);
    }
  }, [requests]);

  // Helper to calculate business/calendar days between dates
  const calculateDays = (start: string, end: string): number => {
    if (!start || !end) return 0;
    const sDate = new Date(start);
    const eDate = new Date(end);
    const diffTime = Math.abs(eDate.getTime() - sDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return isNaN(diffDays) ? 0 : diffDays;
  };

  // Form Submission Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSuccessMsg('');

    if (!leaveType || !startDate || !endDate || !reason.trim()) {
      setFormError('Please fill in all fields.');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      setFormError('Start date cannot be in the past.');
      return;
    }

    if (end < start) {
      setFormError('End date must be on or after the start date.');
      return;
    }

    const requestedDays = calculateDays(startDate, endDate);
    const selectedBalance = balances.find(b => b.leaveType === leaveType);
    const remaining = selectedBalance 
      ? selectedBalance.allocated - selectedBalance.used - selectedBalance.pending 
      : 0;

    if (requestedDays > remaining && leaveType !== 'Unpaid Leave') {
      setFormError(`Insufficient balance. You requested ${requestedDays} days, but only have ${remaining} days remaining.`);
      return;
    }

    const newRequest: LeaveRequest = {
      id: `req-${Date.now()}`,
      leaveType,
      startDate,
      endDate,
      reason: reason.trim(),
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    setRequests(prev => [newRequest, ...prev]);
    setSuccessMsg('Your leave request has been submitted successfully.');
    
    // Reset form
    setStartDate('');
    setEndDate('');
    setReason('');
  };

  // Filtered requests
  const filteredRequests = useMemo(() => {
    if (filter === 'All') return requests;
    return requests.filter(r => r.status === filter);
  }, [requests, filter]);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="border-b border-gray-200 pb-5">
          <h1 className="text-3xl font-bold leading-6 text-slate-900">Leave Management</h1>
          <p className="mt-2 text-sm text-slate-500">
            Submit new leave requests, monitor balances, and track status updates.
          </p>
        </div>

        {/* Leave Balance Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {balances.map((bal) => {
            const remaining = bal.allocated - bal.used - bal.pending;
            return (
              <div key={bal.leaveType} className="bg-white overflow-hidden shadow rounded-lg border border-slate-100">
                <div className="p-5">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">
                    {bal.leaveType}
                  </h3>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-slate-900">{remaining}d</span>
                    <span className="text-xs text-slate-500">of {bal.allocated}d left</span>
                  </div>
                  <div className="mt-4 space-y-1">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Approved / Used:</span>
                      <span className="font-medium text-slate-700">{bal.used}d</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Pending Review:</span>
                      <span className="font-medium text-amber-600">{bal.pending}d</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* Request Form */}
          <div className="bg-white p-6 rounded-lg shadow border border-slate-100 lg:col-span-1">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">New Leave Request</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                  className="mt-1 block w-full rounded-md border border-slate-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="Annual Leave">Annual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Maternity/Paternity">Maternity/Paternity</option>
                  <option value="Unpaid Leave">Unpaid Leave</option>
                  <option value="Compassionate Leave">Compassionate Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-slate-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-slate-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              {startDate && endDate && (
                <div className="text-sm text-indigo-600 bg-indigo-50 p-2.5 rounded-md">
                  Total Requested: <span className="font-bold">{calculateDays(startDate, endDate)} day(s)</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700">Reason</label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide details or context for your request..."
                  className="mt-1 block w-full rounded-md border border-slate-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              {formError && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 font-medium">
                  {formError}
                </div>
              )}

              {successMsg && (
                <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700 font-medium">
                  {successMsg}
                </div>
              )}

              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Submit Request
              </button>
            </form>
          </div>

          {/* Request Tracking List */}
          <div className="bg-white p-6 rounded-lg shadow border border-slate-100 lg:col-span-2">
            <div className="sm:flex sm:items-center sm:justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900">Request History & Status</h2>
              
              {/* Filter Tabs */}
              <div className="mt-3 sm:mt-0 sm:ml-4">
                <nav className="flex space-x-1 bg-slate-100 p-1 rounded-lg" aria-label="Tabs">
                  {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setFilter(tab)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                        filter === tab
                          ? 'bg-white text-slate-950 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Request List */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {filteredRequests.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
                  <p className="text-sm text-slate-500">No leave requests found matching this status.</p>
                </div>
              ) : (
                filteredRequests.map((req) => (
                  <div
                    key={req.id}
                    className="border border-slate-100 hover:border-slate-200 rounded-lg p-4 bg-slate-50 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-slate-900">{req.leaveType}</span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-500">
                            Requested on {new Date(req.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 mt-1">
                          <span className="font-medium">{req.startDate}</span> to <span className="font-medium">{req.endDate}</span>
                          <span className="ml-2 text-xs bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                            {calculateDays(req.startDate, req.endDate)} day(s)
                          </span>
                        </p>
                      </div>

                      {/* Status Badges */}
                      <div>
                        {req.status === 'Approved' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                            Approved
                          </span>
                        )}
                        {req.status === 'Pending' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            Pending
                          </span>
                        )}
                        {req.status === 'Rejected' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                            Rejected
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 text-sm text-slate-600 bg-white p-2.5 rounded border border-slate-100">
                      <span className="font-medium text-xs block text-slate-400 uppercase tracking-wider mb-1">Reason</span>
                      {req.reason}
                    </div>

                    {/* Reviewer Section if reviewed */}
                    {req.reviewedBy && (
                      <div className="mt-3 pt-3 border-t border-slate-200/60 text-xs text-slate-500 flex flex-col gap-1">
                        <div>
                          Reviewed by: <span className="font-semibold text-slate-700">{req.reviewedBy}</span>
                        </div>
                        {req.reviewComment && (
                          <div className="italic text-slate-600 bg-indigo-50/50 p-2 rounded">
                            &ldquo;{req.reviewComment}&rdquo;
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
