import React, { useState } from 'react';
import { LeaveRequest, LeaveType, LeaveStatus } from './types';

// Pre-populated mock data for demonstration purposes
const INITIAL_REQUESTS: LeaveRequest[] = [
  {
    id: '1',
    employeeName: 'Jane Doe',
    startDate: '2023-11-01',
    endDate: '2023-11-05',
    leaveType: 'Annual',
    reason: 'Family vacation trip',
    status: 'Pending',
    submittedAt: '2023-10-15'
  },
  {
    id: '2',
    employeeName: 'John Smith',
    startDate: '2023-10-20',
    endDate: '2023-10-21',
    leaveType: 'Sick',
    reason: 'Dental appointment and recovery',
    status: 'Approved',
    submittedAt: '2023-10-10'
  },
  {
    id: '3',
    employeeName: 'Alice Johnson',
    startDate: '2023-12-24',
    endDate: '2024-01-02',
    leaveType: 'Annual',
    reason: 'Christmas & New Year holidays',
    status: 'Pending',
    submittedAt: '2023-10-18'
  }
];

export const LeaveManagement: React.FC = () => {
  const [requests, setRequests] = useState<LeaveRequest[]>(INITIAL_REQUESTS);
  const [activeTab, setActiveTab] = useState<'employee' | 'manager'>('employee');
  
  // Form State
  const [employeeName, setEmployeeName] = useState('');
  const [leaveType, setLeaveType] = useState<LeaveType>('Annual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Manager Filter State
  const [filterStatus, setFilterStatus] = useState<LeaveStatus | 'All'>('All');

  // Handle Leave Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!employeeName || !startDate || !endDate || !reason) {
      setError('All fields are required.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('End date cannot be earlier than start date.');
      return;
    }

    const newRequest: LeaveRequest = {
      id: Date.now().toString(),
      employeeName,
      startDate,
      endDate,
      leaveType,
      reason,
      status: 'Pending',
      submittedAt: new Date().toISOString().split('T')[0]
    };

    setRequests([newRequest, ...requests]);
    setSuccessMessage('Leave request submitted successfully!');
    
    // Reset form fields except name
    setStartDate('');
    setEndDate('');
    setReason('');
  };

  // Handle Status Change (Approve/Reject)
  const handleStatusChange = (id: string, newStatus: LeaveStatus) => {
    setRequests(prev =>
      prev.map(req => (req.id === id ? { ...req, status: newStatus } : req))
    );
  };

  const filteredRequests = requests.filter(
    req => filterStatus === 'All' || req.status === filterStatus
  );

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: '#1a202c', fontSize: '2.25rem', marginBottom: '0.5rem' }}>Leave Management System</h1>
        <p style={{ color: '#4a5568' }}>Submit requests or manage pending leaves instantly.</p>
      </header>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid #e2e8f0', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('employee')}
          style={{
            padding: '10px 20px',
            cursor: 'pointer',
            border: 'none',
            background: 'none',
            fontSize: '1rem',
            fontWeight: activeTab === 'employee' ? 'bold' : 'normal',
            borderBottom: activeTab === 'employee' ? '3px solid #3182ce' : '3px solid transparent',
            color: activeTab === 'employee' ? '#3182ce' : '#4a5568'
          }}
        >
          Employee Portal
        </button>
        <button
          onClick={() => setActiveTab('manager')}
          style={{
            padding: '10px 20px',
            cursor: 'pointer',
            border: 'none',
            background: 'none',
            fontSize: '1rem',
            fontWeight: activeTab === 'manager' ? 'bold' : 'normal',
            borderBottom: activeTab === 'manager' ? '3px solid #3182ce' : '3px solid transparent',
            color: activeTab === 'manager' ? '#3182ce' : '#4a5568'
          }}
        >
          Manager Dashboard
        </button>
      </div>

      {/* Employee Portal View */}
      {activeTab === 'employee' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
          {/* Submission Form */}
          <div style={{ background: '#f7fafc', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#2d3748' }}>Submit Leave Request</h2>
            <form onSubmit={handleSubmit}>
              {error && <div style={{ color: '#e53e3e', background: '#fff5f5', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontWeight: 'bold' }}>{error}</div>}
              {successMessage && <div style={{ color: '#38a169', background: '#f0fff4', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontWeight: 'bold' }}>{successMessage}</div>}

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#4a5568' }}>Employee Name</label>
                <input
                  type="text"
                  value={employeeName}
                  onChange={e => setEmployeeName(e.target.value)}
                  placeholder="Jane Doe"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e0' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#4a5568' }}>Leave Type</label>
                <select
                  value={leaveType}
                  onChange={e => setLeaveType(e.target.value as LeaveType)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e0', background: 'white' }}
                >
                  <option value="Annual">Annual Leave</option>
                  <option value="Sick">Sick Leave</option>
                  <option value="Maternity/Paternity">Maternity/Paternity</option>
                  <option value="Unpaid">Unpaid Leave</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#4a5568' }}>Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e0' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#4a5568' }}>End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e0' }}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#4a5568' }}>Reason</label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  rows={4}
                  placeholder="Provide details regarding your leave request..."
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e0', resize: 'vertical' }}
                  required
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#3182ce',
                  color: 'white',
                  fontWeight: 'bold',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                Submit Request
              </button>
            </form>
          </div>

          {/* My Submission History */}
          <div>
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#2d3748' }}>My Requests</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {requests.map(req => (
                <div key={req.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', background: 'white' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 'bold', color: '#2d3748' }}>{req.leaveType} Leave</span>
                    <span
                      style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        background: req.status === 'Approved' ? '#c6f6d5' : req.status === 'Rejected' ? '#fed7d7' : '#feebc8',
                        color: req.status === 'Approved' ? '#22543d' : req.status === 'Rejected' ? '#742a2a' : '#744210'
                      }}
                    >
                      {req.status}
                    </span>
                  </div>
                  <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: '#4a5568' }}>
                    <strong>Duration:</strong> {req.startDate} to {req.endDate}
                  </p>
                  <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: '#718096', italic: 'true' }}>
                    "{req.reason}"
                  </p>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: '#a0aec0', textAlign: 'right' }}>
                    Submitted on {req.submittedAt}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Manager Portal View */}
      {activeTab === 'manager' && (
        <div>
          {/* Filters */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0, color: '#2d3748' }}>Review Leave Requests</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#4a5568', fontSize: '0.875rem', fontWeight: 'bold' }}>Filter by:</span>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as LeaveStatus | 'All')}
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e0', background: 'white' }}
              >
                <option value="All">All Requests</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Request List */}
          {filteredRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', border: '2px dashed #e2e8f0', borderRadius: '8px', color: '#718096' }}>
              No leave requests found for the selected filter.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredRequests.map(req => (
                <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                      <strong style={{ fontSize: '1.125rem', color: '#2d3748' }}>{req.employeeName}</strong>
                      <span style={{ fontSize: '0.875rem', color: '#718096' }}>({req.leaveType} Leave)</span>
                    </div>
                    <p style={{ margin: '0.25rem 0', color: '#4a5568' }}>
                      <strong>Period:</strong> {req.startDate} to {req.endDate}
                    </p>
                    <p style={{ margin: '0.25rem 0', color: '#4a5568', fontStyle: 'italic' }}>
                      <strong>Reason:</strong> "{req.reason}"
                    </p>
                    <span style={{ fontSize: '0.75rem', color: '#a0aec0' }}>Submitted on {req.submittedAt}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem', marginLeft: '2rem' }}>
                    <span
                      style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.875rem',
                        fontWeight: 'bold',
                        background: req.status === 'Approved' ? '#c6f6d5' : req.status === 'Rejected' ? '#fed7d7' : '#feebc8',
                        color: req.status === 'Approved' ? '#22543d' : req.status === 'Rejected' ? '#742a2a' : '#744210'
                      }}
                    >
                      {req.status}
                    </span>
                    {req.status === 'Pending' && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleStatusChange(req.id, 'Approved')}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#48bb78',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                          }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusChange(req.id, 'Rejected')}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#f56565',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
