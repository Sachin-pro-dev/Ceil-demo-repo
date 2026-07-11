import React, { useState, useMemo } from 'react';
import './styles.css';

// Interfaces for Leave Reports and System Policies
interface LeaveReport {
  id: string;
  employeeName: string;
  department: string;
  leaveType: 'Annual' | 'Sick' | 'Maternity' | 'Unpaid';
  startDate: string;
  endDate: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  durationDays: number;
}

interface SystemPolicy {
  id: string;
  policyName: string;
  leaveType: 'Annual' | 'Sick' | 'Maternity' | 'Unpaid';
  maxDaysPerYear: number;
  carryOverAllowed: boolean;
  maxCarryOverDays: number;
  requiresApproval: boolean;
}

export const AdminDashboard: React.FC = () => {
  // Tab State
  const [activeTab, setActiveTab] = useState<'reports' | 'policies'>('reports');

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [deptFilter, setDeptFilter] = useState<string>('All');

  // Success/Notification State
  const [notification, setNotification] = useState<string | null>(null);

  // Mock Leave Reports Data
  const [leaveReports] = useState<LeaveReport[]>([
    { id: '1', employeeName: 'Alice Smith', department: 'Engineering', leaveType: 'Annual', startDate: '2023-11-01', endDate: '2023-11-05', status: 'Approved', durationDays: 5 },
    { id: '2', employeeName: 'Bob Jones', department: 'Marketing', leaveType: 'Sick', startDate: '2023-11-03', endDate: '2023-11-04', status: 'Approved', durationDays: 1 },
    { id: '3', employeeName: 'Charlie Brown', department: 'Engineering', leaveType: 'Annual', startDate: '2023-11-10', endDate: '2023-11-15', status: 'Pending', durationDays: 5 },
    { id: '4', employeeName: 'Diana Prince', department: 'Product', leaveType: 'Maternity', startDate: '2023-12-01', endDate: '2024-02-28', status: 'Pending', durationDays: 90 },
    { id: '5', employeeName: 'Evan Wright', department: 'Sales', leaveType: 'Unpaid', startDate: '2023-11-20', endDate: '2023-11-22', status: 'Rejected', durationDays: 2 },
  ]);

  // Mock System Policies Data
  const [policies, setPolicies] = useState<SystemPolicy[]>([
    { id: 'p1', policyName: 'Standard Annual Leave', leaveType: 'Annual', maxDaysPerYear: 25, carryOverAllowed: true, maxCarryOverDays: 5, requiresApproval: true },
    { id: 'p2', policyName: 'Standard Sick Leave', leaveType: 'Sick', maxDaysPerYear: 10, carryOverAllowed: false, maxCarryOverDays: 0, requiresApproval: false },
    { id: 'p3', policyName: 'Maternity Protection Policy', leaveType: 'Maternity', maxDaysPerYear: 90, carryOverAllowed: false, maxCarryOverDays: 0, requiresApproval: true },
    { id: 'p4', policyName: 'Unpaid Leave Policy', leaveType: 'Unpaid', maxDaysPerYear: 30, carryOverAllowed: false, maxCarryOverDays: 0, requiresApproval: true },
  ]);

  // Handle Policy Change Form Submit
  const handleUpdatePolicy = (id: string, updatedFields: Partial<SystemPolicy>) => {
    setPolicies(prev =>
      prev.map(policy => (policy.id === id ? { ...policy, ...updatedFields } : policy))
    );
    triggerNotification('Policy configuration updated successfully!');
  };

  const triggerNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  // Calculated Metrics
  const metrics = useMemo(() => {
    const total = leaveReports.length;
    const pending = leaveReports.filter(r => r.status === 'Pending').length;
    const approved = leaveReports.filter(r => r.status === 'Approved').length;
    return { total, pending, approved };
  }, [leaveReports]);

  // Filtered Leave Reports
  const filteredReports = useMemo(() => {
    return leaveReports.filter(report => {
      const matchesSearch = report.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            report.department.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || report.status === statusFilter;
      const matchesDept = deptFilter === 'All' || report.department === deptFilter;
      return matchesSearch && matchesStatus && matchesDept;
    });
  }, [leaveReports, searchQuery, statusFilter, deptFilter]);

  return (
    <div className="admin-dashboard">
      {/* Dashboard Header */}
      <header className="dashboard-header">
        <div className="header-title">
          <h1>Admin Leave Management Portal</h1>
          <p>Centralized policy configuration and leave metrics reporting</p>
        </div>
        <div className="header-tabs">
          <button
            className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            Leave Reports
          </button>
          <button
            className={`tab-btn ${activeTab === 'policies' ? 'active' : ''}`}
            onClick={() => setActiveTab('policies')}
          >
            System Policies
          </button>
        </div>
      </header>

      {/* Notification Toast */}
      {notification && (
        <div className="notification-toast">
          <span>✓ {notification}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="dashboard-content">
        {activeTab === 'reports' ? (
          <div className="reports-section">
            {/* Metrics Row */}
            <section className="metrics-grid">
              <div className="metric-card">
                <h3>Total Leave Requests</h3>
                <p className="metric-value">{metrics.total}</p>
              </div>
              <div className="metric-card pending">
                <h3>Pending Approvals</h3>
                <p className="metric-value">{metrics.pending}</p>
              </div>
              <div className="metric-card approved">
                <h3>Approved Leaves</h3>
                <p className="metric-value">{metrics.approved}</p>
              </div>
            </section>

            {/* Filters Control Panel */}
            <section className="filter-panel">
              <div className="filter-group">
                <label htmlFor="search">Search Employee</label>
                <input
                  id="search"
                  type="text"
                  placeholder="e.g. Alice Smith"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="filter-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div className="filter-group">
                <label htmlFor="department">Department</label>
                <select
                  id="department"
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                >
                  <option value="All">All Departments</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Product">Product</option>
                  <option value="Sales">Sales</option>
                </select>
              </div>
            </section>

            {/* Leave Reports Table */}
            <section className="table-container">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Employee Name</th>
                    <th>Department</th>
                    <th>Leave Type</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Duration</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.length > 0 ? (
                    filteredReports.map(report => (
                      <tr key={report.id}>
                        <td><strong>{report.employeeName}</strong></td>
                        <td>{report.department}</td>
                        <td><span className={`badge type-${report.leaveType.toLowerCase()}`}>{report.leaveType}</span></td>
                        <td>{report.startDate}</td>
                        <td>{report.endDate}</td>
                        <td>{report.durationDays} days</td>
                        <td>
                          <span className={`badge status-${report.status.toLowerCase()}`}>
                            {report.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="no-data">No leave records match the specified filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>
          </div>
        ) : (
          <div className="policies-section">
            <div className="section-intro">
              <h2>Configure Global Leave Policies</h2>
              <p>Adjust thresholds, limits, and approval pathways for all leave categories across the system.</p>
            </div>

            <div className="policies-grid">
              {policies.map(policy => (
                <div key={policy.id} className="policy-card">
                  <div className="policy-card-header">
                    <h3>{policy.policyName}</h3>
                    <span className={`badge type-${policy.leaveType.toLowerCase()}`}>{policy.leaveType}</span>
                  </div>
                  <div className="policy-card-body">
                    {/* Max Days Input */}
                    <div className="policy-input-group">
                      <label>Max Days Allowed per Year</label>
                      <input
                        type="number"
                        value={policy.maxDaysPerYear}
                        min={0}
                        max={365}
                        onChange={(e) => handleUpdatePolicy(policy.id, { maxDaysPerYear: Number(e.target.value) })}
                      />
                    </div>

                    {/* Carry Over Toggle */}
                    <div className="policy-input-group checkbox-group">
                      <input
                        type="checkbox"
                        id={`carryOver-${policy.id}`}
                        checked={policy.carryOverAllowed}
                        onChange={(e) => handleUpdatePolicy(policy.id, { carryOverAllowed: e.target.checked })}
                      />
                      <label htmlFor={`carryOver-${policy.id}`}>Allow Carry-Over to Next Year</label>
                    </div>

                    {/* Carry Over Max Days Input */}
                    {policy.carryOverAllowed && (
                      <div className="policy-input-group nested-input">
                        <label>Max Carry-Over Days</label>
                        <input
                          type="number"
                          value={policy.maxCarryOverDays}
                          min={0}
                          max={policy.maxDaysPerYear}
                          onChange={(e) => handleUpdatePolicy(policy.id, { maxCarryOverDays: Number(e.target.value) })}
                        />
                      </div>
                    )}

                    {/* Requires Approval Toggle */}
                    <div className="policy-input-group checkbox-group">
                      <input
                        type="checkbox"
                        id={`approval-${policy.id}`}
                        checked={policy.requiresApproval}
                        onChange={(e) => handleUpdatePolicy(policy.id, { requiresApproval: e.target.checked })}
                      />
                      <label htmlFor={`approval-${policy.id}`}>Requires Managerial Approval</label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
