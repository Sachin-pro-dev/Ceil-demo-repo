import React, { useState, useEffect } from 'react';
import { LeaveReport, UserLeaveBalance, SystemOverrideAction } from './types';

export const AdminDashboard: React.FC = () => {
  // State management for high-level reporting, balance configuration, and system overrides
  const [report, setReport] = useState<LeaveReport | null>(null);
  const [balances, setBalances] = useState<UserLeaveBalance[]>([]);
  const [overrides, setOverrides] = useState<SystemOverrideAction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserLeaveBalance | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Load initial mock data simulating an API fetch
  useEffect(() => {
    setReport({
      totalEmployees: 142,
      activeLeavesToday: 8,
      pendingApprovals: 5,
      leaveTypeDistribution: { annual: 60, sick: 25, unpaid: 10, parental: 5 }
    });

    setBalances([
      { userId: 'USR001', userName: 'Alice Smith', email: 'alice@company.com', annualLeaveRemaining: 22, sickLeaveRemaining: 10, unpaidLeaveUsed: 2 },
      { userId: 'USR002', userName: 'Bob Johnson', email: 'bob@company.com', annualLeaveRemaining: 15, sickLeaveRemaining: 8, unpaidLeaveUsed: 0 },
      { userId: 'USR003', userName: 'Charlie Brown', email: 'charlie@company.com', annualLeaveRemaining: 8, sickLeaveRemaining: 12, unpaidLeaveUsed: 5 }
    ]);

    setOverrides([
      { id: 'OVR001', actionType: 'FREEZE_ALL_LEAVES', status: 'INACTIVE', timestamp: '2023-10-15 09:00', performedBy: 'admin@company.com', reason: 'Annual system rollover audit' }
    ]);
  }, []);

  const handleUpdateBalance = (userId: string, field: 'annualLeaveRemaining' | 'sickLeaveRemaining', value: number) => {
    setBalances(prev => 
      prev.map(user => user.userId === userId ? { ...user, [field]: value } : user)
    );
    if (selectedUser && selectedUser.userId === userId) {
      setSelectedUser(prev => prev ? { ...prev, [field]: value } : null);
    }
    showNotification('Leave balance updated successfully!', 'success');
  };

  const handleTriggerOverride = (actionType: 'FREEZE_ALL_LEAVES' | 'AUTO_APPROVE_PENDING' | 'RESET_ALL_BALANCES') => {
    const confirmation = window.confirm(`Are you sure you want to trigger the system-wide action: ${actionType}? This will affect all system accounts.`);
    if (!confirmation) return;

    const newOverride: SystemOverrideAction = {
      id: `OVR00${overrides.length + 1}`,
      actionType,
      status: actionType === 'FREEZE_ALL_LEAVES' ? 'ACTIVE' : 'EXECUTED',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      performedBy: 'admin@company.com',
      reason: 'Manual override via Admin Dashboard'
    };

    setOverrides(prev => [newOverride, ...prev]);
    showNotification(`System-wide override [${actionType}] executed successfully.`, 'success');
  };

  const showNotification = (text: string, type: 'success' | 'error') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const filteredBalances = balances.filter(b => 
    b.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '24px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Admin Dashboard</h1>
        <p style={{ color: '#4b5563', marginTop: '4px' }}>System-wide controls, leave configuration, and organization insights.</p>
      </header>

      {statusMessage && (
        <div style={{
          padding: '12px 16px', 
          borderRadius: '6px', 
          marginBottom: '20px', 
          fontWeight: '500',
          backgroundColor: statusMessage.type === 'success' ? '#def7ec' : '#fde8e8',
          color: statusMessage.type === 'success' ? '#03543f' : '#9b1c1c'
        }}>
          {statusMessage.text}
        </div>
      )}

      {/* 1. HIGH-LEVEL REPORTING SECTION */}
      <section style={{ marginBottom: '36px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>High-Level Reporting</h2>
        {report ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Total Employees</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginTop: '8px' }}>{report.totalEmployees}</div>
            </div>
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Active Leaves Today</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2563eb', marginTop: '8px' }}>{report.activeLeavesToday}</div>
            </div>
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Pending Approvals</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ca8a04', marginTop: '8px' }}>{report.pendingApprovals}</div>
            </div>
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Leave Distribution</div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px', fontSize: '12px' }}>
                <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px' }}>Annual: {report.leaveTypeDistribution.annual}%</span>
                <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: '4px' }}>Sick: {report.leaveTypeDistribution.sick}%</span>
              </div>
            </div>
          </div>
        ) : (
          <p>Loading analytics report...</p>
        )}
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr lg(2fr)', gap: '24px', alignItems: 'start' }}>
        {/* 2. LEAVE BALANCE CONFIGURATION */}
        <section style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>Configure Leave Balances</h2>
          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="Search employees by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
            />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f3f4f6', color: '#6b7280' }}>
                  <th style={{ padding: '12px 8px' }}>Employee</th>
                  <th style={{ padding: '12px 8px' }}>Annual Leave</th>
                  <th style={{ padding: '12px 8px' }}>Sick Leave</th>
                  <th style={{ padding: '12px 8px', textRight: 'right' } as any}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBalances.map(user => (
                  <tr key={user.userId} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px 8px' }}>
                      <div style={{ fontWeight: '600', color: '#111827' }}>{user.userName}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{user.email}</div>
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <input 
                        type="number" 
                        value={user.annualLeaveRemaining} 
                        onChange={(e) => handleUpdateBalance(user.userId, 'annualLeaveRemaining', parseInt(e.target.value) || 0)}
                        style={{ width: '60px', padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                      /> days
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <input 
                        type="number" 
                        value={user.sickLeaveRemaining} 
                        onChange={(e) => handleUpdateBalance(user.userId, 'sickLeaveRemaining', parseInt(e.target.value) || 0)}
                        style={{ width: '60px', padding: '6px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                      /> days
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                      <button 
                        onClick={() => setSelectedUser(user)}
                        style={{ padding: '6px 12px', fontSize: '12px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #2563eb', color: '#2563eb', background: 'none' }}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. SYSTEM-WIDE OVERRIDES */}
        <section style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#dc2626' }}>System-Wide Overrides</h2>
          <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px' }}>
            Warning: These actions perform global changes across all records and bypass normal workflow constraints.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            <button 
              onClick={() => handleTriggerOverride('FREEZE_ALL_LEAVES')}
              style={{ padding: '12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}
            >
              ❄️ Freeze All Leave Submissions
            </button>
            <button 
              onClick={() => handleTriggerOverride('AUTO_APPROVE_PENDING')}
              style={{ padding: '12px', background: '#059669', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}
            >
              ✅ Auto-Approve All Pending Requests
            </button>
            <button 
              onClick={() => handleTriggerOverride('RESET_ALL_BALANCES')}
              style={{ padding: '12px', background: '#4b5563', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}
            >
              🔄 Reset All Annual Balances to Baseline
            </button>
          </div>

          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>Override Audit Log</h3>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {overrides.map(ovr => (
              <div key={ovr.id} style={{ borderLeft: '4px solid #ef4444', padding: '10px 12px', backgroundColor: '#fef2f2', marginBottom: '8px', borderRadius: '0 6px 6px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'between', fontSize: '12px', fontWeight: 'bold', color: '#991b1b' }}>
                  <span>{ovr.actionType}</span>
                  <span style={{ marginLeft: 'auto', background: '#fca5a5', padding: '2px 6px', borderRadius: '4px' }}>{ovr.status}</span>
                </div>
                <p style={{ margin: '4px 0', fontSize: '12px', color: '#4b5563' }}>Reason: {ovr.reason}</p>
                <div style={{ fontSize: '10px', color: '#9ca3af' }}>
                  By {ovr.performedBy} at {ovr.timestamp}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};