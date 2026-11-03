import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, AppLanguage, ProjectFile } from '../types';
import { 
  Send, 
  Mic, 
  MicOff, 
  Paperclip, 
  Copy, 
  Check, 
  Code2, 
  Sparkles, 
  Terminal, 
  Loader2, 
  Volume2, 
  Trash2,
  FileText
} from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface ChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, attachmentName?: string) => Promise<void>;
  isLoading: boolean;
  language: AppLanguage;
  onSpeakText: (text: string) => void;
  onClearHistory: () => void;
  onApplyCodeToProject?: (filePath: string, code: string) => void;
  activeProjectFiles: ProjectFile[];
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  onSendMessage,
  isLoading,
  language,
  onSpeakText,
  onClearHistory,
  onApplyCodeToProject,
}) => {
  const [inputText, setInputText] = useState('');
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if ((!inputText.trim() && !attachedFileName) || isLoading) return;
    const msg = inputText.trim();
    const att = attachedFileName || undefined;
    setInputText('');
    setAttachedFileName(null);
    soundEngine.playJarvisWake();
    await onSendMessage(msg, att);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFileName(file.name);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Quick suggestion prompts based on selected language
  const promptSuggestions = language === 'bn' ? [
    { title: 'জেটপ্যাক কম্পোজ লগইন', prompt: 'অ্যান্ড্রয়েডে একটি আধুনিক জেটপ্যাক কম্পোজ লগইন এবং সাইনআপ স্ক্রিন তৈরি করো।' },
    { title: 'ব্যাকগ্রাউন্ড সার্ভিস আর্কিটেকচার', prompt: 'অ্যান্ড্রয়েড ১৪+ এর জন্য কম্প্লায়েন্ট ফোরগ্রাউন্ড মাইক্রোফোন সার্ভিস কীভাবে লিখবো?' },
    { title: 'রিলিজ APK বিল্ড চেক', prompt: 'বর্তমান অ্যান্ড্রয়েড প্রজেক্টের বিল্ড আর্কিটেকচার পর্যালোচনা করো।' }
  ] : language === 'hi' ? [
    { title: 'जेटपैक कंपोज़ यूआई', prompt: 'एक आधुनिक जेटपैक कंपोज़ एंड्रॉइड यूआई स्क्रीन बनाइये।' },
    { title: 'बैकग्राउंड सर्विस गाइड', prompt: 'एंड्रॉइड में बैकग्राउंड ऑडियो और वेक-वर्ड सर्विस कैसे सेटअप करें?' },
    { title: 'गिटहब पुल रिक्वेस्ट', prompt: 'परियोजना कोड का विश्लेषण करें और गिटहब कमिट संदेश तैयार करें।' }
  ] : [
    { title: 'Jetpack Compose Screen', prompt: 'Create a state-driven Jetpack Compose Dashboard with Material 3 and Flow.' },
    { title: 'Foreground Service Arch', prompt: 'Generate Android 14+ compliant Foreground Service for microphone and notification management.' },
    { title: 'Analyze Project Architecture', prompt: 'Review our current Android project architecture and recommend production optimizations.' }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-125px)] max-w-5xl mx-auto px-2 sm:px-4">
      {/* Top action bar */}
      <div className="flex items-center justify-between py-2 px-3 bg-[#0a0a0f] border border-red-950/80 rounded-xl mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse glow-red-sm" />
          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            Poppy Neural Link
          </span>
          <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
            {language.toUpperCase()} • JARVIS AUDIO ACTIVE
          </span>
        </div>

        <button
          onClick={onClearHistory}
          className="text-xs font-mono text-neutral-400 hover:text-red-400 flex items-center gap-1 transition cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clear Chat</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
            >
              <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500 px-1">
                <span>{isUser ? 'YOU (DEVELOPER)' : 'POPPY AI'}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>

              <div
                className={`max-w-[90%] sm:max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-red-950/40 border border-red-600/60 text-white rounded-tr-none'
                    : 'bg-[#0f0e15] border border-neutral-800 text-neutral-200 rounded-tl-none shadow-lg'
                }`}
              >
                {msg.attachmentName && (
                  <div className="flex items-center gap-1.5 mb-2 px-2.5 py-1 bg-black/60 border border-red-900/50 rounded-lg text-xs font-mono text-red-300">
                    <Paperclip className="w-3 h-3 text-red-400" />
                    <span>Attached: {msg.attachmentName}</span>
                  </div>
                )}

                {/* Message text with basic markdown & code rendering */}
                <div className="whitespace-pre-wrap font-sans">
                  {msg.content.split('```').map((part, index) => {
                    if (index % 2 === 1) {
                      // Code block
                      const lines = part.trim().split('\n');
                      const firstLine = lines[0].trim();
                      const codeLanguage = firstLine.match(/^[a-z]+/i) ? firstLine : 'kotlin';
                      const codeBody = firstLine.match(/^[a-z]+/i) ? lines.slice(1).join('\n') : part;

                      return (
                        <div key={index} className="my-3 bg-black/90 border border-red-950 rounded-xl overflow-hidden font-mono text-xs">
                          <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-950 border-b border-red-950/60 text-[11px] text-neutral-400">
                            <span className="text-red-400 uppercase font-semibold">{codeLanguage}</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => copyToClipboard(codeBody, `${msg.id}-${index}`)}
                                className="flex items-center gap-1 hover:text-white transition cursor-pointer"
                              >
                                {copiedId === `${msg.id}-${index}` ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span className="text-emerald-400">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                          <pre className="p-3 overflow-x-auto text-neutral-200 leading-normal selection:bg-red-800 selection:text-white">
                            {codeBody}
                          </pre>
                        </div>
                      );
                    }
                    return <span key={index}>{part}</span>;
                  })}
                </div>

                {/* Voice repeat button for assistant */}
                {!isUser && (
                  <div className="mt-3 pt-2 border-t border-neutral-800/60 flex items-center justify-between text-[11px] font-mono text-neutral-400">
                    <span className="text-red-400 text-[10px]">JARVIS NEURAL SYNTHESIS</span>
                    <button
                      onClick={() => onSpeakText(msg.content)}
                      className="flex items-center gap-1 hover:text-red-300 transition cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      Speak Output
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center space-x-2 text-xs font-mono text-red-400 bg-[#0f0e15] border border-red-950 p-3 rounded-2xl w-fit">
            <Loader2 className="w-4 h-4 animate-spin text-red-500" />
            <span>Poppy is synthesizing response & architecture...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts if few messages */}
      {messages.length <= 2 && (
        <div className="py-2 flex items-center gap-2 overflow-x-auto text-xs font-mono">
          <span className="text-neutral-500 text-[10px] uppercase flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-red-400" /> Quick:
          </span>
          {promptSuggestions.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputText(item.prompt);
              }}
              className="px-2.5 py-1 bg-[#120f17] hover:bg-red-950/40 border border-neutral-800 hover:border-red-600 rounded-lg text-neutral-300 hover:text-white whitespace-nowrap transition cursor-pointer"
            >
              {item.title}
            </button>
          ))}
        </div>
      )}

      {/* Input Box */}
      <div className="mt-2 bg-[#0c0a10] border border-red-950 rounded-2xl p-2.5 focus-within:border-red-600 transition shadow-lg">
        {attachedFileName && (
          <div className="flex items-center justify-between px-3 py-1 bg-black/60 border border-red-900/40 rounded-lg text-xs font-mono text-red-300 mb-2">
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-red-400" />
              <span>{attachedFileName}</span>
            </div>
            <button
              onClick={() => setAttachedFileName(null)}
              className="text-neutral-400 hover:text-red-400 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex items-end gap-2">
          {/* File attachment button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileAttach}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Attach code file, PDF, or image"
            className="p-2 text-neutral-400 hover:text-red-400 rounded-xl hover:bg-neutral-900 transition cursor-pointer"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              language === 'bn'
                ? 'Poppy কে আপনার অ্যান্ড্রয়েড নির্দেশ দিন (বা "Hello Poppy" বলুন)...'
                : language === 'hi'
                ? 'Poppy को अपना निर्देश दें (या "Hello Poppy" बोलें)...'
                : 'Instruct Poppy in natural language or speak "Hello Poppy"...'
            }
            rows={2}
            className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder-neutral-500 resize-none focus:outline-none font-sans"
          />

          <button
            onClick={handleSend}
            disabled={(!inputText.trim() && !attachedFileName) || isLoading}
            className={`p-2.5 rounded-xl font-bold transition flex items-center justify-center cursor-pointer ${
              (inputText.trim() || attachedFileName) && !isLoading
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg glow-red'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
