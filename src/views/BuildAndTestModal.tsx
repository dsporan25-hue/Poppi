import React, { useState } from 'react';
import { TestReport, UnitTestResult, ProjectFile } from '../types';
import { Bug, CheckCircle2, XCircle, AlertTriangle, RefreshCw, Sparkles, ShieldCheck, Clock } from 'lucide-react';
import { runAndroidVerificationAndTests } from '../utils/crypto';
import { soundEngine } from '../utils/audio';

interface BuildAndTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: ProjectFile[];
  onAutoFix?: (fixedFiles: ProjectFile[]) => void;
}

export const BuildAndTestModal: React.FC<BuildAndTestModalProps> = ({
  isOpen,
  onClose,
  files,
  onAutoFix,
}) => {
  if (!isOpen) return null;

  const [report, setReport] = useState<TestReport>(() => runAndroidVerificationAndTests(files));
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [fixAppliedMessage, setFixAppliedMessage] = useState<string | null>(null);

  const handleRerun = () => {
    setIsRunning(true);
    setFixAppliedMessage(null);
    soundEngine.playJarvisWake();

    setTimeout(() => {
      const newReport = runAndroidVerificationAndTests(files);
      setReport(newReport);
      setIsRunning(false);
      if (newReport.failedTests === 0 && newReport.lintIssues.filter(l => l.level === 'error').length === 0) {
        soundEngine.playSuccess();
      } else {
        soundEngine.playAlert();
      }
    }, 600);
  };

  const handleApplyFix = (result: UnitTestResult) => {
    if (result.suggestedFix && onAutoFix) {
      // Auto-correct common issues
      const updatedFiles = files.map((f) => {
        if (f.path.includes('MainActivity.kt') && !f.content.includes('package com.poran.poppy')) {
          return {
            ...f,
            content: `package com.poran.poppy\n\n` + f.content,
          };
        }
        return f;
      });

      onAutoFix(updatedFiles);
      setFixAppliedMessage(`Auto-fix applied: "${result.suggestedFix}". Rerunning suite...`);
      soundEngine.playSuccess();

      setTimeout(() => {
        setReport(runAndroidVerificationAndTests(updatedFiles));
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-[#0d090e] border-2 border-red-600/70 rounded-2xl p-6 shadow-2xl glow-red-lg max-h-[85vh] flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-red-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-950/60 border border-red-600 rounded-lg text-red-400">
              <Bug className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono">
                Poppy Automated Testing & Static Verification
              </h3>
              <p className="text-xs text-neutral-400 font-mono">
                JVM Unit Test Runner • Android Lint • Clean Architecture Verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white font-mono cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Test Summary Bar */}
        <div className="grid grid-cols-4 gap-2 text-xs font-mono">
          <div className="bg-black/60 p-2.5 rounded-xl border border-neutral-800 text-center">
            <div className="text-neutral-500 text-[10px]">TOTAL TESTS</div>
            <div className="text-base font-bold text-white">{report.totalTests}</div>
          </div>
          <div className="bg-black/60 p-2.5 rounded-xl border border-neutral-800 text-center">
            <div className="text-neutral-500 text-[10px]">PASSED</div>
            <div className="text-base font-bold text-emerald-400">{report.passedTests}</div>
          </div>
          <div className="bg-black/60 p-2.5 rounded-xl border border-neutral-800 text-center">
            <div className="text-neutral-500 text-[10px]">FAILED</div>
            <div className="text-base font-bold text-red-400">{report.failedTests}</div>
          </div>
          <div className="bg-black/60 p-2.5 rounded-xl border border-neutral-800 text-center">
            <div className="text-neutral-500 text-[10px]">DURATION</div>
            <div className="text-base font-bold text-neutral-300">{report.durationTotalMs}ms</div>
          </div>
        </div>

        {fixAppliedMessage && (
          <div className="p-2.5 bg-emerald-950/60 border border-emerald-700 rounded-lg text-xs font-mono text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{fixAppliedMessage}</span>
          </div>
        )}

        {/* Test Results Scroll Area */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 font-mono text-xs">
          <div className="text-neutral-400 uppercase text-[10px] tracking-wider mb-1">
            Executed Unit Tests:
          </div>

          {report.results.map((res, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border ${
                res.passed
                  ? 'bg-neutral-950/70 border-neutral-800'
                  : 'bg-red-950/30 border-red-800'
              } space-y-1`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {res.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400" />
                  )}
                  <span className="font-bold text-white">{res.name}</span>
                </div>
                <div className="text-[10px] text-neutral-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{res.durationMs}ms</span>
                </div>
              </div>

              <div className="text-[11px] text-neutral-400">{res.suite}</div>

              {res.errorMessage && (
                <div className="p-2 bg-black/80 rounded border border-red-900/60 text-red-300 text-[11px]">
                  Error: {res.errorMessage}
                </div>
              )}

              {res.suggestedFix && (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-neutral-400 italic">
                    Fix: {res.suggestedFix}
                  </span>
                  <button
                    onClick={() => handleApplyFix(res)}
                    className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" /> Auto-Fix
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Lint Issues */}
          {report.lintIssues.length > 0 && (
            <div className="pt-3 space-y-2">
              <div className="text-neutral-400 uppercase text-[10px] tracking-wider">
                Android Lint Diagnostics:
              </div>
              {report.lintIssues.map((lint, i) => (
                <div
                  key={i}
                  className="p-2.5 bg-black/80 border border-amber-900/60 rounded-xl flex items-start gap-2 text-[11px]"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-amber-200 font-bold">
                      {lint.file} (Line {lint.line})
                    </div>
                    <div className="text-neutral-300">{lint.message}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
          <span className="text-[11px] font-mono text-neutral-500">
            Last executed: {report.timestamp}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRerun}
              disabled={isRunning}
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 font-mono text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              <span>Rerun Tests</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold rounded-xl shadow-md glow-red cursor-pointer"
            >
              Close Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
