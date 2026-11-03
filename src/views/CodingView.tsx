import React, { useState } from 'react';
import { ProjectFile, AppLanguage } from '../types';
import { 
  FileCode, 
  Play, 
  Terminal, 
  Save, 
  Sparkles, 
  Check, 
  Copy, 
  Folder, 
  Plus, 
  Trash2, 
  RefreshCw,
  GitBranch,
  ShieldAlert,
  Loader2,
  Bug,
  Cpu
} from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface CodingViewProps {
  files: ProjectFile[];
  activeFilePath: string;
  onSelectFile: (path: string) => void;
  onSaveFile: (path: string, content: string) => void;
  onCreateFile: (path: string) => void;
  onDeleteFile: (path: string) => void;
  onTriggerBuild: () => void;
  onTriggerTests: () => void;
  onNavigateToGitHub: () => void;
  language: AppLanguage;
}

export const CodingView: React.FC<CodingViewProps> = ({
  files,
  activeFilePath,
  onSelectFile,
  onSaveFile,
  onCreateFile,
  onDeleteFile,
  onTriggerBuild,
  onTriggerTests,
  onNavigateToGitHub,
  language,
}) => {
  const activeFile = files.find((f) => f.path === activeFilePath) || files[0];
  const [editorContent, setEditorContent] = useState<string>(activeFile?.content || '');
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(true);
  const [copilotPrompt, setCopilotPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copilotResponse, setCopilotResponse] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [newFileName, setNewFileName] = useState<string>('');
  const [showNewFileInput, setShowNewFileInput] = useState<boolean>(false);

  // Sync editor when active file changes
  React.useEffect(() => {
    if (activeFile) {
      setEditorContent(activeFile.content);
      setIsSaved(true);
    }
  }, [activeFilePath]);

  const handleContentChange = (val: string) => {
    setEditorContent(val);
    setIsSaved(false);
  };

  const handleSave = () => {
    if (activeFile) {
      onSaveFile(activeFile.path, editorContent);
      setIsSaved(true);
      soundEngine.playSuccess();
    }
  };

  const handleCreateNewFile = () => {
    if (newFileName.trim()) {
      onCreateFile(newFileName.trim());
      setNewFileName('');
      setShowNewFileInput(false);
    }
  };

  // AI Copilot assistance handler
  const handleRunCopilot = async (customInstruction?: string) => {
    const promptToUse = customInstruction || copilotPrompt;
    if (!promptToUse.trim()) return;

    setIsGenerating(true);
    soundEngine.playJarvisWake();

    try {
      const response = await fetch('/api/ai/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToUse,
          currentCode: editorContent,
          language: activeFile?.language || 'kotlin',
          fileType: activeFile?.name || 'file',
        }),
      });

      const data = await response.json();
      if (data.result) {
        setCopilotResponse(data.result);
      } else {
        setCopilotResponse('No code changes suggested.');
      }
    } catch (err: any) {
      setCopilotResponse(`Error contacting Poppy AI: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyCopilotCode = () => {
    if (copilotResponse) {
      // Extract code inside ``` if present
      const match = copilotResponse.match(/```[a-z]*\n([\s\S]*?)```/i);
      const codeToApply = match ? match[1] : copilotResponse;
      setEditorContent(codeToApply);
      setIsSaved(false);
      soundEngine.playSuccess();
    }
  };

  const lines = editorContent.split('\n');

  return (
    <div className="flex flex-col h-[calc(100vh-125px)] max-w-7xl mx-auto px-2 sm:px-4 space-y-2">
      {/* Top IDE Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-[#09080e] border border-red-950/80 rounded-xl text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-red-400 font-bold flex items-center gap-1.5">
            <FileCode className="w-4 h-4 text-red-500" />
            {activeFile?.path || 'workspace'}
          </span>
          {!isSaved && (
            <span className="px-1.5 py-0.5 bg-yellow-950 text-yellow-400 border border-yellow-700/60 rounded text-[10px]">
              UNSAVED
            </span>
          )}
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={handleSave}
            title="Save file changes"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 rounded-lg transition cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-red-400" />
            <span>Save</span>
          </button>

          <button
            onClick={onTriggerTests}
            title="Run Android Unit & Architecture Tests"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 rounded-lg transition cursor-pointer"
          >
            <Bug className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Run Tests</span>
          </button>

          <button
            onClick={onTriggerBuild}
            title="Build APK package"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/70 hover:bg-red-900 border border-red-600 text-red-100 rounded-lg transition glow-red-sm cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 text-red-400" />
            <span className="font-bold">Build APK</span>
          </button>

          <button
            onClick={() => setIsCopilotOpen(!isCopilotOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition cursor-pointer ${
              isCopilotOpen
                ? 'bg-red-600 border-red-500 text-white glow-red-sm'
                : 'bg-neutral-900 border-neutral-700 text-neutral-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Copilot</span>
          </button>
        </div>
      </div>

      {/* Main Coding Area: Split File Tree + Editor + Copilot */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-2 overflow-hidden">
        {/* Left: Project File Tree (3 cols) */}
        <div className="hidden md:flex md:col-span-3 flex-col bg-[#0b0a10] border border-red-950/80 rounded-xl p-2.5 overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-red-950/60 mb-2">
            <span className="text-xs font-mono font-bold text-neutral-300 flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-red-400" />
              POPPY (ANDROID)
            </span>
            <button
              onClick={() => setShowNewFileInput(!showNewFileInput)}
              title="Add file"
              className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-900 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {showNewFileInput && (
            <div className="mb-2 p-1.5 bg-black/80 border border-red-800 rounded-lg flex gap-1">
              <input
                type="text"
                placeholder="app/src/.../File.kt"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                className="flex-1 bg-transparent text-[11px] font-mono text-white focus:outline-none"
              />
              <button
                onClick={handleCreateNewFile}
                className="px-2 py-0.5 bg-red-600 text-white rounded text-[10px] font-mono font-bold"
              >
                Add
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto space-y-1 font-mono text-xs">
            {files.map((file) => {
              const isSelected = file.path === activeFile?.path;
              return (
                <div
                  key={file.path}
                  onClick={() => onSelectFile(file.path)}
                  className={`flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer transition text-left ${
                    isSelected
                      ? 'bg-red-950/60 text-red-200 border border-red-600/40 font-semibold'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-[10px] text-red-500">
                      {file.name.endsWith('.kt') ? 'K' : file.name.endsWith('.xml') ? 'X' : '📄'}
                    </span>
                    <span className="truncate">{file.name}</span>
                  </div>
                  {file.path.startsWith('app/') && (
                    <span className="text-[9px] text-neutral-600">app</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick GitHub sync link */}
          <div className="pt-2 border-t border-red-950/60 mt-1">
            <button
              onClick={onNavigateToGitHub}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800 text-neutral-300 rounded-lg text-[11px] font-mono transition cursor-pointer"
            >
              <GitBranch className="w-3 h-3 text-red-400" />
              <span>Sync with GitHub</span>
            </button>
          </div>
        </div>

        {/* Center: Code Editor with Line Numbers (6 or 9 cols depending on Copilot) */}
        <div
          className={`${
            isCopilotOpen ? 'md:col-span-6' : 'md:col-span-9'
          } flex flex-col bg-[#06050a] border border-red-950 rounded-xl overflow-hidden`}
        >
          {/* File Tab header */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#09080e] border-b border-red-950/60 text-[11px] font-mono text-neutral-400">
            <span>{activeFile?.path}</span>
            <span>{lines.length} lines</span>
          </div>

          {/* Editor Body with line numbers */}
          <div className="flex-1 flex overflow-hidden font-mono text-xs">
            {/* Gutter / Line numbers */}
            <div className="w-10 sm:w-12 bg-[#09080e] py-3 text-right pr-2 select-none text-neutral-600 border-r border-red-950/50 text-[11px] leading-6 overflow-hidden">
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Editable code text area */}
            <textarea
              value={editorContent}
              onChange={(e) => handleContentChange(e.target.value)}
              className="flex-1 p-3 bg-transparent text-neutral-200 resize-none focus:outline-none leading-6 font-mono selection:bg-red-900/60 selection:text-white"
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
            />
          </div>
        </div>

        {/* Right: AI Coding Copilot Panel (3 cols) */}
        {isCopilotOpen && (
          <div className="md:col-span-3 flex flex-col bg-[#0b0a10] border border-red-950/80 rounded-xl p-3 overflow-hidden space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-red-950/60">
              <span className="text-xs font-mono font-bold text-red-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-red-500" />
                Poppy Copilot
              </span>
              <button
                onClick={() => setIsCopilotOpen(false)}
                className="text-neutral-500 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            </div>

            {/* Quick action buttons */}
            <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
              <button
                onClick={() => handleRunCopilot('Analyze and optimize this code for Android Jetpack Compose best practices.')}
                disabled={isGenerating}
                className="p-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-red-600 rounded text-neutral-300 text-left transition cursor-pointer"
              >
                ⚡ Optimize
              </button>
              <button
                onClick={() => handleRunCopilot('Detect potential bugs, memory leaks, or missing coroutine scopes.')}
                disabled={isGenerating}
                className="p-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-red-600 rounded text-neutral-300 text-left transition cursor-pointer"
              >
                🔍 Inspect Bugs
              </button>
            </div>

            {/* Prompt input */}
            <div className="space-y-1">
              <textarea
                value={copilotPrompt}
                onChange={(e) => setCopilotPrompt(e.target.value)}
                placeholder="Ask Poppy to refactor, add a composable, or fix errors..."
                rows={2}
                className="w-full bg-black/80 border border-red-950 rounded-lg p-2 text-xs font-mono text-white placeholder-neutral-500 resize-none focus:outline-none focus:border-red-600"
              />
              <button
                onClick={() => handleRunCopilot()}
                disabled={isGenerating || !copilotPrompt.trim()}
                className={`w-full py-1.5 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  isGenerating || !copilotPrompt.trim()
                    ? 'bg-neutral-900 text-neutral-500'
                    : 'bg-red-600 hover:bg-red-500 text-white shadow-md glow-red-sm'
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Synthesizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run AI Refactor</span>
                  </>
                )}
              </button>
            </div>

            {/* Copilot Result Output */}
            {copilotResponse && (
              <div className="flex-1 flex flex-col bg-black/90 border border-red-950 rounded-lg p-2 overflow-hidden text-xs font-mono">
                <div className="flex items-center justify-between pb-1 border-b border-red-950/60 mb-1 text-[10px] text-neutral-400">
                  <span className="text-red-400">SUGGESTION</span>
                  <button
                    onClick={handleApplyCopilotCode}
                    className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3 h-3" /> Apply to Editor
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto whitespace-pre-wrap text-neutral-300 text-[11px] leading-relaxed">
                  {copilotResponse}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
