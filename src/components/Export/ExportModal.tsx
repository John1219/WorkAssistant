import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Download,
  Upload,
  FileSpreadsheet,
  FileJson,
  Copy,
  Check,
  RotateCcw,
  Cloud,
  Share2,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import {
  exportStateToJson,
  parseImportedJson
} from '../../utils/storage';
import {
  downloadJsonFile,
  downloadCsvFile,
  exportScheduleToCsv,
  generateTextRoster
} from '../../utils/export';

interface ExportModalProps {
  onClose: () => void;
  initialTab?: 'export' | 'import' | 'email' | 'cloud';
}

export const ExportModal: React.FC<ExportModalProps> = ({ onClose, initialTab = 'export' }) => {
  const {
    state,
    selectedClass,
    importState,
    resetToDemoData,
    clearAllData,
    syncStatus,
    workspaceId,
    setWorkspaceId,
    lastSyncTime,
    forceCloudSync
  } = useApp();

  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'email' | 'cloud'>(initialTab);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [newWorkspaceInput, setNewWorkspaceInput] = useState(workspaceId);
  const [isSyncingNow, setIsSyncingNow] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [jsonText, setJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const shiftsForCurrentClass = selectedClass
    ? state.shifts.filter(s => s.classId === selectedClass.id)
    : state.shifts;

  const handleDownloadJson = () => {
    const jsonStr = exportStateToJson(state);
    const dateStr = new Date().toISOString().split('T')[0];
    downloadJsonFile(jsonStr, `training-scheduler-backup-${dateStr}.json`);
  };

  const handleDownloadCsv = () => {
    const csvStr = exportScheduleToCsv(selectedClass, shiftsForCurrentClass, state.assignments, state.employees);
    const dateStr = new Date().toISOString().split('T')[0];
    downloadCsvFile(csvStr, `training-schedule-${selectedClass?.title || 'all'}-${dateStr}.csv`);
  };

  const handleCopyEmailRoster = () => {
    const text = generateTextRoster(selectedClass, shiftsForCurrentClass, state.assignments, state.employees);
    navigator.clipboard.writeText(text);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const text = event.target?.result as string;
        const parsed = parseImportedJson(text);
        importState(parsed);
        setImportStatus(`Successfully imported data from ${file.name}!`);
      } catch (err) {
        setImportStatus('Failed to parse JSON file. Please check file format.');
      }
    };
    reader.readAsText(file);
  };

  const handlePasteImport = () => {
    if (!jsonText.trim()) return;
    try {
      const parsed = parseImportedJson(jsonText);
      importState(parsed);
      setImportStatus('Successfully imported pasted state!');
      setJsonText('');
    } catch (err) {
      setImportStatus('Invalid JSON text. Please check the pasted content.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="p-2 bg-indigo-600 rounded-lg shrink-0">
              <Share2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-base sm:text-lg truncate">Share, Export & Multi-User Sync</h3>
              <p className="text-2xs sm:text-xs text-slate-400 truncate">
                Move schedules between computers or send rosters
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 shrink-0 ml-2"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-3 sm:px-6 pt-2 sm:pt-3 gap-1.5 sm:gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
          <button
            onClick={() => setActiveTab('export')}
            className={`pb-2 px-2.5 sm:px-3 text-xs font-semibold border-b-2 transition-colors shrink-0 ${
              activeTab === 'export'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Export Options
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`pb-2 px-2.5 sm:px-3 text-xs font-semibold border-b-2 transition-colors shrink-0 ${
              activeTab === 'import'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Import Backup
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`pb-2 px-2.5 sm:px-3 text-xs font-semibold border-b-2 transition-colors shrink-0 ${
              activeTab === 'email'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Copy for Email
          </button>
          <button
            onClick={() => setActiveTab('cloud')}
            className={`pb-2 px-2.5 sm:px-3 text-xs font-semibold border-b-2 transition-colors shrink-0 ${
              activeTab === 'cloud'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Cloud Collaboration
          </button>
        </div>

        <div className="p-4 sm:p-6 max-h-[75vh] overflow-y-auto">
          {/* TAB 1: EXPORT */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Download schedules in spreadsheet format or full application state to share with colleagues.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleDownloadCsv}
                  className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition-all group cursor-pointer"
                >
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg w-fit group-hover:scale-105 transition-transform">
                    <FileSpreadsheet className="h-6 w-6" />
                  </div>
                  <div className="font-bold text-sm text-slate-900 mt-2">Export to Excel / CSV</div>
                  <div className="text-2xs text-slate-500 mt-0.5">
                    Formatted table of all dates, times, parking & support staff.
                  </div>
                </button>

                <button
                  onClick={handleDownloadJson}
                  className="p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 text-left transition-all group cursor-pointer"
                >
                  <div className="p-2 bg-indigo-100 text-indigo-800 rounded-lg w-fit group-hover:scale-105 transition-transform">
                    <FileJson className="h-6 w-6" />
                  </div>
                  <div className="font-bold text-sm text-slate-900 mt-2">Download JSON Backup</div>
                  <div className="text-2xs text-slate-500 mt-0.5">
                    Complete state including roster, classes, and all shift assignments.
                  </div>
                </button>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">Need sample demo data or reset?</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (window.confirm('Reset to standard sample training class and employees?')) {
                        resetToDemoData();
                        onClose();
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-2xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-1"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Load Demo Data
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Delete all data and start completely blank?')) {
                        clearAllData();
                        onClose();
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg border border-rose-200 text-2xs font-semibold text-rose-700 hover:bg-rose-50 flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IMPORT */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Import a schedule JSON file exported from another user or previous session.
              </p>

              {importStatus && (
                <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-lg text-xs">
                  {importStatus}
                </div>
              )}

              {/* Upload file box */}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-6 border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl bg-slate-50 hover:bg-indigo-50/30 flex flex-col items-center justify-center transition-colors cursor-pointer"
                >
                  <Upload className="h-8 w-8 text-indigo-600 mb-2" />
                  <span className="text-xs font-bold text-slate-800">
                    Click to select JSON backup file
                  </span>
                  <span className="text-2xs text-slate-500 mt-0.5">
                    Supports .json files created by this app
                  </span>
                </button>
              </div>

              {/* Paste JSON */}
              <div>
                <label className="block text-2xs uppercase tracking-wider font-semibold text-slate-600 mb-1">
                  Or paste JSON text directly:
                </label>
                <textarea
                  rows={3}
                  value={jsonText}
                  onChange={e => setJsonText(e.target.value)}
                  placeholder="Paste JSON here..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                />
                <button
                  disabled={!jsonText.trim()}
                  onClick={handlePasteImport}
                  className="mt-2 px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  Apply Pasted JSON
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: EMAIL / TEXT */}
          {activeTab === 'email' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Copy a clean, formatted text summary of this training session's duty schedule to paste directly into an email, Slack, or Teams message.
              </p>

              <div className="relative">
                <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-2xs font-mono max-h-60 overflow-y-auto whitespace-pre-wrap">
                  {generateTextRoster(
                    selectedClass,
                    shiftsForCurrentClass,
                    state.assignments,
                    state.employees
                  )}
                </pre>

                <button
                  onClick={handleCopyEmailRoster}
                  className="absolute top-3 right-3 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  {copiedEmail ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-300" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy All Text</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: CLOUD SYNC */}
          {activeTab === 'cloud' && (
            <div className="space-y-4">
              {/* Connection Status Card */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  syncStatus === 'connected'
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                    : syncStatus === 'syncing'
                    ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-3 w-3 rounded-full shrink-0 ${
                      syncStatus === 'connected'
                        ? 'bg-emerald-500 animate-pulse'
                        : syncStatus === 'syncing'
                        ? 'bg-amber-500 animate-spin'
                        : 'bg-slate-400'
                    }`}
                  />
                  <div>
                    <div className="font-bold text-xs uppercase tracking-wider">
                      {syncStatus === 'connected'
                        ? 'Firebase Real-Time Cloud: Connected'
                        : syncStatus === 'syncing'
                        ? 'Syncing with Cloud...'
                        : 'Offline / Local Cache'}
                    </div>
                    <div className="text-2xs opacity-80 mt-0.5">
                      {lastSyncTime
                        ? `Last synced: ${lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
                        : 'Connected to Firestore Native'}
                    </div>
                  </div>
                </div>

                <button
                  disabled={isSyncingNow}
                  onClick={async () => {
                    setIsSyncingNow(true);
                    setSyncFeedback(null);
                    try {
                      await forceCloudSync();
                      setSyncFeedback('Successfully synced to cloud!');
                      setTimeout(() => setSyncFeedback(null), 3000);
                    } catch {
                      setSyncFeedback('Sync failed. Please check internet connection.');
                    } finally {
                      setIsSyncingNow(false);
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors shrink-0 disabled:opacity-50"
                >
                  {isSyncingNow ? 'Syncing...' : 'Sync Now'}
                </button>
              </div>

              {syncFeedback && (
                <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs flex items-center gap-1.5 animate-in fade-in">
                  <Check className="h-4 w-4 text-indigo-600 shrink-0" />
                  <span>{syncFeedback}</span>
                </div>
              )}

              {/* Team Workspace ID & Switch */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Team Workspace ID
                  </label>
                  <p className="text-2xs text-slate-500 mb-2">
                    All coordinators and devices sharing this Workspace ID automatically sync shift schedules and employee rosters in real time.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newWorkspaceInput}
                      onChange={e => setNewWorkspaceInput(e.target.value)}
                      placeholder="e.g. operations-training or north-campus"
                      className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono bg-white outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={() => {
                        if (newWorkspaceInput.trim()) {
                          setWorkspaceId(newWorkspaceInput.trim());
                          setSyncFeedback(`Switched to workspace "${newWorkspaceInput.trim()}"!`);
                          setTimeout(() => setSyncFeedback(null), 3000);
                        }
                      }}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs shrink-0 transition-colors"
                    >
                      Join / Switch
                    </button>
                  </div>
                </div>

                {/* 1-Click Shareable Invite Link */}
                <div className="pt-2 border-t border-slate-200/80">
                  <span className="block text-2xs font-semibold text-slate-600 mb-1">
                    1-Click Team Member Link:
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={(() => {
                        try {
                          const url = new URL(window.location.href);
                          url.searchParams.set('team', workspaceId);
                          return url.toString();
                        } catch {
                          return `?team=${workspaceId}`;
                        }
                      })()}
                      className="flex-1 px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-3xs font-mono text-slate-600 truncate"
                    />
                    <button
                      onClick={() => {
                        const url = new URL(window.location.href);
                        url.searchParams.set('team', workspaceId);
                        navigator.clipboard.writeText(url.toString());
                        setCopiedInvite(true);
                        setTimeout(() => setCopiedInvite(false), 3000);
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
                    >
                      {copiedInvite ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-3xs text-slate-400 mt-1">
                    Send this link to anyone on your team via text or email—opening it loads directly into your shared schedule.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
export default ExportModal;
