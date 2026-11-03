import React, { useState } from 'react';
import { NavTab, ProjectFile, BuildArtifact, AppLanguage } from '../types';
import { 
  Sparkles, 
  Terminal, 
  Code2, 
  FolderGit2, 
  GitBranch, 
  Upload, 
  Image as ImageIcon, 
  CheckCircle2, 
  Cpu, 
  ShieldAlert, 
  Play, 
  ExternalLink,
  Layers
} from 'lucide-react';

interface HomeViewProps {
  onNavigate: (tab: NavTab) => void;
  files: ProjectFile[];
  artifacts: BuildArtifact[];
  language: AppLanguage;
  onTriggerVoiceTest: () => void;
  onTriggerQuickBuild: () => void;
}

// User-defined anime girl avatar (Official Poppy AI Character)
const AVATAR_PRESETS = [
  {
    id: 'poppy-official',
    name: 'Poppy Anime Character (Official)',
    svgUrl: '/poppy-avatar.png',
  },
  {
    id: 'cyber-valkyrie',
    name: 'Valkyrie Red (Alternative)',
    svgUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 700" width="100%" height="100%"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231a060a"/><stop offset="100%" stop-color="%2308080c"/></linearGradient><linearGradient id="armor" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231f1f28"/><stop offset="100%" stop-color="%230f0f14"/></linearGradient><linearGradient id="redNeon" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="%23ff2a4b"/><stop offset="100%" stop-color="%23e60026"/></linearGradient></defs><rect width="400" height="700" fill="url(%23bg)"/><circle cx="200" cy="180" r="140" fill="none" stroke="%23ff2a4b" stroke-width="1.5" stroke-dasharray="6,6" opacity="0.3"/><path d="M170 330 Q200 370 230 330 L250 560 L150 560 Z" fill="url(%23armor)" stroke="%23ff2a4b" stroke-width="1.5"/><circle cx="200" cy="300" r="8" fill="%23ff2a4b"/><polygon points="160,145 240,145 230,162 170,162" fill="%23ff2a4b" opacity="0.85"/><text x="200" y="650" font-family="monospace" font-size="12" fill="%23ff2a4b" text-anchor="middle" letter-spacing="4">POPPY // CORE</text></svg>',
  },
];

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  files,
  artifacts,
  language,
  onTriggerVoiceTest,
  onTriggerQuickBuild,
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState<string>('/poppy-avatar.png');
  const [showImageModal, setShowImageModal] = useState<boolean>(false);
  const [customImageUrl, setCustomImageUrl] = useState<string>('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedAvatar(event.target.result as string);
          setShowImageModal(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyCustomUrl = () => {
    if (customImageUrl.trim()) {
      setSelectedAvatar(customImageUrl.trim());
      setShowImageModal(false);
    }
  };

  return (
    <div className="min-h-full pb-20 pt-2 px-3 sm:px-6 max-w-6xl mx-auto space-y-6">
      {/* Top Banner / System HUD */}
      <div className="relative overflow-hidden bg-gradient-to-r from-red-950/40 via-[#120a0d] to-black border border-red-600/30 rounded-2xl p-5 shadow-xl glow-red-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse glow-red-sm" />
              <span className="text-xs font-mono uppercase tracking-widest text-red-400">
                Cybernetic Neural Core Online
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-mono text-glow-red">
              POPPY <span className="text-red-500">AI</span>
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 font-sans max-w-xl">
              {language === 'bn'
                ? 'মোঃ সাইফুল ইসলাম পরান (Poran Studio) দ্বারা নির্মিত ব্যক্তিগত অ্যান্ড্রয়েড এআই কোডিং সহকারী ও গিটহাব প্ল্যাটফর্ম।'
                : language === 'hi'
                ? 'मोहम्मद सैफुल इस्लाम पोरान (Poran Studio) द्वारा निर्मित पर्सनल एंड्रॉइड एआई कोडिंग असिस्टेंट एवं गिटहब प्लेटफॉर्म।'
                : 'Personal AI Coding Assistant and GitHub Development Platform engineered by Md Saiful Islam Poran (Poran Studio).'}
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => onNavigate('coding')}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold rounded-xl shadow-lg glow-red transition cursor-pointer"
            >
              <Code2 className="w-4 h-4" />
              Launch IDE
            </button>
            <button
              onClick={() => onNavigate('chat')}
              className="flex items-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-red-950 text-neutral-200 text-xs font-mono font-semibold rounded-xl transition cursor-pointer"
            >
              <Terminal className="w-4 h-4 text-red-400" />
              Open AI Chat
            </button>
          </div>
        </div>

        {/* Ambient background grid */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ff2a4b_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      </div>

      {/* Main Grid: Static Anime Girl Avatar on Left, System Metrics & Capabilities on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Full-Body Static Anime Girl Avatar */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full relative bg-[#09080e] border border-red-600/40 rounded-2xl p-4 shadow-xl overflow-hidden flex flex-col items-center group">
            {/* Header info */}
            <div className="w-full flex items-center justify-between pb-3 border-b border-red-950/60 mb-2 font-mono text-xs">
              <span className="text-red-400 font-bold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-red-500" />
                POPPY AVATAR
              </span>
              <button
                onClick={() => setShowImageModal(true)}
                className="text-[11px] text-neutral-300 hover:text-white bg-red-950/50 hover:bg-red-900/60 border border-red-800/60 px-2 py-0.5 rounded transition flex items-center gap-1 cursor-pointer"
              >
                <ImageIcon className="w-3 h-3 text-red-400" />
                Replace Image
              </button>
            </div>

            {/* Static Full-Body Anime Image (Strictly no walking, no erratic mouth movement as required) */}
            <div className="relative w-full aspect-[9/14] max-h-[500px] rounded-xl overflow-hidden bg-black/80 border border-red-950 flex items-center justify-center">
              <img
                src={selectedAvatar}
                alt="Poppy AI Static Anime Avatar"
                className="w-full h-full object-contain select-none"
              />

              {/* Watermark badge at corner */}
              <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-sm border border-red-900/60 px-2 py-0.5 rounded text-[9px] font-mono text-red-300">
                PORAN STUDIO // STATIC UNIT
              </div>
            </div>

            {/* Quick status bar beneath avatar */}
            <div className="w-full mt-3 pt-2 border-t border-red-950/60 flex items-center justify-between text-[11px] font-mono text-neutral-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Status: Ready
              </span>
              <button
                onClick={onTriggerVoiceTest}
                className="text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
              >
                <Play className="w-3 h-3" /> Voice Synth Test
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Core Operations & System Metrics */}
        <div className="lg:col-span-7 space-y-4">
          {/* Active Project Card */}
          <div className="bg-[#0b0a10] border border-red-950/80 rounded-2xl p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-red-500" />
                  Active Project: <span className="text-red-400">POPPY (Android)</span>
                </h2>
                <p className="text-xs text-neutral-400 font-mono">
                  Package: <span className="text-neutral-200">com.poran.poppy</span> • Target SDK: 35
                </p>
              </div>
              <span className="px-2.5 py-1 bg-red-950 text-red-300 border border-red-700/60 text-xs font-mono rounded-lg">
                Kotlin 2.0
              </span>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="bg-black/60 border border-neutral-800 rounded-xl p-3">
                <div className="text-neutral-500 text-[10px]">PROJECT FILES</div>
                <div className="text-lg font-bold text-white mt-0.5">{files.length} Files</div>
              </div>
              <div className="bg-black/60 border border-neutral-800 rounded-xl p-3">
                <div className="text-neutral-500 text-[10px]">BUILD ARTIFACTS</div>
                <div className="text-lg font-bold text-red-400 mt-0.5">{artifacts.length} Packages</div>
              </div>
              <div className="bg-black/60 border border-neutral-800 rounded-xl p-3">
                <div className="text-neutral-500 text-[10px]">GRADLE STATUS</div>
                <div className="text-lg font-bold text-emerald-400 mt-0.5">READY</div>
              </div>
              <div className="bg-black/60 border border-neutral-800 rounded-xl p-3">
                <div className="text-neutral-500 text-[10px]">SECURITY LEVEL</div>
                <div className="text-lg font-bold text-red-500 mt-0.5">STRICT</div>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex items-center flex-wrap gap-2 pt-2 border-t border-neutral-800/80">
              <button
                onClick={onTriggerQuickBuild}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/80 hover:bg-red-900 border border-red-600 text-red-200 rounded-lg text-xs font-mono transition cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5" />
                Assemble Debug APK
              </button>
              <button
                onClick={() => onNavigate('github')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 rounded-lg text-xs font-mono transition cursor-pointer"
              >
                <GitBranch className="w-3.5 h-3.5 text-red-400" />
                GitHub Repository
              </button>
              <button
                onClick={() => onNavigate('files')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 rounded-lg text-xs font-mono transition cursor-pointer"
              >
                <FolderGit2 className="w-3.5 h-3.5 text-neutral-400" />
                Explore Project Files
              </button>
            </div>
          </div>

          {/* Core Architecture Capabilities (Prompt Spec 3.A-E) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-[#0b0a10] border border-red-950/60 rounded-xl p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-white font-mono text-sm font-semibold">
                <Code2 className="w-4 h-4 text-red-500" />
                AI Android Architect
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Generates full multi-file Jetpack Compose architectures, Gradle DSL, and Android Manifest with Kotlin 2.0.
              </p>
            </div>

            <div className="bg-[#0b0a10] border border-red-950/60 rounded-xl p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-white font-mono text-sm font-semibold">
                <GitBranch className="w-4 h-4 text-red-500" />
                GitHub Platform
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                OAuth & PAT connection, repo browser, branch manager, and user-approved commits with diff preview.
              </p>
            </div>

            <div className="bg-[#0b0a10] border border-red-950/60 rounded-xl p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-white font-mono text-sm font-semibold">
                <Terminal className="w-4 h-4 text-red-500" />
                Android Build System
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Packages Debug APK, Release APK, and AAB with genuine SHA-256 hashes, build logs, and install guides.
              </p>
            </div>

            <div className="bg-[#0b0a10] border border-red-950/60 rounded-xl p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-white font-mono text-sm font-semibold">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                Permission & Approval
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Poppy never pushes code, deletes files, or compiles binaries without your explicit, auditable authorization.
              </p>
            </div>
          </div>

          {/* Developer Attribution Card */}
          <div className="bg-gradient-to-r from-red-950/30 to-black border border-red-950 rounded-xl p-4 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-neutral-500">ENGINEERED BY: </span>
              <span className="text-red-300 font-bold">Md Saiful Islam Poran</span>
              <div className="text-neutral-400 text-[11px]">STUDIO: Poran Studio • All Systems Validated</div>
            </div>
            <div className="px-2 py-1 bg-red-950/60 border border-red-600/40 rounded text-red-400 text-[10px]">
              PORAN CORE
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Replace Anime Girl Image */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#0d0a0e] border-2 border-red-600/70 rounded-2xl p-6 space-y-4 shadow-2xl glow-red">
            <div className="flex justify-between items-center pb-2 border-b border-red-950">
              <h3 className="text-base font-bold text-white font-mono">
                Customize Poppy Avatar
              </h3>
              <button
                onClick={() => setShowImageModal(false)}
                className="text-neutral-400 hover:text-white font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Select one of the built-in static anime girl presets, paste an image link, or upload your own image.
            </p>

            {/* Presets */}
            <div className="space-y-2">
              <div className="text-xs font-mono text-neutral-400 uppercase">Presets:</div>
              <div className="grid grid-cols-2 gap-2">
                {AVATAR_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setSelectedAvatar(preset.svgUrl);
                      setShowImageModal(false);
                    }}
                    className="p-2 bg-neutral-900 hover:bg-red-950/50 border border-neutral-700 hover:border-red-600 rounded-xl text-left text-xs font-mono text-neutral-200 transition cursor-pointer"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Image URL */}
            <div className="space-y-1.5 pt-2 border-t border-neutral-800">
              <label className="text-xs font-mono text-neutral-400">Direct Image URL:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://example.com/avatar.png"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  className="flex-1 bg-black border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-red-500 focus:outline-none"
                />
                <button
                  onClick={handleApplyCustomUrl}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-mono font-bold cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Local File Upload */}
            <div className="space-y-1.5 pt-2 border-t border-neutral-800">
              <label className="text-xs font-mono text-neutral-400">Or Upload from Device:</label>
              <label className="flex items-center justify-center gap-2 p-3 bg-neutral-900 hover:bg-neutral-800 border border-dashed border-red-700/60 rounded-xl cursor-pointer text-xs font-mono text-neutral-300 transition">
                <Upload className="w-4 h-4 text-red-400" />
                <span>Select Anime Girl Image (PNG/JPG/SVG)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
