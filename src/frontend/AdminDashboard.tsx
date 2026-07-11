import React, { useState, useMemo } from 'react';
import { LeaveRequest, DashboardStats, LeaveStatus } from './types';
import { initialLeaveRequests } from './mockData';

export const AdminDashboard: React.FC = () => {
  const [requests, setRequests] = useState<LeaveRequest[]>(initialLeaveRequests);
  const [filterDepartment, setFilterDepartment] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Calculate statistics dynamically based on current list
  const stats = useMemo<DashboardStats>(() => {
    return requests.reduce(
      (acc, curr) => {
        if (curr.status === 'Pending') acc.pendingCount++;
        if (curr.status === 'Approved') acc.approvedCount++;
        if (curr.status === 'Rejected') acc.rejectedCount++;
        acc.totalDaysRequested += curr.totalDays;
        return acc;
      },
      { pendingCount: 0, approvedCount: 0, rejectedCount: 0, totalDaysRequested: 0 }
    );
  }, [requests]);

  // Get unique departments for filtering
  const departments = useMemo<string[]>(() => {
    const depts = new Set(requests.map((r) => r.department));
    return ['All', ...Array.from(depts)];
  }, [requests]);

  // Distribution of requests by department for visual analytics
  const departmentStats = useMemo(() => {
    const counts: { [key: string]: number } = {};
    requests.forEach((r) => {
      counts[r.department] = (counts[r.department] || 0) + 1;
    });
    return counts;
  }, [requests]);

  // Filter and search logic
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchesDept = filterDepartment === 'All' || req.department === filterDepartment;
      const matchesSearch =
        req.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesDept && matchesSearch;
    });
  }, [requests, filterDepartment, searchTerm]);

  // Action handler to approve or reject requests
  const handleProcessRequest = (id: string, newStatus: 'Approved' | 'Rejected') => {
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: newStatus } : req))
    );
    
    const requestDetails = requests.find(r => r.id === id);
    if (requestDetails) {
      showNotification(
        `Successfully ${newStatus.toLowerCase()} leave request for ${requestDetails.employeeName}.`,
        'success'
      );
    }
    setSelectedRequest(null);
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans p-6">
      {/* Top Header Banner */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Leave Administration Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor employee leave requests, approve pending items, and analyze department distributions.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <span className="w-2 h-2 mr-1.5 bg-indigo-500 rounded-full animate-ping"></span>
            Live Admin Sync
          </span>
        </div>
      </header>

      {/* Toast Notification Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg shadow-lg border text-sm transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <span className="font-semibold mr-2">Notification:</span>
          {notification.message}
        </div>
      )}

      {/* Overview Stat Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow transition-shadow">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pending Approvals</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-600">{stats.pendingCount}</span>
            <span className="text-xs text-amber-500 font-medium bg-amber-50 px-2 py-0.5 rounded">Awaiting Action</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow transition-shadow">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Approved Requests</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-600">{stats.approvedCount}</span>
            <span className="text-xs text-emerald-500 font-medium bg-emerald-50 px-2 py-0.5 rounded">Completed</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow transition-shadow">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Rejected Requests</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-rose-600">{stats.rejectedCount}</span>
            <span className="text-xs text-rose-500 font-medium bg-rose-50 px-2 py-0.5 rounded">Denied</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow transition-shadow">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Days Counted</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-indigo-700">{stats.totalDaysRequested}</span>
            <span className="text-xs text-indigo-500 font-medium bg-indigo-50 px-2 py-0.5 rounded">All Time</span>
          </div>
        </div>
      </section>

      {/* Dashboard Analytics & Main Content split screen */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Controls & Visualizations */}
        <div className="lg:col-span-1 space-y-6">
          {/* Filters card */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Search & Filter</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Search Employee</label>
                <input
                  type="text"
                  placeholder="Search name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Filter Department</label>
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Department distribution visualization */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Department Breakdown</h2>
            <p className="text-xs text-gray-400 mb-4">Distribution of total requests across departments.</p>
            <div className="space-y-3">
              {Object.entries(departmentStats).map(([dept, count]) => {
                const percentage = Math.round((count / requests.length) * 100);
                return (
                  <div key={dept} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-gray-700">{dept}</span>
                      <span className="text-gray-500">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column: Interactive Table / Pending approvals */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Leave Requests</h2>
                <p className="text-xs text-gray-400 mt-0.5">Manage active applications and review past requests.</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">
                Showing {filteredRequests.length} of {requests.length}
              </span>
            </div>

            {/* Table layout */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
                    <th className="p-4">Employee</th>
                    <th className="p-4">Department</th>
                    <th className="p-4">Leave Details</th>
                    <th className="p-4">Duration</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-400">
                        No leave requests found matching the filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <div className="font-semibold text-gray-900">{req.employeeName}</div>
                          <div className="text-xs text-gray-400">ID: {req.id}</div>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md">
                            {req.department}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-gray-800">{req.leaveType}</div>
                          <div className="text-xs text-gray-500 truncate max-w-[180px]" title={req.reason}>
                            {req.reason}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-gray-900 font-medium">{req.totalDays} {req.totalDays === 1 ? 'day' : 'days'}</div>
                          <div className="text-xs text-gray-400">{req.startDate} to {req.endDate}</div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            req.status === 'Approved' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : req.status === 'Rejected'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {req.status === 'Pending' ? ( 
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleProcessRequest(req.id, 'Approved')}
                                className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded shadow-sm transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleProcessRequest(req.id, 'Rejected')}
                                className="px-2.5 py-1 text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setSelectedRequest(req)}
                              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline"
                            >
                              View Details
                            </button>
                          )}
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

      {/* Leave Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Leave Request Details</h3>
                <p className="text-xs text-gray-400 mt-0.5">ID: {selectedRequest.id}</p>
              </div>
              <button 
                onClick={() => setSelectedRequest(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs font-semibold text-gray-400 uppercase">Employee</span>
                  <span className="text-sm font-bold text-gray-800">{selectedRequest.employeeName}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-400 uppercase">Department</span>
                  <span className="text-sm font-medium text-gray-800">{selectedRequest.department}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs font-semibold text-gray-400 uppercase">Leave Type</span>
                  <span className="text-sm font-semibold text-indigo-600">{selectedRequest.leaveType}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-400 uppercase">Total Days</span>
                  <span className="text-sm font-medium text-gray-800">{selectedRequest.totalDays} Days</span>
                </div>
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-400 uppercase">Duration</span>
                <span className="text-sm text-gray-800 font-medium">{selectedRequest.startDate} to {selectedRequest.endDate}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-400 uppercase">Reason</span>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 mt-1 italic">
                  "{selectedRequest.reason}"
                </p>
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-400 uppercase">Current Status</span>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold mt-1.5 ${
                  selectedRequest.status === 'Approved' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : selectedRequest.status === 'Rejected'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {selectedRequest.status}
                </span>
              </div>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 text-xs font-semibold bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
              >
                Close
              </button>
              {selectedRequest.status === 'Pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleProcessRequest(selectedRequest.id, 'Rejected')}
                    className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleProcessRequest(selectedRequest.id, 'Approved')}
                    className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                  >
                    Approve
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
