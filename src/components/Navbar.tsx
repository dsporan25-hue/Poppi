import React from 'react';
import { AppLanguage, VoiceSettings } from '../types';
import { Mic, MicOff, Volume2, Sparkles, Terminal, Shield, Globe } from 'lucide-react';

interface NavbarProps {
  language: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
  voiceSettings: VoiceSettings;
  onToggleVoice: () => void;
  onToggleMic: () => void;
  onTriggerVoiceTest: () => void;
  onTriggerQuickBuild: () => void;
  activeTab: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onLanguageChange,
  voiceSettings,
  onToggleVoice,
  onToggleMic,
  onTriggerVoiceTest,
  onTriggerQuickBuild,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#07070b]/95 backdrop-blur-md border-b border-red-950/80 px-4 py-2.5 flex items-center justify-between">
      {/* Brand & Developer Info */}
      <div className="flex items-center space-x-3">
        <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-red-950 border border-red-500 shadow-md glow-red-sm">
          <span className="font-extrabold text-sm text-white tracking-widest font-mono">P</span>
          <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
        </div>

        <div>
          <div className="flex items-center space-x-2">
            <span className="text-base font-black tracking-wider text-white font-mono text-glow-red">
              POPPY <span className="text-red-500">AI</span>
            </span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono uppercase bg-red-950/80 text-red-300 border border-red-700/60 rounded">
              Android v4.2
            </span>
          </div>
          <div className="text-[10px] text-neutral-400 font-mono flex items-center gap-1.5">
            <span className="text-red-400">Poran Studio</span>
            <span className="text-neutral-600">•</span>
            <span className="text-neutral-300">Md Saiful Islam Poran</span>
          </div>
        </div>
      </div>

      {/* Center status: Wake phrase listener status */}
      <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-black/60 border border-red-950 rounded-full text-xs font-mono">
        <div className={`w-2 h-2 rounded-full ${voiceSettings.isListening ? 'bg-red-500 animate-pulse glow-red-sm' : 'bg-neutral-600'}`} />
        <span className="text-neutral-400">Wake:</span>
        <span className="text-red-300 font-semibold">"Hello Poppy"</span>
        <span className="text-neutral-600">|</span>
        <span className="text-neutral-400">Stop:</span>
        <span className="text-neutral-300">"Stop Poppy"</span>
      </div>

      {/* Controls & Quick Actions */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Quick Build Action */}
        <button
          onClick={onTriggerQuickBuild}
          title="Compile and package Android APK"
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-red-950/60 hover:bg-red-900/80 border border-red-600/70 text-red-200 text-xs font-mono font-medium rounded-lg transition glow-red-sm cursor-pointer"
        >
          <Terminal className="w-3.5 h-3.5 text-red-400" />
          <span>Build APK</span>
        </button>

        {/* Voice Synth Toggle & Test */}
        <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-lg p-0.5">
          <button
            onClick={onToggleMic}
            title={voiceSettings.isListening ? 'Microphone Active (Listening for wake word)' : 'Microphone Muted'}
            className={`p-1.5 rounded-md transition cursor-pointer ${
              voiceSettings.isListening
                ? 'bg-red-600 text-white glow-red-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {voiceSettings.isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>

          <button
            onClick={onToggleVoice}
            title={voiceSettings.isVoiceActive ? 'JARVIS Voice Synthesis Enabled' : 'Voice Synthesis Muted'}
            className={`p-1.5 rounded-md transition cursor-pointer ${
              voiceSettings.isVoiceActive
                ? 'text-red-400 hover:text-red-300'
                : 'text-neutral-600 hover:text-neutral-400'
            }`}
          >
            <Volume2 className="w-4 h-4" />
          </button>

          <button
            onClick={onTriggerVoiceTest}
            title="Test JARVIS Voice Audio Synthesis"
            className="p-1.5 text-neutral-400 hover:text-red-400 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Language Switcher (Bengali, Hindi, English) */}
        <div className="relative flex items-center bg-neutral-950 border border-neutral-800 rounded-lg p-1 text-xs font-mono">
          <Globe className="w-3.5 h-3.5 text-red-400 mr-1.5 hidden sm:inline" />
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as AppLanguage)}
            className="bg-transparent text-neutral-200 font-mono text-xs focus:outline-none cursor-pointer pr-1"
          >
            <option value="en" className="bg-neutral-950 text-neutral-100">EN (English)</option>
            <option value="bn" className="bg-neutral-950 text-neutral-100">BN (বাংলা)</option>
            <option value="hi" className="bg-neutral-950 text-neutral-100">HI (हिन्दी)</option>
          </select>
        </div>
      </div>
    </header>
  );
};
