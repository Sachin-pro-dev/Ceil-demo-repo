import React, { useState } from 'react';
import { ZYesButton } from './ZYesButton';

interface ConfirmationLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
}

export const ZYesDashboard: React.FC = () => {
  const [logs, setLogs] = useState<ConfirmationLog[]>([
    { 
      id: '1',
      timestamp: new Date(Date.now() - 60000).toLocaleTimeString(),
      user: 'U0BGMA29U9L (Slack)',
      action: 'Requested requirement change: zyes'
    }
  ]);
  const [status, setStatus] = useState<'PENDING' | 'CONFIRMED'>('PENDING');

  const handleZYesConfirm = () => {
    setStatus('CONFIRMED');
    const newLog: ConfirmationLog = {
      id: String(Date.now()),
      timestamp: new Date().toLocaleTimeString(),
      user: 'Current User',
      action: 'Triggered Z-YES confirmation'
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const handleReset = () => {
    setStatus('PENDING');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-800">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-emerald-400 flex items-center gap-2">
            <span className="px-2 py-1 bg-emerald-950 text-emerald-400 text-xs rounded border border-emerald-800 font-mono">
              U0BGMA29U9L
            </span>
            zyes Confirmation System
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Tactile, high-priority 3D Z-Yes decision action console.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status === 'CONFIRMED' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${status === 'CONFIRMED' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            {status}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-10 bg-slate-950 rounded-xl border border-slate-800 mb-6">
        <div className="mb-6 text-center">
          <p className="text-slate-400 text-sm mb-2">Perform confirmation for Slack request "zyes"</p>
          <p className="text-xs text-slate-500">Click and hold to feel the 3D tactile feedback action</p>
        </div>

        <ZYesButton 
          onConfirm={handleZYesConfirm} 
          disabled={status === 'CONFIRMED'}
          label="Z-YES"
        />

        {status === 'CONFIRMED' && (
          <button 
            onClick={handleReset}
            className="mt-6 text-xs text-slate-500 hover:text-slate-300 underline underline-offset-4 transition-colors"
          >
            Reset Confirmation State
          </button>
        )}
      </div>

      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Action History</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {logs.map(log => (
            <div key={log.id} className="flex items-start justify-between p-3 bg-slate-950 rounded border border-slate-800 text-xs font-mono">
              <div className="flex flex-col gap-1">
                <span className="text-slate-300">{log.action}</span>
                <span className="text-slate-500 text-[10px]">Initiated by {log.user}</span>
              </div>
              <span className="text-slate-500 whitespace-nowrap">{log.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};