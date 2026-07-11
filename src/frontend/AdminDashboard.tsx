import React, { useState, useMemo } from 'react';
import { LeaveAnalytics, LeaveReportItem, SystemConfig } from './types';

// Mock Initial Data for Demonstration and Production Fallback
const initialAnalytics: LeaveAnalytics = {
  totalRequests: 142,
  approvedRequests: 118,
  pendingRequests: 16,
  rejectedRequests: 8,
  utilizationRate: 14.5,
  departmentBreakdown: [
    { department: 'Engineering', takenDays: 145, activeLeaves: 3 },
    { department: 'Product & Design', takenDays: 62, activeLeaves: 1 },
    { department: 'Sales & Marketing', takenDays: 88, activeLeaves: 4 },
    { department: 'Operations & HR', takenDays: 40, activeLeaves: 2 },
  ],
};

const initialReports: LeaveReportItem[] = [
  { id: '1', employeeName: 'Sarah Jenkins', department: 'Engineering', leaveType: 'Vacation', startDate: '2023-11-20', endDate: '2023-11-24', durationDays: 5, status: 'Approved' },
  { id: '2', employeeName: 'Michael Chen', department: 'Engineering', leaveType: 'Sick', startDate: '2023-11-15', endDate: '2023-11-16', durationDays: 2, status: 'Approved' },
  { id: '3', employeeName: 'Amira Patel', department: 'Product & Design', leaveType: 'Maternity/Paternity', startDate: '2023-12-01', endDate: '2024-02-23', durationDays: 60, status: 'Pending' },
  { id: '4', employeeName: 'James Wilson', department: 'Sales & Marketing', leaveType: 'Personal', startDate: '2023-11-22', endDate: '2023-11-22', durationDays: 1, status: 'Pending' },
  { id: '5', employeeName: 'Elena Rostova', department: 'Operations & HR', leaveType: 'Vacation', startDate: '2023-12-18', endDate: '2023-12-29', durationDays: 10, status: 'Approved' },
  { id: '6', employeeName: 'David Kim', department: 'Engineering', leaveType: 'Bereavement', startDate: '2023-11-10', endDate: '2023-11-13', durationDays: 3, status: 'Rejected' },
];

const defaultConfig: SystemConfig = {
  allowAutoApproval: false,
  maxConsecutiveDays: 15,
  carryOverDaysLimit: 5,
  notifyHRThresholdDays: 10,
  blackoutDates: ['2023-12-25', '2024-01-01'],
};

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'reports' | 'config'>('analytics');
  const [reports, setReports] = useState<LeaveReportItem[]>(initialReports);
  const [config, setConfig] = useState<SystemConfig>(defaultConfig);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Handle Config Form Submission
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('Saving changes...');
    setTimeout(() => {
      setSaveStatus('Configuration updated successfully!');
      setTimeout(() => setSaveStatus(null), 3000);
    }, 800);
  };

  // Filtered reports computed on dependencies change
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesStatus = statusFilter === 'All' || report.status === statusFilter;
      const matchesSearch = report.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            report.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            report.leaveType.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [reports, statusFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Top Banner / Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Ceil HR Portal</h1>
              <p className="text-xs text-gray-500">Admin Dashboard & System Reporting</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              HR Admin Active
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'analytics'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Analytics Overview
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'reports'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Leave Reports
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'config'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Policy Configurations
            </button>
          </nav>
        </div>

        {/* Tab content: Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-8 animate-fade-in">
            {/* High Level Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-sm font-medium text-gray-500">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{initialAnalytics.totalRequests}</p>
                <span className="text-xs text-green-600 font-medium flex items-center mt-2">
                  +12% vs last month
                </span>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-sm font-medium text-gray-500">Approved Requests</p>
                <p className="text-2xl font-bold text-green-600 mt-2">{initialAnalytics.approvedRequests}</p>
                <span className="text-xs text-gray-400 mt-2 block">83.1% approval rate</span>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-sm font-medium text-gray-500">Pending Review</p>
                <p className="text-2xl font-bold text-amber-500 mt-2">{initialAnalytics.pendingRequests}</p>
                <span className="text-xs text-amber-600 font-medium mt-2 block">Requires attention</span>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-sm font-medium text-gray-500">Active Team Utilization</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">{initialAnalytics.utilizationRate}%</p>
                <span className="text-xs text-gray-400 mt-2 block">Currently on leave today</span>
              </div>
            </div>

            {/* Visual breakdown and insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Departmental Leave Activity</h3>
                <div className="space-y-4">
                  {initialAnalytics.departmentBreakdown.map((dept, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">{dept.department}</span>
                        <span className="text-gray-500">{dept.takenDays} days taken · {dept.activeLeaves} active</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${Math.min(100, (dept.takenDays / 200) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">HR Insights</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    System heuristics suggest high leave density expected mid-December. Ensure blackout policies or coverage plans are active.
                  </p>
                </div>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0118 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-xs text-blue-700 font-medium">
                        Auto-approval rule is currently OFF. 16 requests are awaiting manual escalation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab content: Reports Table */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-fade-in">
            {/* Filters bar */}
            <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gray-50">
              <div className="flex flex-1 gap-4 max-w-md">
                <input
                  type="text"
                  placeholder="Search employee, department, leave..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                />
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="All">All Statuses</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Table layout */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Leave Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Dates</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReports.length > 0 ? (
                    filteredReports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{report.employeeName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.department}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{report.leaveType}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {report.startDate} to {report.endDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{report.durationDays} days</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            report.status === 'Approved'
                              ? 'bg-green-100 text-green-800'
                              : report.status === 'Pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {report.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500 text-sm">
                        No leave reports found matching criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab content: Configuration Form */}
        {activeTab === 'config' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm max-w-3xl mx-auto animate-fade-in">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">System Policy Configuration</h3>
              <p className="text-sm text-gray-500">Manage boundaries, limits, and automated logic for global leave handling.</p>
            </div>
            <form onSubmit={handleSaveConfig} className="p-6 space-y-6">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="allowAutoApproval"
                    type="checkbox"
                    checked={config.allowAutoApproval}
                    onChange={(e) => setConfig({ ...config, allowAutoApproval: e.target.checked })}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="allowAutoApproval" className="font-medium text-gray-700">Enable Automated Leave Approvals</label>
                  <p className="text-gray-500">Automatically approve leave requests under threshold values if no conflict exists.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Maximum Consecutive Leave Days</label>
                  <input
                    type="number"
                    value={config.maxConsecutiveDays}
                    onChange={(e) => setConfig({ ...config, maxConsecutiveDays: parseInt(e.target.value) || 0 })}
                    className="mt-1 block w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">Flag requests exceeding this duration for direct leadership review.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Annual Carry-Over Days Limit</label>
                  <input
                    type="number"
                    value={config.carryOverDaysLimit}
                    onChange={(e) => setConfig({ ...config, carryOverDaysLimit: parseInt(e.target.value) || 0 })}
                    className="mt-1 block w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">Maximum unused PTO days that can be rolled over to the next fiscal period.</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6 flex items-center justify-between">
                <div>
                  {saveStatus && (
                    <span className={`text-sm font-medium ${saveStatus.includes('success') ? 'text-green-600' : 'text-gray-500'}`}>
                      {saveStatus}
                    </span>
                  )}
                </div>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2.5 px-5 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Save Policy Changes
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};
