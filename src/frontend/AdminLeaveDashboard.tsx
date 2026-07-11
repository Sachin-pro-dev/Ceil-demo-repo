import React, { useState, useMemo } from 'react';
import { LeaveRequest, LeaveStatus, LeaveType } from './types';

// Comprehensive mock data representing a real-world organization state
const INITIAL_REQUESTS: LeaveRequest[] = [
  {
    id: 'LR-101',
    employeeName: 'Sarah Jenkins',
    employeeEmail: 'sarah.j@company.com',
    department: 'Engineering',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    leaveType: 'Vacation',
    startDate: '2024-11-10',
    endDate: '2024-11-17',
    totalDays: 5,
    reason: 'Annual family trip to Hawaii. All handovers scheduled with the platform team.',
    status: 'Pending',
    submissionDate: '2024-10-28'
  },
  {
    id: 'LR-102',
    employeeName: 'Michael Chen',
    employeeEmail: 'michael.c@company.com',
    department: 'Product',
    avatarUrl: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    leaveType: 'Sick',
    startDate: '2024-11-01',
    endDate: '2024-11-03',
    totalDays: 2,
    reason: 'Wisdom tooth extraction surgery and subsequent recovery period.',
    status: 'Pending',
    submissionDate: '2024-10-29'
  },
  {
    id: 'LR-103',
    employeeName: 'Alisha Patel',
    employeeEmail: 'alisha.p@company.com',
    department: 'Marketing',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    leaveType: 'Personal',
    startDate: '2024-11-12',
    endDate: '2024-11-12',
    totalDays: 1,
    reason: 'Attending to urgent personal family matter in the morning.',
    status: 'Pending',
    submissionDate: '2024-10-30'
  },
  {
    id: 'LR-104',
    employeeName: 'David Ross',
    employeeEmail: 'david.r@company.com',
    department: 'Sales',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    leaveType: 'Maternity/Paternity',
    startDate: '2024-12-01',
    endDate: '2024-12-15',
    totalDays: 10,
    reason: 'Paternity leave following the birth of our second child.',
    status: 'Pending',
    submissionDate: '2024-10-25'
  },
  {
    id: 'LR-105',
    employeeName: 'Elena Rostova',
    employeeEmail: 'elena.r@company.com',
    department: 'Engineering',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    leaveType: 'Vacation',
    startDate: '2024-11-20',
    endDate: '2024-11-24',
    totalDays: 3,
    reason: 'Extended weekend trip for Thanksgiving celebrations.',
    status: 'Approved',
    submissionDate: '2024-10-15',
    adminNotes: 'Approved automatically as coverage is sufficient.'
  }
];

export default function AdminLeaveDashboard() {
  const [requests, setRequests] = useState<LeaveRequest[]>(INITIAL_REQUESTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<LeaveStatus | 'All'>('Pending');
  const [activeRequest, setActiveRequest] = useState<LeaveRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Calculate statistics dynamically
  const stats = useMemo(() => {
    const pending = requests.filter(r => r.status === 'Pending').length;
    const approved = requests.filter(r => r.status === 'Approved').length;
    const rejected = requests.filter(r => r.status === 'Rejected').length;
    
    // Find most common leave type
    const counts: Record<string, number> = {};
    requests.forEach(r => counts[r.leaveType] = (counts[r.leaveType] || 0) + 1);
    const mostRequestedType = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, 'Vacation');

    return { totalPending: pending, totalApproved: approved, totalRejected: rejected, mostRequestedType };
  }, [requests]);

  // Filtered requests list
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const matchesSearch = req.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            req.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            req.leaveType.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = selectedDept === 'All' || req.department === selectedDept;
      const matchesStatus = selectedStatus === 'All' || req.status === selectedStatus;
      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [requests, searchTerm, selectedDept, selectedStatus]);

  const triggerToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Handle Approval
  const handleApprove = (id: string) => {
    setRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: 'Approved', adminNotes: adminNotes || 'Approved by Administrator' } : req
    ));
    const reqName = requests.find(r => r.id === id)?.employeeName;
    triggerToast(`Approved leave request for ${reqName}`);
    setActiveRequest(null);
    setAdminNotes('');
  };

  // Handle Rejection
  const handleReject = (id: string) => {
    setRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: 'Rejected', adminNotes: adminNotes || 'Rejected by Administrator' } : req
    ));
    const reqName = requests.find(r => r.id === id)?.employeeName;
    triggerToast(`Rejected leave request for ${reqName}`, 'info');
    setActiveRequest(null);
    setAdminNotes('');
  };

  const uniqueDepartments = Array.from(new Set(requests.map(r => r.department)));

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Toast Notification */}
        {toast && (
          <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white transition-all transform duration-300 ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        )}

        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Leave Management</h1>
            <p className="text-sm text-slate-500 mt-1">Review, approve, and manage leave requests across the organization.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-400 bg-slate-200/60 px-3 py-1.5 rounded-full font-mono">
              System Status: Connected
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Pending Requests</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.totalPending}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Approved Requests</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.totalApproved}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Rejected Requests</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.totalRejected}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Top Leave Type</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.mostRequestedType}</h3>
            </div>
          </div>
        </div>

        {/* Filters and Controls Card */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-1/3 relative">
            <input
              type="text"
              placeholder="Search employee, dept, type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            <svg className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            <div>
              <label className="block text-xs text-slate-400 font-medium mb-1">Department</label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="All">All Departments</option>
                {uniqueDepartments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 font-medium mb-1">Request Status</label>
              <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                {(['Pending', 'Approved', 'Rejected', 'All'] as const).map(statusOption => (
                  <button
                    key={statusOption}
                    onClick={() => setSelectedStatus(statusOption)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      selectedStatus === statusOption
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {statusOption}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Requests Table Board */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Leave Type</th>
                  <th className="px-6 py-4">Duration & Dates</th>
                  <th className="px-6 py-4">Submission Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          {request.avatarUrl ? (
                            <img className="w-10 h-10 rounded-full object-cover" src={request.avatarUrl} alt={request.employeeName} />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700">
                              {request.employeeName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-slate-900">{request.employeeName}</div>
                            <div className="text-xs text-slate-400">{request.department}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          request.leaveType === 'Sick' ? 'bg-rose-50 text-rose-700' :
                          request.leaveType === 'Vacation' ? 'bg-indigo-50 text-indigo-700' :
                          request.leaveType === 'Personal' ? 'bg-amber-50 text-amber-700' :
                          'bg-sky-50 text-sky-700'
                        }`}>
                          {request.leaveType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{request.totalDays} {request.totalDays === 1 ? 'Day' : 'Days'}</div>
                        <div className="text-xs text-slate-400">{request.startDate} to {request.endDate}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {request.submissionDate}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${
                          request.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                          request.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            request.status === 'Pending' ? 'bg-amber-500' :
                            request.status === 'Approved' ? 'bg-emerald-500' :
                            'bg-rose-500'
                          }`} />
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {request.status === 'Pending' ? (
                            <>
                              <button
                                onClick={() => {
                                  setActiveRequest(request);
                                  setAdminNotes('');
                                }}
                                className="px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg border border-indigo-200 transition-colors"
                              >
                                Review
                              </button>
                              <button
                                onClick={() => handleApprove(request.id)}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Approve Immediately"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => {
                                setActiveRequest(request);
                                setAdminNotes(request.adminNotes || '');
                              }}
                              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              View details
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      No leave requests match your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Review Modal Drawer */}
        {activeRequest && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Review Leave Request</h3>
                <button
                  onClick={() => setActiveRequest(null)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl">
                  {activeRequest.avatarUrl ? (
                    <img className="w-12 h-12 rounded-full object-cover" src={activeRequest.avatarUrl} alt={activeRequest.employeeName} />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700">
                      {activeRequest.employeeName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-slate-900">{activeRequest.employeeName}</div>
                    <div className="text-xs text-slate-500">{activeRequest.employeeEmail} • {activeRequest.department}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="block text-xs text-slate-400 font-medium uppercase">Leave Type</span>
                    <span className="font-semibold text-slate-800">{activeRequest.leaveType}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-400 font-medium uppercase">Duration</span>
                    <span className="font-semibold text-slate-800">{activeRequest.totalDays} Days</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-xs text-slate-400 font-medium uppercase">Dates</span>
                    <span className="font-medium text-slate-800">{activeRequest.startDate} to {activeRequest.endDate}</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <span className="block text-xs text-slate-400 font-medium uppercase mb-1">Reason for Leave</span>
                  <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                    "{activeRequest.reason}"
                  </p>
                </div>

                {activeRequest.status === 'Pending' ? (
                  <div className="space-y-2">
                    <label className="block text-xs text-slate-400 font-semibold uppercase">Admin Decision Notes</label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Provide details or reason for approval/rejection..."
                      rows={3}
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                ) : (
                  <div className="border-t border-slate-100 pt-3">
                    <span className="block text-xs text-slate-400 font-medium uppercase mb-1">Admin Resolution Note</span>
                    <p className="text-sm text-slate-800 font-medium">
                      {activeRequest.adminNotes || 'No notes provided.'}
                    </p>
                  </div>
                )}
              </div>

              {activeRequest.status === 'Pending' && (
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-3">
                  <button
                    onClick={() => handleReject(activeRequest.id)}
                    className="px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-100/50 rounded-lg transition-colors"
                  >
                    Reject Request
                  </button>
                  <button
                    onClick={() => handleApprove(activeRequest.id)}
                    className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
                  >
                    Approve Request
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
