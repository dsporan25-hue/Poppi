import React from 'react';
import { ApprovalRequest } from '../types';
import { Bell, ShieldCheck, AlertTriangle, CheckCircle2, XCircle, Octagon, Clock, Terminal } from 'lucide-react';

interface MessagesViewProps {
  requests: ApprovalRequest[];
  onOpenApproval: (req: ApprovalRequest) => void;
  onClearHistory: () => void;
}

export const MessagesView: React.FC<MessagesViewProps> = ({
  requests,
  onOpenApproval,
  onClearHistory,
}) => {
  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const pastRequests = requests.filter((r) => r.status !== 'pending');

  return (
    <div className="flex flex-col h-[calc(100vh-125px)] max-w-5xl mx-auto px-2 sm:px-4 space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between p-3 bg-[#0a090e] border border-red-950/80 rounded-xl">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-red-500 animate-pulse" />
          <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
            Poppy System Messages & Security Audit Trail
          </h2>
        </div>

        <button
          onClick={onClearHistory}
          className="text-xs font-mono text-neutral-400 hover:text-red-400 transition cursor-pointer"
        >
          Clear History
        </button>
      </div>

      {/* Pending Authorizations Section */}
      {pendingRequests.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-red-400 uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5" />
            Pending Authorizations ({pendingRequests.length})
          </div>

          <div className="space-y-2">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="bg-[#120b0e] border-2 border-red-600/80 rounded-xl p-4 shadow-lg glow-red-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white font-mono">{req.title}</span>
                    <span className="px-2 py-0.5 bg-red-950 text-red-300 border border-red-800 text-[10px] font-mono rounded">
                      ACTION REQUIRED
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 font-sans">{req.description}</p>
                </div>

                <button
                  onClick={() => onOpenApproval(req)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold rounded-lg shadow-md glow-red transition cursor-pointer whitespace-nowrap"
                >
                  Review & Authorize
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Execution Audit Log History */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-neutral-500" />
          Event History & Completed Workflows
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-12 text-neutral-500 font-mono text-xs border border-dashed border-neutral-800 rounded-2xl">
            No system notifications or audit entries recorded.
          </div>
        ) : (
          pastRequests.map((req) => {
            const isApproved = req.status === 'approved' || req.status === 'completed';
            const isRejected = req.status === 'rejected';
            const isCancelled = req.status === 'cancelled';

            return (
              <div
                key={req.id}
                className="bg-[#0b0a10] border border-neutral-800 hover:border-red-950/80 rounded-xl p-4 space-y-2 text-xs font-mono transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isApproved && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    {isRejected && <XCircle className="w-4 h-4 text-red-400" />}
                    {isCancelled && <Octagon className="w-4 h-4 text-amber-400" />}
                    <span className="font-bold text-white">{req.title}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-neutral-500">
                    <Clock className="w-3 h-3" />
                    <span>{req.createdAt}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                        isApproved
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : isRejected
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                </div>

                <p className="text-neutral-400 font-sans text-xs">{req.description}</p>

                {req.details.length > 0 && (
                  <div className="bg-black/60 p-2 rounded-lg border border-neutral-900 text-[11px] text-neutral-300 space-y-1">
                    {req.details.map((d, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <span className="text-red-500">▪</span>
                        <span>{d}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
