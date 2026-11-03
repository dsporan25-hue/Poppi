import React, { useState, useEffect, useRef } from 'react';
import { 
  NavTab, 
  AppLanguage, 
  ProjectFile, 
  BuildArtifact, 
  ApprovalRequest, 
  ChatMessage, 
  VoiceSettings, 
  MemoryItem 
} from './types';
import { INITIAL_PROJECT_FILES, DEFAULT_ANDROID_PROJECT_NAME } from './data/defaultAndroidProject';
import { Navbar } from './components/Navbar';
import { Navigation } from './components/Navigation';
import { ApprovalModal } from './components/ApprovalModal';
import { HomeView } from './views/HomeView';
import { ChatView } from './views/ChatView';
import { CodingView } from './views/CodingView';
import { MessagesView } from './views/MessagesView';
import { GitHubView } from './views/GitHubView';
import { FilesView } from './views/FilesView';
import { SettingsView } from './views/SettingsView';
import { BuildAndTestModal } from './views/BuildAndTestModal';
import { VoiceManager, soundEngine } from './utils/audio';
import { generateAndroidArtifact } from './utils/crypto';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [language, setLanguage] = useState<AppLanguage>('en');
  const [files, setFiles] = useState<ProjectFile[]>(INITIAL_PROJECT_FILES);
  const [activeFilePath, setActiveFilePath] = useState<string>('app/src/main/java/com/poran/poppy/MainActivity.kt');
  const [artifacts, setArtifacts] = useState<BuildArtifact[]>([]);
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);
  const [activeApprovalRequest, setActiveApprovalRequest] = useState<ApprovalRequest | null>(null);
  const [isTestModalOpen, setIsTestModalOpen] = useState<boolean>(false);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  // User-Controlled Memory System
  const [memories, setMemories] = useState<MemoryItem[]>([
    {
      id: 'mem-1',
      key: 'Primary Architecture',
      category: 'architecture',
      content: 'Android Jetpack Compose + MVVM + Clean Architecture + Kotlin 2.0 DSL',
      timestamp: '2026-11-03',
    },
    {
      id: 'mem-2',
      key: 'Studio Identity',
      category: 'preference',
      content: 'Created by Md Saiful Islam Poran (Poran Studio) with Black & Red Neon theme',
      timestamp: '2026-11-03',
    },
  ]);

  // Voice Settings State
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    isListening: false,
    isVoiceActive: true,
    volume: 1.0,
    rate: 1.0,
    pitch: 0.9, // Deep futuristic JARVIS tone
    language: 'en',
    gender: 'male',
    mode: 'voice_and_text',
    wakePhraseEnabled: true,
  });

  // Chat conversation
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init-1',
      role: 'assistant',
      content: 'Greetings. I am POPPY AI, your Personal Android AI Coding Assistant engineered by Md Saiful Islam Poran (Poran Studio). Neural core online, Gradle daemon standby. How may I advance our Android codebase today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const voiceManagerRef = useRef<VoiceManager | null>(null);

  // Initialize Voice Manager
  useEffect(() => {
    voiceManagerRef.current = new VoiceManager(
      voiceSettings,
      () => {
        // Wake-phrase detected ("Hello Poppy")
        soundEngine.playJarvisWake();
        setCurrentTab('chat');
        speakResponse('Poppy listening. State your directive.');
      },
      () => {
        // Stop-phrase detected ("Stop Poppy")
        soundEngine.playAlert();
        if (activeApprovalRequest && activeApprovalRequest.status === 'in_progress') {
          handleCancelApproval(activeApprovalRequest.id);
        }
      },
      (transcript) => {
        // Voice speech transcript received
        handleSendMessage(transcript);
      }
    );

    return () => {
      voiceManagerRef.current?.stopListening();
    };
  }, []);

  // Sync voice manager when settings change
  useEffect(() => {
    if (voiceManagerRef.current) {
      voiceManagerRef.current.updateSettings(voiceSettings);
      if (voiceSettings.isListening) {
        voiceManagerRef.current.startListening();
      } else {
        voiceManagerRef.current.stopListening();
      }
    }
  }, [voiceSettings]);

  const speakResponse = (text: string) => {
    if (voiceSettings.isVoiceActive && voiceManagerRef.current) {
      voiceManagerRef.current.speak(text, language);
    }
  };

  // Trigger JARVIS Voice Audio Test
  const handleTriggerVoiceTest = () => {
    soundEngine.playJarvisWake();
    const testLines: Record<AppLanguage, string> = {
      en: 'Poppy AI audio synthesis online. All Gradle build subsystems and GitHub conduits are operational, Commander.',
      bn: 'পপি এআই অডিও সিন্থেসিস অনলাইন। মোঃ সাইফুল ইসলাম পরান (Poran Studio) দ্বারা সমস্ত অ্যান্ড্রয়েড সিস্টেম প্রস্তুত।',
      hi: 'पॉपी एआई ऑडियो सिंथेसिस ऑनलाइन। मोहम्मद सैफुल इस्लाम पोरान द्वारा सभी एंड्रॉइड सिस्टम तैयार हैं।',
    };
    speakResponse(testLines[language]);
  };

  // Toggle Voice & Mic
  const handleToggleVoice = () => {
    setVoiceSettings((prev) => {
      const nextVal = !prev.isVoiceActive;
      if (!nextVal && voiceManagerRef.current) {
        voiceManagerRef.current.stopSpeaking();
      }
      return { ...prev, isVoiceActive: nextVal };
    });
  };

  const handleToggleMic = () => {
    setVoiceSettings((prev) => {
      const nextVal = !prev.isListening;
      soundEngine.playJarvisWake();
      return { ...prev, isListening: nextVal };
    });
  };

  // Mandatory Permission & Approval System
  const handleRequestApproval = (reqData: Omit<ApprovalRequest, 'id' | 'createdAt' | 'status'>) => {
    const newRequest: ApprovalRequest = {
      ...reqData,
      id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'pending',
      progress: 0,
    };

    setApprovalRequests((prev) => [newRequest, ...prev]);
    setActiveApprovalRequest(newRequest);
    soundEngine.playAlert();
  };

  const handleApprove = async (id: string) => {
    const target = approvalRequests.find((r) => r.id === id);
    if (!target) return;

    // Transition to in_progress
    setApprovalRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'in_progress', progress: 25 } : r))
    );
    if (activeApprovalRequest?.id === id) {
      setActiveApprovalRequest((prev) =>
        prev ? { ...prev, status: 'in_progress', progress: 25 } : null
      );
    }

    // Step progression
    if (target.steps && target.steps.length > 0) {
      for (let i = 0; i < target.steps.length; i++) {
        await new Promise((res) => setTimeout(res, 350));
        const progressPct = Math.round(((i + 1) / target.steps.length) * 100);
        const stepName = target.steps[i];

        setApprovalRequests((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, progress: progressPct, currentStep: stepName } : r
          )
        );
        if (activeApprovalRequest?.id === id) {
          setActiveApprovalRequest((prev) =>
            prev ? { ...prev, progress: progressPct, currentStep: stepName } : null
          );
        }
      }
    }

    // Execute actual approved action
    if (target.onApproveAction) {
      try {
        await target.onApproveAction();
      } catch (err) {
        console.error('Approved action execution error:', err);
      }
    }

    setApprovalRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'completed', progress: 100 } : r))
    );
    setActiveApprovalRequest(null);
    soundEngine.playSuccess();
  };

  const handleReject = (id: string) => {
    setApprovalRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r))
    );
    setActiveApprovalRequest(null);
    soundEngine.playAlert();
  };

  const handleCancelApproval = (id: string) => {
    setApprovalRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'cancelled', progress: 0 } : r))
    );
    setActiveApprovalRequest(null);
    soundEngine.playAlert();
    speakResponse('Operation terminated by command.');
  };

  // Quick Build Action from Navbar
  const handleTriggerQuickBuild = () => {
    handleRequestApproval({
      title: 'Assemble Android Debug APK',
      description: 'Poppy will compile Kotlin source files, resolve AndroidManifest package, create bytecode, sign the APK, and generate a downloadable binary with SHA-256 verification.',
      type: 'apk_build',
      details: [
        'Target: app-debug.apk',
        'Package: com.poran.poppy',
        'Compiler: Kotlin 2.0 + Jetpack Compose',
        'Keystore: Poran Studio Dev Key',
      ],
      steps: [
        'Starting Gradle Daemon',
        'Running Kotlin compiler',
        'Assembling DEX bytecode',
        'Aligning and signing APK package',
      ],
      onApproveAction: async () => {
        const artifact = await generateAndroidArtifact('debug_apk', files);
        setArtifacts((prev) => [artifact, ...prev]);
        setCurrentTab('files');
        speakResponse('Android Debug APK build completed successfully.');
      },
    });
  };

  // Chat message sending
  const handleSendMessage = async (text: string, attachmentName?: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachmentName,
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const activeFile = files.find((f) => f.path === activeFilePath);
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: chatMessages.slice(-6),
          language,
          projectContext: {
            name: DEFAULT_ANDROID_PROJECT_NAME,
            fileList: files.map((f) => f.name).join(', '),
            activeFile: activeFile?.path,
          },
        }),
      });

      const data = await res.json();
      const reply = data.reply || 'System response verified.';

      const assistantMsg: ChatMessage = {
        id: `msg-resp-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatMessages((prev) => [...prev, assistantMsg]);
      speakResponse(reply);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: `Neural link interruption: ${err.message}. Offline protocol engaged.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // File system mutations
  const handleSaveFile = (path: string, content: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.path === path ? { ...f, content, isModified: true } : f))
    );
  };

  const handleCreateFile = (path: string) => {
    const ext = path.split('.').pop() || '';
    const langMap: Record<string, ProjectFile['language']> = {
      kt: 'kotlin',
      xml: 'xml',
      kts: 'gradle',
      gradle: 'gradle',
      json: 'json',
      md: 'markdown',
      yaml: 'yaml',
      yml: 'yaml',
    };

    const newFile: ProjectFile = {
      path,
      name: path.split('/').pop() || path,
      language: langMap[ext] || 'kotlin',
      content: `// Created by POPPY AI for Poran Studio\npackage com.poran.poppy\n`,
    };

    setFiles((prev) => [...prev, newFile]);
    setActiveFilePath(path);
    soundEngine.playSuccess();
  };

  const handleDeleteFile = (path: string) => {
    setFiles((prev) => prev.filter((f) => f.path !== path));
    if (activeFilePath === path) {
      setActiveFilePath(files[0]?.path || '');
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-neutral-100 flex flex-col font-sans selection:bg-red-600/30 selection:text-red-300">
      {/* Top Futuristic Cyber Navbar */}
      <Navbar
        language={language}
        onLanguageChange={(lang) => {
          setLanguage(lang);
          setVoiceSettings((v) => ({ ...v, language: lang }));
        }}
        voiceSettings={voiceSettings}
        onToggleVoice={handleToggleVoice}
        onToggleMic={handleToggleMic}
        onTriggerVoiceTest={handleTriggerVoiceTest}
        onTriggerQuickBuild={handleTriggerQuickBuild}
        activeTab={currentTab}
      />

      {/* Main View Container */}
      <main className="flex-1 w-full pt-3">
        {currentTab === 'home' && (
          <HomeView
            onNavigate={(tab) => setCurrentTab(tab)}
            files={files}
            artifacts={artifacts}
            language={language}
            onTriggerVoiceTest={handleTriggerVoiceTest}
            onTriggerQuickBuild={handleTriggerQuickBuild}
          />
        )}

        {currentTab === 'chat' && (
          <ChatView
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            isLoading={isChatLoading}
            language={language}
            onSpeakText={(text) => speakResponse(text)}
            onClearHistory={() => setChatMessages([])}
            activeProjectFiles={files}
          />
        )}

        {currentTab === 'coding' && (
          <CodingView
            files={files}
            activeFilePath={activeFilePath}
            onSelectFile={(path) => setActiveFilePath(path)}
            onSaveFile={handleSaveFile}
            onCreateFile={handleCreateFile}
            onDeleteFile={handleDeleteFile}
            onTriggerBuild={handleTriggerQuickBuild}
            onTriggerTests={() => setIsTestModalOpen(true)}
            onNavigateToGitHub={() => setCurrentTab('github')}
            language={language}
          />
        )}

        {currentTab === 'messages' && (
          <MessagesView
            requests={approvalRequests}
            onOpenApproval={(req) => setActiveApprovalRequest(req)}
            onClearHistory={() => setApprovalRequests([])}
          />
        )}

        {currentTab === 'github' && (
          <GitHubView
            files={files}
            onRequestApproval={handleRequestApproval}
          />
        )}

        {currentTab === 'files' && (
          <FilesView
            files={files}
            artifacts={artifacts}
            onAddArtifact={(art) => setArtifacts((prev) => [art, ...prev])}
            onSelectFileToEdit={(path) => {
              setActiveFilePath(path);
              setCurrentTab('coding');
            }}
            onDeleteFile={handleDeleteFile}
            onImportZip={(imported) => setFiles(imported)}
            onRequestApproval={handleRequestApproval}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            language={language}
            onLanguageChange={(lang) => {
              setLanguage(lang);
              setVoiceSettings((v) => ({ ...v, language: lang }));
            }}
            voiceSettings={voiceSettings}
            onUpdateVoiceSettings={(updates) =>
              setVoiceSettings((prev) => ({ ...prev, ...updates }))
            }
            memories={memories}
            onDeleteMemory={(id) => setMemories((prev) => prev.filter((m) => m.id !== id))}
            onClearMemories={() => setMemories([])}
            onTriggerVoiceTest={handleTriggerVoiceTest}
          />
        )}
      </main>

      {/* Mandatory Security Approval Modal */}
      <ApprovalModal
        request={activeApprovalRequest}
        onApprove={handleApprove}
        onReject={handleReject}
        onCancel={handleCancelApproval}
      />

      {/* Automated Testing Modal */}
      <BuildAndTestModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        files={files}
        onAutoFix={(fixedFiles) => setFiles(fixedFiles)}
      />

      {/* Bottom Navigation */}
      <Navigation
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        pendingApprovalsCount={approvalRequests.filter((r) => r.status === 'pending').length}
      />
    </div>
  );
}
