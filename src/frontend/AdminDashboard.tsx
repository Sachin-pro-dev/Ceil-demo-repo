import React, { useState, useMemo } from 'react';
import { MOCK_LEAVE_REQUESTS, LeaveRequest, LeaveStatus, DEPARTMENTS, STATUSES } from './mockData';
import './styles.css';

export const AdminDashboard: React.FC = () => {
  const [requests, setRequests] = useState<LeaveRequest[]>(MOCK_LEAVE_REQUESTS);
  const [selectedDept, setSelectedDept] = useState<string>('All Departments');
  const [selectedStatus, setSelectedStatus] = useState<string>('All Statuses');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Handle Approval/Rejection
  const handleStatusChange = (id: string, newStatus: LeaveStatus) => {
    setRequests(prev =>
      prev.map(req => (req.id === id ? { ...req, status: newStatus } : req))
    );
  };

  // Filtering logic
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const matchesDept = selectedDept === 'All Departments' || req.department === selectedDept;
      const matchesStatus = selectedStatus === 'All Statuses' || req.status === selectedStatus;
      const matchesSearch = req.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            req.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            req.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStartDate = !startDate || new Date(req.startDate) >= new Date(startDate);
      const matchesEndDate = !endDate || new Date(req.endDate) <= new Date(endDate);

      return matchesDept && matchesStatus && matchesSearch && matchesStartDate && matchesEndDate;
    });
  }, [requests, selectedDept, selectedStatus, searchQuery, startDate, endDate]);

  // Metrics calculations
  const metrics = useMemo(() => {
    const pending = requests.filter(r => r.status === 'Pending').length;
    const approved = requests.filter(r => r.status === 'Approved').length;
    const totalDaysApproved = requests
      .filter(r => r.status === 'Approved')
      .reduce((acc, curr) => acc + curr.days, 0);

    return {
      totalRequests: requests.length,
      pendingApprovals: pending,
      approvedRequests: approved,
      totalDaysApproved
    };
  }, [requests]);

  // CSV Export utility
  const exportToCSV = () => {
    const headers = ['Request ID', 'Employee Name', 'Department', 'Leave Type', 'Start Date', 'End Date', 'Days', 'Status', 'Reason'];
    const rows = filteredRequests.map(r => [
      r.id,
      r.employeeName,
      r.department,
      r.leaveType,
      r.startDate,
      r.endDate,
      r.days,
      r.status,
      `"${r.reason.replace(/"/g, '""')}"`
    ]);

    const csvContent = 
      'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Leave_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Leave Management Admin Dashboard</h1>
          <p className="subtitle">Monitor, filter, approve and export global employee leave data.</p>
        </div>
        <button className="btn btn-primary" onClick={exportToCSV}>
          Export CSV Report
        </button>
      </header>

      {/* Metrics Cards Grid */}
      <section className="metrics-grid">
        <div className="metric-card">
          <span className="metric-title">Total Leave Requests</span>
          <span className="metric-value">{metrics.totalRequests}</span>
        </div>
        <div className="metric-card highlight-pending">
          <span className="metric-title">Pending Approvals</span>
          <span className="metric-value">{metrics.pendingApprovals}</span>
        </div>
        <div className="metric-card highlight-approved">
          <span className="metric-title">Approved Requests</span>
          <span className="metric-value">{metrics.approvedRequests}</span>
        </div>
        <div className="metric-card">
          <span className="metric-title">Total Days Approved</span>
          <span className="metric-value">{metrics.totalDaysApproved} days</span>
        </div>
      </section>

      {/* Filtering Panel */}
      <section className="filter-panel">
        <div className="filter-group">
          <label htmlFor="search">Search Employee / Reason</label>
          <input
            id="search"
            type="text"
            placeholder="Search name, ID, or reason..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="department">Department</label>
          <select
            id="department"
            value={selectedDept}
            onChange={e => setSelectedDept(e.target.value)}
          >
            {DEPARTMENTS.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
          >
            {STATUSES.map(stat => (
              <option key={stat} value={stat}>{stat}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="startDate">From Date</label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="endDate">To Date</label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </div>
      </section>

      {/* Leave Requests Table */}
      <section className="table-container">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Employee</th>
              <th>Department</th>
              <th>Leave Type</th>
              <th>Duration</th>
              <th>Total Days</th>
              <th>Reason</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.length > 0 ? (
              filteredRequests.map(req => (
                <tr key={req.id}>
                  <td className="text-bold">{req.id}</td>
                  <td>
                    <div className="employee-info">
                      <span className="employee-name">{req.employeeName}</span>
                    </div>
                  </td>
                  <td>{req.department}</td>
                  <td>
                    <span className="leave-type-badge">{req.leaveType}</span>
                  </td>
                  <td>
                    <span className="date-range">{req.startDate} to {req.endDate}</span>
                  </td>
                  <td className="text-center text-bold">{req.days}</td>
                  <td className="reason-cell" title={req.reason}>{req.reason}</td>
                  <td>
                    <span className={`status-badge status-${req.status.toLowerCase()}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="actions-cell">
                    {req.status === 'Pending' ? (
                      <div className="action-buttons">
                        <button
                          className="btn btn-sm btn-approve"
                          onClick={() => handleStatusChange(req.id, 'Approved')}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-sm btn-reject"
                          onClick={() => handleStatusChange(req.id, 'Rejected')}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="action-done">Handled</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="no-results">
                  No leave requests found matching the filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
};
