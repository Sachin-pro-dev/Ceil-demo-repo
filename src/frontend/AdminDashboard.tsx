import React, { useState } from 'react';
import { SubmissionData } from './EmployeeSubmissionPortal';

const INITIAL_SUBMISSIONS: SubmissionData[] = [
  {
    id: 'SUB-101',
    employeeName: 'Jane Doe',
    department: 'Engineering',
    taskTitle: 'Refactored Auth Pipeline',
    hoursSpent: 6,
    description: 'Migrated legacy session auth to JWT tokens and added comprehensive unit test suites.',
    status: 'Pending',
    submittedAt: '2023-10-25 09:30',
  },
  {
    id: 'SUB-102',
    employeeName: 'John Smith',
    department: 'Marketing',
    taskTitle: 'Q4 Campaign Strategy Planning',
    hoursSpent: 4,
    description: 'Drafted and aligned on the social media and ad budget for Q4 product launch.',
    status: 'Approved',
    submittedAt: '2023-10-24 14:15',
  },
  {
    id: 'SUB-103',
    employeeName: 'Alice Johnson',
    department: 'Product',
    taskTitle: 'User Feedback Analysis',
    hoursSpent: 8,
    description: 'Synthesized 150 customer interview responses into key feature requests.',
    status: 'Rejected',
    submittedAt: '2023-10-23 11:00',
  },
  {
    id: 'SUB-104',
    employeeName: 'Bob Vance',
    department: 'Engineering',
    taskTitle: 'Database Index Optimization',
    hoursSpent: 3.5,
    description: 'Added composite indexes to query paths on transaction tables, decreasing latency by 40%.',
    status: 'Pending',
    submittedAt: '2023-10-25 10:05',
  }
];

export const AdminDashboard: React.FC = () => {
  const [submissions, setSubmissions] = useState<SubmissionData[]>(INITIAL_SUBMISSIONS);
  const [filterDepartment, setFilterDepartment] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionData | null>(null);

  const handleStatusChange = (id: string, newStatus: 'Approved' | 'Rejected') => {
    setSubmissions((prev) =>
      prev.map((sub) => (sub.id === id ? { ...sub, status: newStatus } : sub))
    );
    if (selectedSubmission && selectedSubmission.id === id) {
      setSelectedSubmission((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const filteredSubmissions = submissions.filter((sub) => {
    const deptMatch = filterDepartment === 'All' || sub.department === filterDepartment;
    const statusMatch = filterStatus === 'All' || sub.status === filterStatus;
    return deptMatch && statusMatch;
  });

  // Metrics calculations
  const totalHours = filteredSubmissions.reduce((acc, sub) => acc + sub.hoursSpent, 0);
  const pendingCount = submissions.filter((sub) => sub.status === 'Pending').length;
  const approvedCount = submissions.filter((sub) => sub.status === 'Approved').length;

  return (
    <div className="max-w-6xl mx-auto my-8 p-6 bg-gray-50 rounded-xl border border-gray-200 min-h-screen">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Track, review, and oversee employee submissions and resource allocation.</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Submissions</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{submissions.length}</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Pending Review</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Approved Tasks</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{approvedCount}</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Filtered Tracked Hours</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{totalHours} hrs</p>
        </div>
      </div>

      {/* Filters and Search Control Hub */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Department</label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="p-2 border border-gray-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="All">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Product">Product</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="p-2 border border-gray-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          Showing {filteredSubmissions.length} of {submissions.length} records
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submissions List Table */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Task Info</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Hours</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredSubmissions.map((sub) => (
                  <tr
                    key={sub.id}
                    onClick={() => setSelectedSubmission(sub)}
                    className={`hover:bg-blue-50/50 cursor-pointer transition-colors ${
                      selectedSubmission?.id === sub.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{sub.employeeName}</div>
                      <div className="text-xs text-gray-400">{sub.department}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-medium truncate max-w-xs">{sub.taskTitle}</div>
                      <div className="text-xs text-gray-400">{sub.submittedAt}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">
                      {sub.hoursSpent} hrs
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                          sub.status === 'Approved'
                            ? 'bg-green-100 text-green-800'
                            : sub.status === 'Rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSubmission(sub);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-2"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredSubmissions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                      No submissions found matching the criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Details and Actions Sidebar */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 border-b pb-3 mb-4">Submission Detail Panel</h3>
          {selectedSubmission ? (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block">Employee</span>
                <p className="text-sm font-medium text-gray-800">{selectedSubmission.employeeName} ({selectedSubmission.department})</p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block">Submission ID & Date</span>
                <p className="text-sm text-gray-700">{selectedSubmission.id} - {selectedSubmission.submittedAt}</p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block">Task Title</span>
                <p className="text-sm font-medium text-gray-800">{selectedSubmission.taskTitle}</p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block">Hours Spent</span>
                <p className="text-sm font-semibold text-blue-600">{selectedSubmission.hoursSpent} hours</p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block">Description</span>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md border mt-1 leading-relaxed">
                  {selectedSubmission.description}
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-1.5">Current Status</span>
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-full ${
                    selectedSubmission.status === 'Approved'
                      ? 'bg-green-100 text-green-800'
                      : selectedSubmission.status === 'Rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {selectedSubmission.status}
                </span>
              </div>

              <div className="pt-4 border-t flex gap-2">
                <button
                  onClick={() => handleStatusChange(selectedSubmission.id, 'Approved')}
                  disabled={selectedSubmission.status === 'Approved'}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-3 rounded-md text-xs font-semibold transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleStatusChange(selectedSubmission.id, 'Rejected')}
                  disabled={selectedSubmission.status === 'Rejected'}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-3 rounded-md text-xs font-semibold transition-colors"
                >
                  Reject
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400 text-sm">
              Select a submission from the list to review details and take approval actions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
