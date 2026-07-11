import React, { useState, useMemo } from 'react';
import { LeaveRequest, LeaveStatus, DashboardStats } from './types';

// Mock initial database state for demonstration
const INITIAL_REQUESTS: LeaveRequest[] = [
  {
    id: 'LR-101',
    employeeName: 'Sarah Jenkins',
    employeeEmail: 'sarah.j@company.com',
    leaveType: 'Annual Leave',
    startDate: '2024-11-10',
    endDate: '2024-11-17',
    reason: 'Family vacation trip to Hawaii.',
    status: 'Pending',
    appliedDate: '2024-10-25'
  },
  {
    id: 'LR-102',
    employeeName: 'Michael Chen',
    employeeEmail: 'michael.c@company.com',
    leaveType: 'Sick Leave',
    startDate: '2024-11-01',
    endDate: '2024-11-03',
    reason: 'Dental surgery and recovery.',
    status: 'Approved',
    appliedDate: '2024-10-28'
  },
  {
    id: 'LR-103',
    employeeName: 'Emily Rodriguez',
    employeeEmail: 'emily.r@company.com',
    leaveType: 'Maternity Leave',
    startDate: '2024-12-01',
    endDate: '2025-02-28',
    reason: 'Maternity leave for newborn care.',
    status: 'Pending',
    appliedDate: '2024-10-20'
  },
  {
    id: 'LR-104',
    employeeName: 'David Kim',
    employeeEmail: 'david.k@company.com',
    leaveType: 'Unpaid Leave',
    startDate: '2024-10-15',
    endDate: '2024-10-16',
    reason: 'Personal emergency.',
    status: 'Rejected',
    appliedDate: '2024-10-12'
  }
];

export const LeaveDashboard: React.FC = () => {
  const [requests, setRequests] = useState<LeaveRequest[]>(INITIAL_REQUESTS);
  const [filterStatus, setFilterStatus] = useState<LeaveStatus | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);

  // Calculate stats dynamically
  const stats = useMemo<DashboardStats>(() => {
    return requests.reduce(
      (acc, curr) => {
        acc.total++;
        if (curr.status === 'Pending') acc.pending++;
        if (curr.status === 'Approved') acc.approved++;
        if (curr.status === 'Rejected') acc.rejected++;
        return acc;
      },
      { total: 0, pending: 0, approved: 0, rejected: 0 }
    );
  }, [requests]);

  // Handle approval or rejection actions
  const handleUpdateStatus = (id: string, newStatus: LeaveStatus) => {
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: newStatus } : req))
    );
    if (selectedRequest && selectedRequest.id === id) {
      setSelectedRequest((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  // Filter and search logic
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchesStatus = filterStatus === 'All' || req.status === filterStatus;
      const matchesSearch =
        req.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.leaveType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [requests, filterStatus, searchQuery]);

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Leave Management Dashboard</h1>
          <p style={styles.subtitle}>Review, approve, and track historical employee leave requests.</p>
        </div>
      </header>

      {/* Stats Cards */}
      <section style={styles.statsContainer}>
        <div style={{ ...styles.card, borderLeft: '4px solid #3b82f6' }}>
          <div style={styles.cardLabel}>Total Requests</div>
          <div style={styles.cardValue}>{stats.total}</div>
        </div>
        <div style={{ ...styles.card, borderLeft: '4px solid #f59e0b' }}>
          <div style={styles.cardLabel}>Pending Approval</div>
          <div style={styles.cardValue}>{stats.pending}</div>
        </div>
        <div style={{ ...styles.card, borderLeft: '4px solid #10b981' }}>
          <div style={styles.cardLabel}>Approved</div>
          <div style={styles.cardValue}>{stats.approved}</div>
        </div>
        <div style={{ ...styles.card, borderLeft: '4px solid #ef4444' }}>
          <div style={styles.cardLabel}>Rejected</div>
          <div style={styles.cardValue}>{stats.rejected}</div>
        </div>
      </section>

      {/* Toolbar (Search & Filter) */}
      <section style={styles.toolbar}>
        <input
          type="text"
          placeholder="Search by name, type, or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
        <div style={styles.filterGroup}>
          {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                ...styles.filterButton,
                backgroundColor: filterStatus === status ? '#2563eb' : '#f3f4f6',
                color: filterStatus === status ? '#ffffff' : '#374151'
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </section>

      {/* Main Grid View */}
      <div style={styles.mainGrid}>
        {/* Table List */}
        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.th}>Employee</th>
                <th style={styles.th}>Leave Type</th>
                <th style={styles.th}>Duration</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length > 0 ? (
                filteredRequests.map((req) => (
                  <tr
                    key={req.id}
                    onClick={() => setSelectedRequest(req)}
                    style={{
                      ...styles.tr,
                      backgroundColor: selectedRequest?.id === req.id ? '#eff6ff' : 'transparent'
                    }}
                  >
                    <td style={styles.td}>
                      <div style={styles.empName}>{req.employeeName}</div>
                      <div style={styles.empEmail}>{req.employeeEmail}</div>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.badgeType}>{req.leaveType}</span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.dateRange}>
                        {req.startDate} to {req.endDate}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badgeStatus,
                          backgroundColor: getStatusBgColor(req.status),
                          color: getStatusTextColor(req.status)
                        }}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td style={styles.td} onClick={(e) => e.stopPropagation()}>
                      {req.status === 'Pending' ? (
                        <div style={styles.actionBtnGroup}>
                          <button
                            onClick={() => handleUpdateStatus(req.id, 'Approved')}
                            style={styles.approveBtn}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(req.id, 'Rejected')}
                            style={styles.rejectBtn}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span style={styles.completedText}>Processed</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={styles.noData}>
                    No leave requests match your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Details Panel */}
        <div style={styles.detailCard}>
          {selectedRequest ? (
            <div>
              <h3 style={styles.detailTitle}>Request Details</h3>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Request ID:</span>
                <span style={styles.detailValue}>{selectedRequest.id}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Employee:</span>
                <span style={styles.detailValue}>
                  {selectedRequest.employeeName} ({selectedRequest.employeeEmail})
                </span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Leave Type:</span>
                <span style={styles.detailValue}>{selectedRequest.leaveType}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Dates:</span>
                <span style={styles.detailValue}>
                  {selectedRequest.startDate} to {selectedRequest.endDate}
                </span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Applied On:</span>
                <span style={styles.detailValue}>{selectedRequest.appliedDate}</span>
              </div>
              <div style={styles.reasonBox}>
                <div style={styles.reasonLabel}>Reason for Leave:</div>
                <p style={styles.reasonText}>{selectedRequest.reason}</p>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Current Status:</span>
                <span
                  style={{
                    ...styles.badgeStatus,
                    backgroundColor: getStatusBgColor(selectedRequest.status),
                    color: getStatusTextColor(selectedRequest.status)
                  }}
                >
                  {selectedRequest.status}
                </span>
              </div>
              {selectedRequest.status === 'Pending' && (
                <div style={{ ...styles.actionBtnGroup, marginTop: '20px' }}>
                  <button
                    onClick={() => handleUpdateStatus(selectedRequest.id, 'Approved')}
                    style={{ ...styles.approveBtn, flex: 1, padding: '10px' }}
                  >
                    Approve Request
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedRequest.id, 'Rejected')}
                    style={{ ...styles.rejectBtn, flex: 1, padding: '10px' }}
                  >
                    Reject Request
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={styles.emptyDetail}>
              Select a leave request to view its full details and processing history.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper styling functions
const getStatusBgColor = (status: LeaveStatus) => {
  if (status === 'Approved') return '#d1fae5';
  if (status === 'Rejected') return '#fee2e2';
  return '#fef3c7';
};

const getStatusTextColor = (status: LeaveStatus) => {
  if (status === 'Approved') return '#065f46';
  if (status === 'Rejected') return '#991b1b';
  return '#92400e';
};

// Inline Styles for portable visual fidelity
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    padding: '24px',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    color: '#1e293b'
  },
  header: {
    marginBottom: '24px',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '16px'
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 4px 0'
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px'
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '16px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column'
  },
  cardLabel: {
    fontSize: '13px',
    color: '#64748b',
    fontWeight: '500',
    marginBottom: '4px'
  },
  cardValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#0f172a'
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '20px',
    flexWrap: 'wrap'
  },
  searchInput: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    width: '300px',
    outline: 'none'
  },
  filterGroup: {
    display: 'flex',
    gap: '8px'
  },
  filterButton: {
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '2.5fr 1.5fr',
    gap: '24px',
    alignItems: 'start'
  },
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    overflow: 'hidden'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '14px'
  },
  thRow: {
    backgroundColor: '#f1f5f9',
    borderBottom: '1px solid #e2e8f0'
  },
  th: {
    padding: '12px 16px',
    fontWeight: '600',
    color: '#475569'
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
    cursor: 'pointer',
    transition: 'background-color 0.15s'
  },
  td: {
    padding: '16px'
  },
  empName: {
    fontWeight: '600',
    color: '#0f172a'
  },
  empEmail: {
    fontSize: '12px',
    color: '#64748b'
  },
  badgeType: {
    padding: '4px 8px',
    backgroundColor: '#f1f5f9',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
    color: '#334155'
  },
  dateRange: {
    fontSize: '13px',
    color: '#334155'
  },
  badgeStatus: {
    padding: '4px 8px',
    borderRadius: '9999px',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  actionBtnGroup: {
    display: 'flex',
    gap: '8px'
  },
  approveBtn: {
    backgroundColor: '#10b981',
    color: '#ffffff',
    border: 'none',
    padding: '4px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '12px'
  },
  rejectBtn: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    padding: '4px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '12px'
  },
  completedText: {
    fontSize: '12px',
    color: '#94a3b8',
    fontStyle: 'italic'
  },
  noData: {
    padding: '32px',
    textAlign: 'center',
    color: '#64748b'
  },
  detailCard: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    padding: '24px',
    border: '1px solid #e2e8f0'
  },
  detailTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#0f172a',
    marginTop: 0,
    marginBottom: '16px',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '8px'
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
    fontSize: '14px'
  },
  detailLabel: {
    color: '#64748b',
    fontWeight: '500'
  },
  detailValue: {
    color: '#0f172a',
    fontWeight: '600'
  },
  reasonBox: {
    backgroundColor: '#f8fafc',
    padding: '12px',
    borderRadius: '6px',
    marginTop: '16px',
    marginBottom: '16px',
    border: '1px solid #e2e8f0'
  },
  reasonLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#475569',
    marginBottom: '4px'
  },
  reasonText: {
    fontSize: '13px',
    color: '#334155',
    margin: 0,
    lineHeight: '1.4'
  },
  emptyDetail: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '14px',
    padding: '40px 0'
  }
};
