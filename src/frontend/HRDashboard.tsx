import React, { useState, useMemo } from 'react';
import { LeavePolicy, LeaveRequest, AnalyticsSummary } from './types';

// Mock Initial Data
const initialPolicies: LeavePolicy[] = [
  { id: '1', name: 'Annual Leave', type: 'paid', daysAllowed: 25, accrualRate: 'yearly', carryOverMax: 5, status: 'active' },
  { id: '2', name: 'Sick Leave', type: 'paid', daysAllowed: 10, accrualRate: 'monthly', carryOverMax: 0, status: 'active' },
  { id: '3', name: 'Maternity/Paternity Leave', type: 'paid', daysAllowed: 90, accrualRate: 'yearly', carryOverMax: 0, status: 'active' },
  { id: '4', name: 'Unpaid Sabbatical', type: 'unpaid', daysAllowed: 30, accrualRate: 'yearly', carryOverMax: 0, status: 'inactive' },
];

const initialRequests: LeaveRequest[] = [
  { id: '101', employeeName: 'Sarah Jenkins', department: 'Engineering', policyType: 'Annual Leave', startDate: '2023-11-10', endDate: '2023-11-17', daysCount: 5, status: 'pending', reason: 'Family vacation' },
  { id: '102', employeeName: 'Michael Chen', department: 'Marketing', policyType: 'Sick Leave', startDate: '2023-11-05', endDate: '2023-11-06', daysCount: 1, status: 'approved', reason: 'Dental checkup' },
  { id: '103', employeeName: 'Amara Okafor', department: 'Product', policyType: 'Annual Leave', startDate: '2023-12-20', endDate: '2024-01-03', daysCount: 10, status: 'pending', reason: 'Winter holidays' },
  { id: '104', employeeName: 'David Miller', department: 'Sales', policyType: 'Maternity/Paternity Leave', startDate: '2023-11-15', endDate: '2023-12-15', daysCount: 20, status: 'pending', reason: 'Newborn bonding leave' },
];

export default function HRDashboard() {
  const [policies, setPolicies] = useState<LeavePolicy[]>(initialPolicies);
  const [requests, setRequests] = useState<LeaveRequest[]>(initialRequests);
  const [activeTab, setActiveTab] = useState<'analytics' | 'policies' | 'requests'>('analytics');
  
  // Notification state
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form State for New Policy
  const [isAddingPolicy, setIsAddingPolicy] = useState(false);
  const [newPolicy, setNewPolicy] = useState<Omit<LeavePolicy, 'id'>>({
    name: '',
    type: 'paid',
    daysAllowed: 15,
    accrualRate: 'yearly',
    carryOverMax: 5,
    status: 'active'
  });

  // Calculate live analytics
  const analytics = useMemo((): AnalyticsSummary => {
    const pendingCount = requests.filter(r => r.status === 'pending').length;
    const approvedCount = requests.filter(r => r.status === 'approved').length;
    return {
      totalEmployees: 142,
      onLeaveToday: 8,
      pendingApprovals: pendingCount,
      utilizationRate: Math.round((approvedCount / (requests.length || 1)) * 100)
    };
  }, [requests]);

  const triggerNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Handle Request Status Change
  const handleRequestAction = (id: string, action: 'approved' | 'rejected') => {
    setRequests(prev =>
      prev.map(req => (req.id === id ? { ...req, status: action } : req))
    );
    triggerNotification(`Request successfully ${action}.`, 'success');
  };

  // Handle Policy Submission
  const handleAddPolicy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPolicy.name.trim()) {
      triggerNotification('Policy name cannot be empty', 'error');
      return;
    }
    const policyToAdd: LeavePolicy = {
      ...newPolicy,
      id: Date.now().toString()
    };
    setPolicies(prev => [...prev, policyToAdd]);
    setIsAddingPolicy(false);
    setNewPolicy({ name: '', type: 'paid', daysAllowed: 15, accrualRate: 'yearly', carryOverMax: 5, status: 'active' });
    triggerNotification('New leave policy created successfully!', 'success');
  };

  // Toggle Policy Status
  const togglePolicyStatus = (id: string) => {
    setPolicies(prev =>
      prev.map(p => (p.id === id ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' } : p))
    );
    triggerNotification('Policy status updated.', 'success');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">HR Admin Dashboard</h1>
            <p className="text-sm text-gray-500">Centralized leave management, policy builder, and organization analytics</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              <span className="w-2 h-2 mr-1.5 bg-indigo-600 rounded-full animate-pulse"></span>
              Live Sync Enabled
            </span>
          </div>
        </div>
      </header>

      {/* Notification Banner */}
      {notification && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className={`p-4 rounded-md shadow-sm flex items-center justify-between transition-all duration-300 ${
            notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500' : 'bg-rose-50 text-rose-800 border-l-4 border-rose-500'
          }`}>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {notification.type === 'success' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
              <span className="text-sm font-medium">{notification.message}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-gray-400 hover:text-gray-600">
              <span className="text-lg">&times;</span>
            </button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors duration-150 ${
              activeTab === 'analytics'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Analytics & Overview
          </button>
          <button
            onClick={() => setActiveTab('policies')}
            className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors duration-150 ${
              activeTab === 'policies'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Policy Configuration
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors duration-150 relative ${
              activeTab === 'requests'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Leave Requests Queue
            {analytics.pendingApprovals > 0 && (
              <span className="absolute right-0 top-3 inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold leading-none text-white bg-amber-500 rounded-full">
                {analytics.pendingApprovals}
              </span>
            )}
          </button>
        </div>

        {/* TAB CONTENT: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* Analytics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Employees</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.totalEmployees}</p>
                <span className="text-xs text-emerald-600 flex items-center mt-2">
                  <span className="mr-1">↑</span> 4% since last month
                </span>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Out Today</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.onLeaveToday}</p>
                <span className="text-xs text-gray-500 flex items-center mt-2">
                  Across 3 departments
                </span>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pending Approvals</p>
                <p className={`text-3xl font-bold mt-2 ${analytics.pendingApprovals > 0 ? 'text-amber-600' : 'text-gray-900'}`}>
                  {analytics.pendingApprovals}
                </p>
                <span className="text-xs text-gray-500 flex items-center mt-2">
                  Needs immediate response
                </span>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Utilization Rate</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.utilizationRate}%</p>
                <div className="w-full bg-gray-200 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-indigo-600 h-1.5" style={{ width: `${analytics.utilizationRate}%` }}></div>
                </div>
              </div>
            </div>

            {/* Secondary Analytics / Visual Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Leave Distribution Chart simulation */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm lg:col-span-2">
                <h3 className="text-md font-bold text-gray-900 mb-4">Leave Utilization by Policy Type</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span>Annual Leave</span>
                      <span>72% Utilized</span>
                    </div>
                    <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                      <div className="bg-teal-500 h-full" style={{ width: '72%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span>Sick Leave</span>
                      <span>28% Utilized</span>
                    </div>
                    <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full" style={{ width: '28%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span>Maternity/Paternity Leave</span>
                      <span>15% Utilized</span>
                    </div>
                    <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full" style={{ width: '15%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-md font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => { setActiveTab('policies'); setIsAddingPolicy(true); }}
                    className="w-full text-left px-4 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-sm font-semibold transition-colors flex items-center justify-between"
                  >
                    <span>Create New Policy</span>
                    <span>+</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('requests')}
                    className="w-full text-left px-4 py-3 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-sm font-semibold transition-colors flex items-center justify-between"
                  >
                    <span>View Pending Approvals</span>
                    <span className="bg-amber-200 text-amber-800 px-2 py-0.5 rounded text-xs">{analytics.pendingApprovals}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT: POLICIES */}
        {activeTab === 'policies' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Leave Policies</h2>
              <button
                onClick={() => setIsAddingPolicy(!isAddingPolicy)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
              >
                {isAddingPolicy ? 'Cancel' : '+ Add New Policy'}
              </button>
            </div>

            {/* Form to Add Policy */}
            {isAddingPolicy && (
              <form onSubmit={handleAddPolicy} className="bg-white p-6 rounded-xl border border-indigo-200 shadow-md space-y-4 max-w-2xl transition-all">
                <h3 className="text-md font-bold text-indigo-900">Create Leave Policy</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Policy Name</label>
                    <input
                      type="text"
                      value={newPolicy.name}
                      onChange={e => setNewPolicy({ ...newPolicy, name: e.target.value })}
                      placeholder="e.g. Wellness Leave"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Type</label>
                    <select
                      value={newPolicy.type}
                      onChange={e => setNewPolicy({ ...newPolicy, type: e.target.value as 'paid' | 'unpaid' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    >
                      <option value="paid">Paid</option>
                      <option value="unpaid">Unpaid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Days Allowed (Yearly)</label>
                    <input
                      type="number"
                      value={newPolicy.daysAllowed}
                      onChange={e => setNewPolicy({ ...newPolicy, daysAllowed: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Accrual Rate</label>
                    <select
                      value={newPolicy.accrualRate}
                      onChange={e => setNewPolicy({ ...newPolicy, accrualRate: e.target.value as 'yearly' | 'monthly' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    >
                      <option value="yearly">Yearly Accrual</option>
                      <option value="monthly">Monthly Accrual</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Max Carry-Over (Days)</label>
                    <input
                      type="number"
                      value={newPolicy.carryOverMax}
                      onChange={e => setNewPolicy({ ...newPolicy, carryOverMax: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingPolicy(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold"
                  >
                    Save Policy
                  </button>
                </div>
              </form>
            )}

            {/* Policies Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {policies.map(policy => (
                <div key={policy.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="text-md font-bold text-gray-900">{policy.name}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        policy.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {policy.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4 text-xs text-gray-600">
                      <div>
                        <p className="font-semibold">Type</p>
                        <p className="capitalize text-gray-900">{policy.type}</p>
                      </div>
                      <div>
                        <p className="font-semibold">Days Allowed</p>
                        <p className="text-gray-900">{policy.daysAllowed} days</p>
                      </div>
                      <div>
                        <p className="font-semibold">Accrual Rate</p>
                        <p className="capitalize text-gray-900">{policy.accrualRate}</p>
                      </div>
                      <div>
                        <p className="font-semibold">Carry Over Limit</p>
                        <p className="text-gray-900">{policy.carryOverMax} days</p>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 mt-6 pt-4 flex justify-end">
                    <button
                      onClick={() => togglePolicyStatus(policy.id)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                        policy.status === 'active'
                          ? 'border-gray-200 text-rose-600 hover:bg-rose-50'
                          : 'border-gray-200 text-emerald-600 hover:bg-emerald-50'
                      }`}
                    >
                      {policy.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB CONTENT: REQUESTS QUEUE */}
        {activeTab === 'requests' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Leave Requests Queue</h2>
              <span className="text-xs text-gray-500">Showing all recent activities</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 border-b border-gray-100">
                    <th className="p-4">Employee</th>
                    <th className="p-4">Leave Type</th>
                    <th className="p-4">Duration</th>
                    <th className="p-4">Reason</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {requests.map(request => (
                    <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="font-semibold text-gray-900">{request.employeeName}</div>
                        <div className="text-xs text-gray-400">{request.department}</div>
                      </td>
                      <td className="p-4 text-gray-600">{request.policyType}</td>
                      <td className="p-4">
                        <div className="text-gray-900">{request.daysCount} {request.daysCount === 1 ? 'day' : 'days'}</div>
                        <div className="text-xs text-gray-400">{request.startDate} to {request.endDate}</div>
                      </td>
                      <td className="p-4 text-gray-500 max-w-xs truncate" title={request.reason}>
                        {request.reason}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          request.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : request.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {request.status === 'pending' ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleRequestAction(request.id, 'rejected')}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs rounded-lg transition-colors"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleRequestAction(request.id, 'approved')}
                              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs rounded-lg transition-colors"
                            >
                              Approve
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Completed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
