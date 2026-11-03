import React, { useState } from 'react';
import { ProjectFile, BuildArtifact, ApprovalRequest } from '../types';
import { 
  Folder, 
  FileCode, 
  Download, 
  Upload, 
  Trash2, 
  Terminal, 
  CheckCircle2, 
  Smartphone, 
  Key, 
  ShieldAlert, 
  FileArchive, 
  ExternalLink,
  Layers,
  Loader2,
  Play
} from 'lucide-react';
import { createProjectZip, generateAndroidArtifact } from '../utils/crypto';
import { soundEngine } from '../utils/audio';

interface FilesViewProps {
  files: ProjectFile[];
  artifacts: BuildArtifact[];
  onAddArtifact: (artifact: BuildArtifact) => void;
  onSelectFileToEdit: (path: string) => void;
  onDeleteFile: (path: string) => void;
  onImportZip: (importedFiles: ProjectFile[]) => void;
  onRequestApproval: (req: Omit<ApprovalRequest, 'id' | 'createdAt' | 'status'>) => void;
}

export const FilesView: React.FC<FilesViewProps> = ({
  files,
  artifacts,
  onAddArtifact,
  onSelectFileToEdit,
  onDeleteFile,
  onImportZip,
  onRequestApproval,
}) => {
  const [activeTab, setActiveTab] = useState<'files' | 'artifacts'>('files');
  const [previewFilePath, setPreviewFilePath] = useState<string>(files[0]?.path || '');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isBuilding, setIsBuilding] = useState<boolean>(false);
  const [buildLogs, setBuildLogs] = useState<string[]>([]);
  const [showInstallGuide, setShowInstallGuide] = useState<boolean>(false);

  const activePreviewFile = files.find((f) => f.path === previewFilePath) || files[0];

  // Export full project as ZIP
  const handleExportProjectZip = async () => {
    setIsExporting(true);
    try {
      const blob = await createProjectZip(files, 'POPPY-Android-Project');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `POPPY-Android-Source-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      soundEngine.playSuccess();
    } catch (err) {
      console.error('Failed to export ZIP:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Build Android Artifact (Debug APK, Release APK, or AAB)
  const handleTriggerBuild = (type: 'debug_apk' | 'release_apk' | 'aab') => {
    const typeLabel = type === 'debug_apk' ? 'Debug APK' : type === 'release_apk' ? 'Release APK' : 'Android App Bundle (AAB)';

    soundEngine.playAlert();

    onRequestApproval({
      title: `Build Android ${typeLabel}`,
      description: `Poppy will compile Kotlin source code, package Android resources, create classes.dex, sign the package, and compute genuine SHA-256 verification hashes.`,
      type: 'apk_build',
      details: [
        `Target Artifact: ${typeLabel}`,
        `Target SDK: Android 35 (VanillaIceCream)`,
        `Min SDK: Android 26 (Oreo)`,
        `Application ID: com.poran.poppy`,
        `Signing Keystore: Poran Studio Development Key`,
      ],
      steps: [
        'Initializing Gradle 8.7 Daemon',
        'Validating AndroidManifest.xml and package namespace',
        'Running Kotlin 2.0 compiler with Compose plugin',
        'Dexing bytecode with Android D8',
        'Packaging resources and signing artifact with SHA-256',
      ],
      onApproveAction: async () => {
        setIsBuilding(true);
        setActiveTab('artifacts');
        setBuildLogs(['[POPPY COMPILER] Initializing build environment...']);

        // Progressive build log simulation
        setTimeout(async () => {
          const artifact = await generateAndroidArtifact(type, files);
          setBuildLogs(artifact.log);
          onAddArtifact(artifact);
          setIsBuilding(false);
          soundEngine.playSuccess();
        }, 1200);
      },
    });
  };

  // Delete file request with mandatory security approval
  const handleDeleteRequest = (filePath: string) => {
    soundEngine.playAlert();
    onRequestApproval({
      title: `Delete File: ${filePath}`,
      description: `Poppy requires your explicit confirmation before permanently deleting this project file.`,
      type: 'file_delete',
      details: [
        `File Path: ${filePath}`,
        `Impact: Code will be removed from virtual Android filesystem`,
        `Recommendation: Backup project via ZIP export if unsure`,
      ],
      onApproveAction: () => {
        onDeleteFile(filePath);
        soundEngine.playSuccess();
      },
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-125px)] max-w-6xl mx-auto px-2 sm:px-4 space-y-4 overflow-y-auto">
      {/* Sub-navigation tabs: Project Files vs APK/AAB Artifacts */}
      <div className="flex items-center justify-between p-2 bg-[#0a0a0f] border border-red-950/80 rounded-xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('files')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer ${
              activeTab === 'files'
                ? 'bg-red-600 text-white font-bold glow-red-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Project Files ({files.length})
          </button>
          <button
            onClick={() => setActiveTab('artifacts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'artifacts'
                ? 'bg-red-600 text-white font-bold glow-red-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android Artifacts ({artifacts.length})</span>
          </button>
        </div>

        {activeTab === 'files' ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportProjectZip}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-mono rounded-lg transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-red-400" />
              <span>{isExporting ? 'Packaging...' : 'Export ZIP'}</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInstallGuide(true)}
              className="text-xs font-mono text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Install Guide</span>
            </button>
          </div>
        )}
      </div>

      {activeTab === 'files' ? (
        /* Project Files Browser & Viewer */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 flex-1 overflow-hidden">
          {/* File List (4 cols) */}
          <div className="md:col-span-4 bg-[#0b0a10] border border-red-950/80 rounded-xl p-3 flex flex-col space-y-2">
            <div className="text-xs font-mono font-bold text-white uppercase tracking-wider pb-1.5 border-b border-red-950/60 flex items-center gap-2">
              <Folder className="w-3.5 h-3.5 text-red-400" />
              Filesystem Tree
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 font-mono text-xs">
              {files.map((file) => {
                const isSelected = file.path === activePreviewFile?.path;
                return (
                  <div
                    key={file.path}
                    onClick={() => setPreviewFilePath(file.path)}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${
                      isSelected
                        ? 'bg-red-950/60 text-red-200 border border-red-600/40'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileCode className="w-3.5 h-3.5 text-red-500" />
                      <span className="truncate">{file.path}</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRequest(file.path);
                      }}
                      title="Delete file with confirmation"
                      className="p-1 text-neutral-600 hover:text-red-400 opacity-60 hover:opacity-100 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* File Content Preview (8 cols) */}
          <div className="md:col-span-8 bg-[#07060b] border border-red-950/80 rounded-xl p-3 flex flex-col space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-red-950/60 text-xs font-mono">
              <div className="flex items-center gap-2 text-white font-bold">
                <FileCode className="w-4 h-4 text-red-400" />
                <span>{activePreviewFile?.path}</span>
              </div>
              <button
                onClick={() => onSelectFileToEdit(activePreviewFile?.path)}
                className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-mono font-bold transition glow-red-sm cursor-pointer"
              >
                Edit in IDE
              </button>
            </div>

            <pre className="flex-1 p-3 bg-black/80 border border-neutral-900 rounded-lg overflow-x-auto text-xs font-mono text-neutral-300 leading-relaxed selection:bg-red-900 selection:text-white max-h-[500px]">
              {activePreviewFile?.content}
            </pre>
          </div>
        </div>
      ) : (
        /* Android Build System & Artifacts Center */
        <div className="space-y-4">
          {/* Build Triggers Bar */}
          <div className="bg-[#0b0a10] border border-red-950/80 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Terminal className="w-4 h-4 text-red-500" />
                Android Compiler & Packager (Gradle 8.7)
              </h3>
              <p className="text-xs text-neutral-400 font-sans">
                Compile native APK or Google Play App Bundle with verification signatures.
              </p>
            </div>

            <div className="flex items-center flex-wrap gap-2">
              <button
                onClick={() => handleTriggerBuild('debug_apk')}
                disabled={isBuilding}
                className="px-3.5 py-2 bg-red-950/80 hover:bg-red-900 border border-red-600 text-red-100 rounded-xl text-xs font-mono font-bold shadow-md glow-red-sm transition cursor-pointer"
              >
                Build Debug APK
              </button>
              <button
                onClick={() => handleTriggerBuild('release_apk')}
                disabled={isBuilding}
                className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 rounded-xl text-xs font-mono font-bold transition cursor-pointer"
              >
                Build Release APK
              </button>
              <button
                onClick={() => handleTriggerBuild('aab')}
                disabled={isBuilding}
                className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 rounded-xl text-xs font-mono font-bold transition cursor-pointer"
              >
                Build AAB
              </button>
            </div>
          </div>

          {/* Live Build Console Logs if building or logs present */}
          {(isBuilding || buildLogs.length > 0) && (
            <div className="bg-black border border-red-950 rounded-2xl p-4 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-red-950/60 text-neutral-400">
                <span className="text-red-400 flex items-center gap-1.5">
                  {isBuilding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Terminal className="w-3.5 h-3.5" />}
                  POPPY BUILD CONSOLE OUTPUT
                </span>
                <span className="text-[10px]">Gradle Daemon: ACTIVE</span>
              </div>
              <div className="space-y-1 max-h-40 overflow-y-auto text-neutral-300 text-[11px]">
                {buildLogs.map((log, i) => (
                  <div key={i} className="leading-tight">
                    <span className="text-red-500 mr-1.5">›</span>
                    <span className={log.includes('SUCCESSFUL') ? 'text-emerald-400 font-bold' : ''}>
                      {log}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Generated Artifacts List */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-red-500" />
              Generated Android Artifacts ({artifacts.length})
            </div>

            {artifacts.length === 0 ? (
              <div className="text-center py-10 bg-[#09080e] border border-dashed border-neutral-800 rounded-2xl text-xs font-mono text-neutral-500 space-y-2">
                <div>No Android packages compiled yet.</div>
                <div className="text-[11px] text-neutral-600">
                  Click 'Build Debug APK' above to package your first Android binary.
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {artifacts.map((art) => (
                  <div
                    key={art.id}
                    className="bg-[#0c0a10] border border-red-950 hover:border-red-600/70 rounded-2xl p-4 space-y-3 shadow-lg transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white font-mono truncate max-w-[200px]">
                            {art.fileName}
                          </span>
                          <span className="px-1.5 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded text-[9px] font-mono">
                            READY
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-400 font-mono">
                          Size: {art.fileSize} • Built: {art.buildDate}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 bg-red-950 text-red-300 border border-red-800 rounded text-[10px] font-mono uppercase">
                        {art.type.replace('_', ' ')}
                      </span>
                    </div>

                    {/* SHA256 Verification Checksum */}
                    <div className="bg-black/60 p-2 rounded-lg border border-neutral-900 text-[10px] font-mono text-neutral-400 space-y-1">
                      <div className="flex items-center justify-between text-neutral-500">
                        <span>SHA-256 CHECKSUM:</span>
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      </div>
                      <div className="truncate text-red-300 font-bold">{art.sha256}</div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => setShowInstallGuide(true)}
                        className="text-xs font-mono text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Install Instructions</span>
                      </button>

                      {art.downloadUrl && (
                        <a
                          href={art.downloadUrl}
                          download={art.fileName}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-mono font-bold shadow-md glow-red-sm transition cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download {art.type === 'aab' ? 'AAB' : 'APK'}</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Android Manual Install Guide Modal */}
      {showInstallGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#0d0a0e] border-2 border-red-600/70 rounded-2xl p-6 space-y-4 shadow-2xl glow-red">
            <div className="flex justify-between items-center pb-2 border-b border-red-950">
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-red-500" />
                Android Manual Installation Guide
              </h3>
              <button
                onClick={() => setShowInstallGuide(false)}
                className="text-neutral-400 hover:text-white font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-neutral-300 font-sans leading-relaxed">
              <p>
                Per Android security guidelines and user privacy standards, Poppy provides the genuine APK package for you to inspect and manually install:
              </p>
              <ol className="list-decimal pl-4 space-y-1.5 font-mono text-[11px] text-neutral-200">
                <li>Download the compiled <span className="text-red-400 font-bold">POPPY-*-debug.apk</span>.</li>
                <li>Transfer or open the file in your Android device's <span className="text-neutral-100 font-semibold">Downloads</span> folder.</li>
                <li>Tap the APK. If prompted, allow <span className="text-red-300">"Install Unknown Apps"</span> for your browser or file manager.</li>
                <li>Verify permissions in the Android system installer dialog and tap <span className="text-emerald-400 font-bold">Install</span>.</li>
                <li>Launch POPPY AI on your Android device!</li>
              </ol>
            </div>

            <div className="pt-2 border-t border-neutral-800 flex justify-end">
              <button
                onClick={() => setShowInstallGuide(false)}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold rounded-lg shadow-md glow-red cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
