import React, { useState, useMemo } from 'react';
import {
  LeaveRequest,
  EmployeeBalance,
  initialRequests,
  initialBalances
} from './mockData';

export default function AdminDashboard() {
  // State management for leave requests and employee balances
  const [requests, setRequests] = useState<LeaveRequest[]>(initialRequests);
  const [balances, setBalances] = useState<EmployeeBalance[]>(initialBalances);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  
  // State for balance adjustment modal/form
  const [editingBalance, setEditingBalance] = useState<EmployeeBalance | null>(null);
  const [adjustmentValue, setAdjustmentValue] = useState<number>(0);
  const [adjustmentType, setAdjustmentType] = useState<'annual' | 'sick'>('annual');

  // Handle Approval
  const handleApprove = (id: string) => {
    setRequests(prev =>
      prev.map(req => (req.id === id ? { ...req, status: 'Approved' } : req))
    );
  };

  // Handle Rejection
  const handleReject = (id: string) => {
    setRequests(prev =>
      prev.map(req => (req.id === id ? { ...req, status: 'Rejected' } : req))
    );
  };

  // Handle Balance Adjustment
  const handleSaveBalance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBalance) return;

    setBalances(prev =>
      prev.map(emp => {
        if (emp.id === editingBalance.id) {
          if (adjustmentType === 'annual') {
            return { ...emp, annualAllocated: emp.annualAllocated + adjustmentValue };
          } else {
            return { ...emp, sickAllocated: emp.sickAllocated + adjustmentValue };
          }
        }
        return emp;
      })
    );
    setEditingBalance(null);
    setAdjustmentValue(0);
  };

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const matchesSearch = req.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            req.leaveType.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === 'All' || req.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [requests, searchTerm, selectedStatus]);

  // KPI Metrics
  const metrics = useMemo(() => {
    const pending = requests.filter(r => r.status === 'Pending').length;
    const totalEmployees = balances.length;
    const totalDaysApproved = requests
      .filter(r => r.status === 'Approved')
      .reduce((sum, r) => sum + r.days, 0);
    return { pending, totalEmployees, totalDaysApproved };
  }, [requests, balances]);

  return (
    <div style={{ padding: '24px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Admin Leave Dashboard</h1>
        <p style={{ color: '#6b7280', marginTop: '4px' }}>Monitor balances, manage allowances, and process pending leave requests.</p>
      </header>

      {/* KPI Cards Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>Pending Requests</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444', marginTop: '8px' }}>{metrics.pending} Action Required</div>
        </div>
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>Total Employees</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginTop: '8px' }}>{metrics.totalEmployees} Active</div>
        </div>
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>Approved Days (This Cycle)</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981', marginTop: '8px' }}>{metrics.totalDaysApproved} Days</div>
        </div>
      </div>

      {/* Filter and Pending Requests Section */}
      <section style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0, color: '#111827' }}>Leave Requests Queue</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              placeholder="Search employee or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px' }}
            />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', backgroundColor: '#fff' }}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f3f4f6', color: '#4b5563' }}>
                <th style={{ padding: '12px 8px' }}>Employee</th>
                <th style={{ padding: '12px 8px' }}>Type</th>
                <th style={{ padding: '12px 8px' }}>Duration</th>
                <th style={{ padding: '12px 8px' }}>Days</th>
                <th style={{ padding: '12px 8px' }}>Reason</th>
                <th style={{ padding: '12px 8px' }}>Status</th>
                <th style={{ padding: '12px 8px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map(req => (
                <tr key={req.id} style={{ borderBottom: '1px solid #f3f4f6', hover: { backgroundColor: '#f9fafb' } }}>
                  <td style={{ padding: '12px 8px', fontWeight: '500' }}>{req.employeeName}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <span style={{
                      backgroundColor: req.leaveType === 'Sick' ? '#fee2e2' : req.leaveType === 'Annual' ? '#e0f2fe' : '#f3f4f6',
                      color: req.leaveType === 'Sick' ? '#991b1b' : req.leaveType === 'Annual' ? '#0369a1' : '#374151',
                      padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '500'
                    }}>{req.leaveType}</span>
                  </td>
                  <td style={{ padding: '12px 8px', color: '#4b5563' }}>{req.startDate} to {req.endDate}</td>
                  <td style={{ padding: '12px 8px', fontWeight: '600' }}>{req.days}</td>
                  <td style={{ padding: '12px 8px', color: '#6b7280', fontStyle: 'italic' }}>"{req.reason}"</td>
                  <td style={{ padding: '12px 8px' }}>
                    <span style={{
                      color: req.status === 'Approved' ? '#047857' : req.status === 'Rejected' ? '#b91c1c' : '#b45309',
                      fontWeight: '600'
                    }}>{req.status}</span>
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                    {req.status === 'Pending' ? (
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleApprove(req.id)}
                          style={{ padding: '6px 12px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(req.id)}
                          style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: '#9ca3af', fontSize: '12px' }}>Processed</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#9ca3af' }}>No matching leave requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Employee Leave Balance Management Section */}
      <section style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#111827' }}>Employee Leave Balances</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f3f4f6', color: '#4b5563' }}>
                <th style={{ padding: '12px 8px' }}>Employee</th>
                <th style={{ padding: '12px 8px' }}>Department</th>
                <th style={{ padding: '12px 8px' }}>Annual Leave (Allocated)</th>
                <th style={{ padding: '12px 8px' }}>Annual Leave (Used)</th>
                <th style={{ padding: '12px 8px' }}>Sick Leave (Allocated)</th>
                <th style={{ padding: '12px 8px' }}>Sick Leave (Used)</th>
                <th style={{ padding: '12px 8px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {balances.map(emp => (
                <tr key={emp.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px 8px', fontWeight: '500' }}>{emp.employeeName}</td>
                  <td style={{ padding: '12px 8px', color: '#4b5563' }}>{emp.department}</td>
                  <td style={{ padding: '12px 8px' }}>{emp.annualAllocated} days</td>
                  <td style={{ padding: '12px 8px', color: '#6b7280' }}>{emp.annualUsed} days</td>
                  <td style={{ padding: '12px 8px' }}>{emp.sickAllocated} days</td>
                  <td style={{ padding: '12px 8px', color: '#6b7280' }}>{emp.sickUsed} days</td>
                  <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                    <button
                      onClick={() => setEditingBalance(emp)}
                      style={{ padding: '6px 12px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                    >
                      Adjust Balance
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Balance Adjustment Modal Drawer */}
      {editingBalance && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100
        }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>Adjust Balance for {editingBalance.employeeName}</h3>
            <form onSubmit={handleSaveBalance}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Leave Type</label>
                <select
                  value={adjustmentType}
                  onChange={(e) => setAdjustmentType(e.target.value as 'annual' | 'sick')}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                >
                  <option value="annual">Annual Leave</option>
                  <option value="sick">Sick Leave</option>
                </select>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Adjustment (Days)</label>
                <input
                  type="number"
                  value={adjustmentValue}
                  onChange={(e) => setAdjustmentValue(parseInt(e.target.value) || 0)}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                  placeholder="e.g. 5 or -3"
                />
                <span style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', display: 'block' }}>Use positive numbers to add, negative to subtract.</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setEditingBalance(null)}
                  style={{ padding: '8px 16px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
