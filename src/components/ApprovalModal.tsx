import React from 'react';
import { ApprovalRequest } from '../types';
import { AlertTriangle, ShieldCheck, XCircle, CheckCircle, Octagon, Loader2 } from 'lucide-react';

interface ApprovalModalProps {
  request: ApprovalRequest | null;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onCancel: (id: string) => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  request,
  onApprove,
  onReject,
  onCancel,
}) => {
  if (!request) return null;

  const isExecuting = request.status === 'in_progress';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#0d090b] border-2 border-red-600/70 rounded-2xl shadow-2xl glow-red-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-950/80 via-red-900/40 to-black px-6 py-4 border-b border-red-600/40 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-600/20 border border-red-500 rounded-lg text-red-400">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-red-100 uppercase tracking-wider font-mono">
                Poppy Security Protocol
              </h2>
              <p className="text-xs text-red-300/80 font-mono">
                Authorization Required Before Execution
              </p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-mono px-2.5 py-1 rounded bg-red-950 border border-red-600 text-red-300">
            {request.type.replace('_', ' ')}
          </span>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white mb-1">
              {request.title}
            </h3>
            <p className="text-sm text-neutral-300 leading-relaxed">
              {request.description}
            </p>
          </div>

          {/* Action details list */}
          <div className="bg-neutral-950/80 border border-red-950 rounded-xl p-4">
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-red-400" />
              Proposed Actions & Impact:
            </div>
            <ul className="space-y-2 text-xs text-neutral-200">
              {request.details.map((detail, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-red-500 font-mono mt-0.5">▶</span>
                  <span className="font-mono">{detail}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Execution Progress Bar */}
          {isExecuting && (
            <div className="space-y-2 bg-red-950/30 p-3 rounded-lg border border-red-600/30">
              <div className="flex justify-between text-xs font-mono text-red-300">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {request.currentStep || 'Executing approved workflow...'}
                </span>
                <span>{request.progress || 0}%</span>
              </div>
              <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden border border-red-900/60">
                <div
                  className="bg-gradient-to-r from-red-600 to-red-400 h-full transition-all duration-300 glow-red-sm"
                  style={{ width: `${request.progress || 0}%` }}
                />
              </div>
            </div>
          )}

          <div className="text-[11px] text-neutral-400 italic">
            Poppy will never alter external repositories, delete critical project files, or package distribution binaries without your explicit consent.
          </div>
        </div>

        {/* Footer actions */}
        <div className="bg-black/90 px-6 py-4 border-t border-neutral-800 flex items-center justify-between gap-3">
          {isExecuting ? (
            <button
              onClick={() => onCancel(request.id)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-700 hover:bg-red-800 text-white font-mono text-xs font-bold rounded-xl transition shadow-lg glow-red cursor-pointer"
            >
              <Octagon className="w-4 h-4" />
              EMERGENCY STOP / CANCEL TASK
            </button>
          ) : (
            <>
              <button
                onClick={() => onReject(request.id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white font-mono text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                <XCircle className="w-4 h-4 text-neutral-400" />
                Reject
              </button>
              <button
                onClick={() => onApprove(request.id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold rounded-xl transition shadow-lg glow-red cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                Approve & Execute
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
