import React, { useState, useEffect } from 'react';
import { LeaveStats, DepartmentReport, SystemConfig } from './types';

export const AdminDashboard: React.FC = () => {
  // Mock initial data
  const [stats, setStats] = useState<LeaveStats>({
    totalEmployees: 142,
    activeLeaves: 12,
    pendingApprovals: 8,
    carryoverDaysLimit: 5
  });

  const [reports, setReports] = useState<DepartmentReport[]>([
    { department: 'Engineering', takenDays: 145, allocatedDays: 300, pendingDays: 14 },
    { department: 'Product & Design', takenDays: 62, allocatedDays: 120, pendingDays: 4 },
    { department: 'Sales & Marketing', takenDays: 98, allocatedDays: 200, pendingDays: 8 },
    { department: 'Operations & HR', takenDays: 40, allocatedDays: 90, pendingDays: 2 }
  ]);

  const [config, setConfig] = useState<SystemConfig>({
    allowNegativeBalance: false,
    maxConsecutiveDays: 14,
    autoApproveSickLeave: true,
    fiscalYearStart: '2024-01-01',
    defaultAnnualAllowance: 25
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleConfigChange = <K extends keyof SystemConfig>(
    key: K,
    value: SystemConfig[K]
  ) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setSaveMessage('System configurations updated successfully!');
      setTimeout(() => setSaveMessage(''), 4000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Leave Dashboard</h1>
        <p className="text-sm text-gray-600">Manage global leave policies, system parameters, and view department metrics.</p>
      </header>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Employees</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-2">{stats.totalEmployees}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Leaves Today</p>
          <h3 className="text-2xl font-bold text-blue-600 mt-2">{stats.activeLeaves}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Approvals</p>
          <h3 className="text-2xl font-bold text-amber-500 mt-2">{stats.pendingApprovals}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Max Carryover Days</p>
          <h3 className="text-2xl font-bold text-purple-600 mt-2">{config.maxConsecutiveDays} Days</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Leave Reports Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Department Leave Overview</h2>
          <div className="space-y-6">
            {reports.map((report) => {
              const percentage = Math.round((report.takenDays / report.allocatedDays) * 100);
              return (
                <div key={report.department} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-gray-700">{report.department}</span>
                    <span className="text-gray-500">
                      {report.takenDays} / {report.allocatedDays} Days Taken ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Pending approvals: {report.pendingDays} days</span>
                    <span>Available: {report.allocatedDays - report.takenDays} days</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Configuration Panel */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Global Policy Settings</h2>
          <form onSubmit={handleSaveConfig} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Annual Leave (Days)
              </label>
              <input
                type="number"
                value={config.defaultAnnualAllowance}
                onChange={(e) => handleConfigChange('defaultAnnualAllowance', parseInt(e.target.value) || 0)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm p-2 border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Consecutive Leave Days
              </label>
              <input
                type="number"
                value={config.maxConsecutiveDays}
                onChange={(e) => handleConfigChange('maxConsecutiveDays', parseInt(e.target.value) || 0)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm p-2 border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fiscal Year Start Date
              </label>
              <input
                type="date"
                value={config.fiscalYearStart}
                onChange={(e) => handleConfigChange('fiscalYearStart', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm p-2 border"
              />
            </div>

            <div className="space-y-3 pt-2">
              <label className="relative flex items-start cursor-pointer">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={config.allowNegativeBalance}
                    onChange={(e) => handleConfigChange('allowNegativeBalance', e.target.checked)}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <span className="font-medium text-gray-700">Allow negative balance</span>
                  <p className="text-xs text-gray-500">Employees can request days beyond allocation.</p>
                </div>
              </label>

              <label className="relative flex items-start cursor-pointer">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={config.autoApproveSickLeave}
                    onChange={(e) => handleConfigChange('autoApproveSickLeave', e.target.checked)}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <span className="font-medium text-gray-700">Auto-approve sick leave</span>
                  <p className="text-xs text-gray-500">Bypasses manual manager approval flows.</p>
                </div>
              </label>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>

            {saveMessage && (
              <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded text-center">
                {saveMessage}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
