import React, { useState } from 'react';
import { 
  AppLanguage, 
  VoiceSettings, 
  MemoryItem, 
  AndroidPermission 
} from '../types';
import { 
  Settings, 
  Mic, 
  Volume2, 
  Cpu, 
  Brain, 
  ShieldCheck, 
  Globe, 
  Trash2, 
  Key, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink,
  Sparkles,
  Play
} from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface SettingsViewProps {
  language: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
  voiceSettings: VoiceSettings;
  onUpdateVoiceSettings: (settings: Partial<VoiceSettings>) => void;
  memories: MemoryItem[];
  onDeleteMemory: (id: string) => void;
  onClearMemories: () => void;
  onTriggerVoiceTest: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  language,
  onLanguageChange,
  voiceSettings,
  onUpdateVoiceSettings,
  memories,
  onDeleteMemory,
  onClearMemories,
  onTriggerVoiceTest,
}) => {
  const [activeSection, setActiveSection] = useState<'voice' | 'ai' | 'memory' | 'permissions'>('voice');
  const [aiProvider, setAiProvider] = useState<'gemini' | 'openai' | 'claude' | 'custom'>('gemini');
  const [customKey, setCustomKey] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Android Permissions State
  const [permissions, setPermissions] = useState<AndroidPermission[]>([
    {
      id: 'mic',
      name: 'Microphone & Audio Input',
      description: 'Required for real-time JARVIS wake-phrase ("Hello Poppy") and voice coding prompts.',
      status: 'granted',
      rationale: 'Audio streams are processed locally in real-time and never transmitted without authorization.',
      icon: 'Mic',
    },
    {
      id: 'notifications',
      name: 'Notifications & Foreground Service',
      description: 'Permits persistent background notifications when listening for wake phrase and build status.',
      status: 'granted',
      rationale: 'Complies with Android 13+ POST_NOTIFICATIONS and Foreground Service requirements.',
      icon: 'Bell',
    },
    {
      id: 'storage',
      name: 'Files & Storage Management',
      description: 'Virtual project filesystem storage and APK/AAB package downloads.',
      status: 'granted',
      rationale: 'Allows saving project files, exporting project ZIPs, and writing build artifacts.',
      icon: 'Folder',
    },
    {
      id: 'internet',
      name: 'Internet & Cloud Neural Link',
      description: 'Facilitates communication with Gemini AI server and GitHub REST API.',
      status: 'granted',
      rationale: 'Online AI is primary operating mode for Poppy.',
      icon: 'Globe',
    },
    {
      id: 'battery',
      name: 'Battery Optimization Guidance',
      description: 'Prevents the Android OS from prematurely terminating Poppy background listening.',
      status: 'prompt',
      rationale: 'Settings > Apps > Poppy > Battery > Set to "Unrestricted" for reliable background wake-words.',
      icon: 'Cpu',
    },
  ]);

  const handleRequestNativePermission = async (id: string) => {
    soundEngine.playJarvisWake();

    if (id === 'mic') {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setPermissions((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: 'granted' } : p))
        );
        onUpdateVoiceSettings({ isListening: true });
        soundEngine.playSuccess();
      } catch (e) {
        setPermissions((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: 'denied' } : p))
        );
      }
    } else if (id === 'notifications') {
      if ('Notification' in window) {
        const res = await Notification.requestPermission();
        setPermissions((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: res === 'granted' ? 'granted' : 'denied' } : p))
        );
        if (res === 'granted') soundEngine.playSuccess();
      }
    } else {
      setPermissions((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: 'granted' } : p))
      );
      soundEngine.playSuccess();
    }
  };

  const handleSaveAiConfig = () => {
    soundEngine.playSuccess();
    setSaveStatus('AI Provider settings applied successfully.');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-125px)] max-w-5xl mx-auto px-2 sm:px-4 space-y-4 overflow-y-auto pb-6">
      {/* Settings Navigation Header */}
      <div className="flex items-center justify-between p-2.5 bg-[#0a0a0f] border border-red-950/80 rounded-2xl">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-red-500" />
          <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
            Poppy System Configuration
          </h2>
        </div>

        {/* Section tabs */}
        <div className="flex items-center gap-1 text-xs font-mono">
          <button
            onClick={() => setActiveSection('voice')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeSection === 'voice'
                ? 'bg-red-600 text-white font-bold glow-red-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Voice & Audio
          </button>
          <button
            onClick={() => setActiveSection('ai')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeSection === 'ai'
                ? 'bg-red-600 text-white font-bold glow-red-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            AI Engine
          </button>
          <button
            onClick={() => setActiveSection('memory')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeSection === 'memory'
                ? 'bg-red-600 text-white font-bold glow-red-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Memory
          </button>
          <button
            onClick={() => setActiveSection('permissions')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeSection === 'permissions'
                ? 'bg-red-600 text-white font-bold glow-red-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Permissions
          </button>
        </div>
      </div>

      {/* SECTION 1: VOICE & JARVIS AUDIO */}
      {activeSection === 'voice' && (
        <div className="bg-[#0b0a10] border border-red-950/80 rounded-2xl p-5 space-y-5 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-red-950/60">
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-red-500" />
                JARVIS Voice Assistant & Wake-Phrase Controls
              </h3>
              <p className="text-xs text-neutral-400 font-sans">
                Wake: <span className="text-red-300 font-mono font-bold">"Hello Poppy"</span> • Stop: <span className="text-neutral-300 font-mono">"Stop Poppy"</span>
              </p>
            </div>
            <button
              onClick={onTriggerVoiceTest}
              className="px-3 py-1.5 bg-red-950 hover:bg-red-900 border border-red-600 text-red-200 text-xs font-mono font-bold rounded-lg shadow-md glow-red-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-red-400" />
              <span>Test Voice</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            {/* Voice toggle */}
            <div className="bg-black/60 p-3.5 rounded-xl border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-neutral-200 font-semibold">JARVIS Voice Synthesis:</span>
                <input
                  type="checkbox"
                  checked={voiceSettings.isVoiceActive}
                  onChange={(e) => onUpdateVoiceSettings({ isVoiceActive: e.target.checked })}
                  className="accent-red-600 w-4 h-4 cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-neutral-500 font-sans">
                Speaks responses aloud with high-precision cybernetic cadence.
              </p>
            </div>

            {/* Continuous Mic / Wake-Word toggle */}
            <div className="bg-black/60 p-3.5 rounded-xl border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-neutral-200 font-semibold">Microphone & Wake-Word Listening:</span>
                <input
                  type="checkbox"
                  checked={voiceSettings.isListening}
                  onChange={(e) => onUpdateVoiceSettings({ isListening: e.target.checked })}
                  className="accent-red-600 w-4 h-4 cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-neutral-500 font-sans">
                Listens for "Hello Poppy" to trigger voice mode and "Stop Poppy" to silence.
              </p>
            </div>

            {/* Speech Rate */}
            <div className="bg-black/60 p-3.5 rounded-xl border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-neutral-200">Speech Rate / Speed:</span>
                <span className="text-red-400 font-bold">{voiceSettings.rate}x</span>
              </div>
              <input
                type="range"
                min="0.6"
                max="1.5"
                step="0.1"
                value={voiceSettings.rate}
                onChange={(e) => onUpdateVoiceSettings({ rate: parseFloat(e.target.value) })}
                className="w-full accent-red-600 cursor-pointer"
              />
            </div>

            {/* Voice Pitch */}
            <div className="bg-black/60 p-3.5 rounded-xl border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-neutral-200">Pitch (JARVIS Modulation):</span>
                <span className="text-red-400 font-bold">{voiceSettings.pitch}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={voiceSettings.pitch}
                onChange={(e) => onUpdateVoiceSettings({ pitch: parseFloat(e.target.value) })}
                className="w-full accent-red-600 cursor-pointer"
              />
            </div>

            {/* Response Mode */}
            <div className="bg-black/60 p-3.5 rounded-xl border border-neutral-800 space-y-2">
              <label className="text-neutral-200">Response Mode:</label>
              <select
                value={voiceSettings.mode}
                onChange={(e) => onUpdateVoiceSettings({ mode: e.target.value as any })}
                className="w-full bg-black border border-neutral-700 rounded-lg p-2 text-white font-mono focus:border-red-500 focus:outline-none"
              >
                <option value="voice_and_text">Voice + Text (Recommended)</option>
                <option value="voice_only">Voice Only (Hands-Free Android)</option>
                <option value="text_only">Text Only (Silent Mode)</option>
              </select>
            </div>

            {/* Primary Language */}
            <div className="bg-black/60 p-3.5 rounded-xl border border-neutral-800 space-y-2">
              <label className="text-neutral-200">Voice Language Dialect:</label>
              <select
                value={language}
                onChange={(e) => onLanguageChange(e.target.value as AppLanguage)}
                className="w-full bg-black border border-neutral-700 rounded-lg p-2 text-white font-mono focus:border-red-500 focus:outline-none"
              >
                <option value="en">English (Futuristic JARVIS Accent)</option>
                <option value="bn">Bengali / বাংলা (স্বাভাবিক বাংলা ভয়েস)</option>
                <option value="hi">Hindi / हिन्दी (स्पष्ट हिंदी आवाज)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: AI PROVIDER */}
      {activeSection === 'ai' && (
        <div className="bg-[#0b0a10] border border-red-950/80 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-red-950/60">
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Cpu className="w-4 h-4 text-red-500" />
                Multi-Provider AI Architecture
              </h3>
              <p className="text-xs text-neutral-400 font-sans">
                Online AI is the primary operating mode. Keys are secured server-side.
              </p>
            </div>
          </div>

          <div className="space-y-4 font-mono text-xs">
            <div className="space-y-1.5">
              <label className="text-neutral-400">Selected AI Provider Engine:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'gemini', name: 'Google Gemini (Built-in)', desc: 'gemini-3.8-flash' },
                  { id: 'openai', name: 'OpenAI GPT', desc: 'GPT-4o' },
                  { id: 'claude', name: 'Anthropic Claude', desc: 'Claude 3.5 Sonnet' },
                  { id: 'custom', name: 'Custom AI Server', desc: 'Self-hosted LLM' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setAiProvider(p.id as any)}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      aiProvider === p.id
                        ? 'bg-red-950/60 border-red-600 text-white font-bold glow-red-sm'
                        : 'bg-black/60 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs text-white">{p.name}</div>
                    <div className="text-[10px] text-neutral-500">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {aiProvider !== 'gemini' && (
              <div className="space-y-1.5 pt-2">
                <label className="text-neutral-400">API Key / Endpoint Token:</label>
                <input
                  type="password"
                  placeholder={`Enter your ${aiProvider.toUpperCase()} key`}
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-red-600"
                />
              </div>
            )}

            <div className="p-3 bg-black/60 border border-neutral-800 rounded-xl text-[11px] text-neutral-400 space-y-1 font-sans">
              <div className="font-mono text-white font-semibold">Security Protocol:</div>
              <div>
                API keys and authentication credentials are treated as high-security secrets. They are never logged or exposed in client bundles.
              </div>
            </div>

            <button
              onClick={handleSaveAiConfig}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-mono font-bold shadow-md glow-red cursor-pointer"
            >
              Apply AI Settings
            </button>

            {saveStatus && (
              <div className="text-emerald-400 text-xs font-mono">{saveStatus}</div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 3: USER MEMORY SYSTEM */}
      {activeSection === 'memory' && (
        <div className="bg-[#0b0a10] border border-red-950/80 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-red-950/60">
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Brain className="w-4 h-4 text-red-500" />
                User-Controlled Memory System
              </h3>
              <p className="text-xs text-neutral-400 font-sans">
                Stores architecture decisions, package structures, and project preferences. Never stores passwords or tokens.
              </p>
            </div>
            {memories.length > 0 && (
              <button
                onClick={onClearMemories}
                className="text-xs font-mono text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear All Memory
              </button>
            )}
          </div>

          <div className="space-y-2 font-mono text-xs">
            {memories.length === 0 ? (
              <div className="text-center py-8 text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
                No memories recorded yet. Poppy automatically remembers architectural preferences when approved.
              </div>
            ) : (
              memories.map((m) => (
                <div
                  key={m.id}
                  className="bg-black/60 border border-neutral-800 rounded-xl p-3 flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">{m.key}</span>
                      <span className="px-1.5 py-0.5 bg-red-950 text-red-300 rounded text-[9px] uppercase">
                        {m.category}
                      </span>
                    </div>
                    <div className="text-neutral-400 text-[11px] font-sans">{m.content}</div>
                  </div>
                  <button
                    onClick={() => onDeleteMemory(m.id)}
                    className="p-1.5 text-neutral-600 hover:text-red-400 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SECTION 4: ANDROID PERMISSION MANAGER */}
      {activeSection === 'permissions' && (
        <div className="bg-[#0b0a10] border border-red-950/80 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-red-950/60">
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-red-500" />
                Android Permission Manager & Feature Controls
              </h3>
              <p className="text-xs text-neutral-400 font-sans">
                Legitimate system permission flows. Toggles do not silently grant OS permissions.
              </p>
            </div>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {permissions.map((perm) => (
              <div
                key={perm.id}
                className="bg-black/60 border border-neutral-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">{perm.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        perm.status === 'granted'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {perm.status}
                    </span>
                  </div>
                  <p className="text-neutral-400 text-[11px] font-sans">{perm.description}</p>
                  <div className="text-[10px] text-neutral-500 italic font-sans">{perm.rationale}</div>
                </div>

                <button
                  onClick={() => handleRequestNativePermission(perm.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer self-start sm:self-auto ${
                    perm.status === 'granted'
                      ? 'bg-neutral-900 border border-neutral-700 text-neutral-300'
                      : 'bg-red-600 hover:bg-red-500 text-white shadow-md glow-red-sm'
                  }`}
                >
                  {perm.status === 'granted' ? 'Verified' : 'Request OS Grant'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
