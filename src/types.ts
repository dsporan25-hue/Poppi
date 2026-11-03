export type AppLanguage = 'en' | 'bn' | 'hi';

export type NavTab = 'home' | 'chat' | 'coding' | 'messages' | 'github' | 'files' | 'settings';

export interface ProjectFile {
  path: string;
  name: string;
  content: string;
  language: 'kotlin' | 'xml' | 'gradle' | 'json' | 'markdown' | 'properties' | 'yaml';
  isModified?: boolean;
}

export type BuildArtifactType = 'debug_apk' | 'release_apk' | 'aab';

export interface BuildArtifact {
  id: string;
  type: BuildArtifactType;
  fileName: string;
  fileSize: string;
  versionName: string;
  versionCode: number;
  buildDate: string;
  sha256: string;
  downloadUrl?: string;
  blob?: Blob;
  status: 'ready' | 'building' | 'failed';
  log: string[];
}

export interface UnitTestResult {
  name: string;
  suite: string;
  passed: boolean;
  durationMs: number;
  errorMessage?: string;
  suggestedFix?: string;
}

export interface TestReport {
  timestamp: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  durationTotalMs: number;
  results: UnitTestResult[];
  lintIssues: {
    level: 'warning' | 'error' | 'info';
    file: string;
    line: number;
    message: string;
  }[];
}

export type SensitiveOperationType = 
  | 'github_push' 
  | 'file_delete' 
  | 'apk_build' 
  | 'install_apk' 
  | 'repo_access' 
  | 'file_overwrite';

export interface ApprovalRequest {
  id: string;
  title: string;
  description: string;
  type: SensitiveOperationType;
  details: string[];
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';
  progress?: number;
  currentStep?: string;
  steps?: string[];
  createdAt: string;
  onApproveAction?: () => Promise<void> | void;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  codeSnippets?: { language: string; code: string; filePath?: string }[];
  attachmentName?: string;
  audioSpoken?: boolean;
}

export interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  public_repos: number;
  html_url: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  default_branch: string;
  private: boolean;
  html_url: string;
  updated_at: string;
}

export interface MemoryItem {
  id: string;
  key: string;
  category: 'architecture' | 'preference' | 'task_result' | 'project_structure';
  content: string;
  timestamp: string;
}

export interface VoiceSettings {
  isListening: boolean;
  isVoiceActive: boolean;
  volume: number; // 0 to 1
  rate: number; // 0.5 to 2
  pitch: number; // 0.5 to 1.5
  language: AppLanguage;
  gender: 'male' | 'female';
  mode: 'voice_and_text' | 'voice_only' | 'text_only';
  wakePhraseEnabled: boolean;
}

export interface AndroidPermission {
  id: string;
  name: string;
  description: string;
  status: 'granted' | 'denied' | 'prompt';
  systemKey?: PermissionName | string;
  rationale: string;
  icon: string;
}
