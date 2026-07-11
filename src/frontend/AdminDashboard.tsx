import React, { useState, useMemo } from 'react';
import { LeaveRequest, DepartmentMetric, GlobalConfig } from './types';

// Mock Initial Data
const initialRequests: LeaveRequest[] = [
  { id: '1', employeeName: 'Sarah Connor', department: 'Engineering', leaveType: 'Annual', startDate: '2023-11-01', endDate: '2023-11-05', days: 5, status: 'Approved' },
  { id: '2', employeeName: 'John Doe', department: 'Product', leaveType: 'Sick', startDate: '2023-11-03', endDate: '2023-11-04', days: 2, status: 'Approved' },
  { id: '3', employeeName: 'Ellen Ripley', department: 'Operations', leaveType: 'Maternity/Paternity', startDate: '2023-12-01', endDate: '2024-02-28', days: 90, status: 'Pending' },
  { id: '4', employeeName: 'Marcus Wright', department: 'Engineering', leaveType: 'Unpaid', startDate: '2023-11-15', endDate: '2023-11-20', days: 5, status: 'Pending' },
  { id: '5', employeeName: 'Peter Parker', department: 'Marketing', leaveType: 'Annual', startDate: '2023-12-20', endDate: '2024-01-02', days: 13, status: 'Approved' },
];

const initialConfig: GlobalConfig = {
  defaultAnnualAllowance: 25,
  maxCarryOverDays: 5,
  allowNegativeBalance: false,
  autoApproveSickLeave: true,
  blackoutPeriods: [
    { id: 'b1', name: 'Q4 Code Freeze', startDate: '2023-12-15', endDate: '2024-01-05' }
  ]
};

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'reports' | 'config'>('analytics');
  const [requests, setRequests] = useState<LeaveRequest[]>(initialRequests);
  const [config, setConfig] = useState<GlobalConfig>(initialConfig);

  // Filter states for Reports
  const [deptFilter, setDeptFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // State for adding blackout periods
  const [newBlackout, setNewBlackout] = useState({ name: '', startDate: '', endDate: '' });

  // Analytics Calculations
  const metrics = useMemo(() => {
    const totalApproved = requests
      .filter(r => r.status === 'Approved')
      .reduce((sum, r) => sum + r.days, 0);

    const totalPending = requests
      .filter(r => r.status === 'Pending')
      .reduce((sum, r) => sum + r.days, 0);

    const deptMap: Record<string, DepartmentMetric> = {};
    requests.forEach(r => {
      if (!deptMap[r.department]) {
        deptMap[r.department] = { department: r.department, approvedDays: 0, pendingRequests: 0, headcount: 10 };
      }
      if (r.status === 'Approved') {
        deptMap[r.department].approvedDays += r.days;
      } else if (r.status === 'Pending') {
        deptMap[r.department].pendingRequests += 1;
      }
    });

    return {
      totalApproved,
      totalPending,
      deptMetrics: Object.values(deptMap)
    };
  }, [requests]);

  // Filtered Requests for Report Tab
  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      const matchDept = deptFilter === 'All' || r.department === deptFilter;
      const matchStatus = statusFilter === 'All' || r.status === statusFilter;
      return matchDept && matchStatus;
    });
  }, [requests, deptFilter, statusFilter]);

  // Handlers
  const handleStatusChange = (id: string, newStatus: 'Approved' | 'Rejected') => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  const handleAddBlackout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlackout.name || !newBlackout.startDate || !newBlackout.endDate) return;
    setConfig(prev => ({
      ...prev,
      blackoutPeriods: [
        ...prev.blackoutPeriods,
        { id: Date.now().toString(), ...newBlackout }
      ]
    }));
    setNewBlackout({ name: '', startDate: '', endDate: '' });
  };

  const handleRemoveBlackout = (id: string) => {
    setConfig(prev => ({
      ...prev,
      blackoutPeriods: prev.blackoutPeriods.filter(b => b.id !== id)
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Dashboard Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Reporting Dashboard</h1>
            <p className="text-sm text-slate-500">Consolidated leave management, tracking, and global policy configurations.</p>
          </div>
          <div className="flex space-x-2 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'analytics' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'reports' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Detailed Reports
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'config' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Global Config
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab 1: Analytics Overview */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Approved Leave Days</p>
                <p className="text-4xl font-extrabold text-blue-600 mt-2">{metrics.totalApproved} Days</p>
                <p className="text-xs text-slate-400 mt-1">Across all active departments</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Pending Leave Requests</p>
                <p className="text-4xl font-extrabold text-amber-500 mt-2">{metrics.totalPending} Days</p>
                <p className="text-xs text-slate-400 mt-1">Awaiting immediate leadership review</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Active Configured Policy</p>
                <p className="text-4xl font-extrabold text-emerald-600 mt-2">{config.defaultAnnualAllowance} Days</p>
                <p className="text-xs text-slate-400 mt-1">Default annual allowance per employee</p>
              </div>
            </div>

            {/* Department Breakdown Bar Chart */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Approved Leave Days by Department</h3>
              <div className="space-y-4">
                {metrics.deptMetrics.map(dept => {
                  const maxDays = Math.max(...metrics.deptMetrics.map(d => d.approvedDays), 1);
                  const widthPercent = (dept.approvedDays / maxDays) * 100;
                  return (
                    <div key={dept.department} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-slate-700">{dept.department}</span>
                        <span className="font-semibold text-slate-900">{dept.approvedDays} Days</span>
                      </div>
                      <div className="w-full bg-slate-100 h-6 rounded-full overflow-hidden flex">
                        <div
                          style={{ width: `${widthPercent}%` }}
                          className="bg-blue-500 h-full rounded-full transition-all duration-500 ease-out"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Detailed Reports & Review */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Filters Bar */}
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Department</label>
                  <select
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                    className="border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="All">All Departments</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Product">Product</option>
                    <option value="Operations">Operations</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <button
                onClick={() => alert('Exporting report as CSV (Mock action)')}
                className="self-end sm:self-auto bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors shadow-sm"
              >
                Export Report (CSV)
              </button>
            </div>

            {/* Requests Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                    <th className="p-4">Employee</th>
                    <th className="p-4">Department</th>
                    <th className="p-4">Leave Type</th>
                    <th className="p-4">Dates</th>
                    <th className="p-4">Days</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">No records matched your criteria.</td>
                    </tr>
                  ) : (
                    filteredRequests.map(req => (
                      <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-semibold text-slate-900">{req.employeeName}</td>
                        <td className="p-4 text-slate-600">{req.department}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
                            {req.leaveType}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500">{req.startDate} to {req.endDate}</td>
                        <td className="p-4 font-medium text-slate-900">{req.days} days</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            req.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            req.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          {req.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(req.id, 'Approved')}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleStatusChange(req.id, 'Rejected')}
                                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Global Configuration Settings */}
        {activeTab === 'config' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Policy Form */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Global Policy Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Default Annual Leave Allowance (Days)</label>
                  <input
                    type="number"
                    value={config.defaultAnnualAllowance}
                    onChange={(e) => setConfig({ ...config, defaultAnnualAllowance: parseInt(e.target.value) || 0 })}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Max Carry-over Days (per year)</label>
                  <input
                    type="number"
                    value={config.maxCarryOverDays}
                    onChange={(e) => setConfig({ ...config, maxCarryOverDays: parseInt(e.target.value) || 0 })}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.allowNegativeBalance}
                    onChange={(e) => setConfig({ ...config, allowNegativeBalance: e.target.checked })}
                    className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-semibold text-slate-800 block">Allow Negative Leave Balance</span>
                    <span className="text-xs text-slate-500">Employees can request leave exceeding their remaining accrued balance.</span>
                  </div>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.autoApproveSickLeave}
                    onChange={(e) => setConfig({ ...config, autoApproveSickLeave: e.target.checked })}
                    className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-semibold text-slate-800 block">Auto-Approve Sick Leave</span>
                    <span className="text-xs text-slate-500">Bypass manual approval flows automatically for self-certified sick leave.</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Blackout Dates / Periods Management */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Blackout Periods</h3>
                <p className="text-xs text-slate-500">Prevent leave requests during critical business cycles.</p>
              </div>

              {/* Current Blackout Periods */}
              <div className="space-y-3">
                {config.blackoutPeriods.map(b => (
                  <div key={b.id} className="flex items-center justify-between p-3 bg-rose-50 border border-rose-100 rounded-lg">
                    <div>
                      <p className="text-sm font-semibold text-rose-900">{b.name}</p>
                      <p className="text-xs text-rose-700">{b.startDate} to {b.endDate}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveBlackout(b.id)}
                      className="text-rose-600 hover:text-rose-800 text-xs font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Blackout Period Form */}
              <form onSubmit={handleAddBlackout} className="pt-4 border-t border-slate-100 space-y-3">
                <p className="text-xs font-semibold text-slate-600 uppercase">Add Blackout Period</p>
                <input
                  type="text"
                  placeholder="Period Name (e.g. Black Friday)"
                  value={newBlackout.name}
                  onChange={(e) => setNewBlackout({ ...newBlackout, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={newBlackout.startDate}
                    onChange={(e) => setNewBlackout({ ...newBlackout, startDate: e.target.value })}
                    className="border border-slate-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="date"
                    value={newBlackout.endDate}
                    onChange={(e) => setNewBlackout({ ...newBlackout, endDate: e.target.value })}
                    className="border border-slate-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold py-2 rounded transition-colors"
                >
                  Add Period
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
