import React, { useState } from 'react';
import { useVigilance } from '../../context/VigilanceContext';
import { 
  X, 
  Video, 
  Plus, 
  ExternalLink, 
  Copy, 
  Check, 
  Calendar, 
  ShieldAlert, 
  Database, 
  Users, 
  Radio, 
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';

export const GoogleMeetInquiryModal: React.FC = () => {
  const { 
    isGoogleMeetModalOpen, 
    closeGoogleMeetModal, 
    meetHearingsList, 
    createGoogleMeetSpace, 
    updateMeetHearingStatusInSql,
    fetchMeetHearings,
    selectedInstitution,
    showToast 
  } = useVigilance();

  const [isCreating, setIsCreating] = useState(false);
  const [inquiryType, setInquiryType] = useState('Section 44A Statutory Show-Cause');
  const [title, setTitle] = useState(`Statutory Inquiry • ${selectedInstitution.name}`);
  const [notes, setNotes] = useState('Immediate summons before Joint Secretary & Central Vigilance Officer regarding biometric variance of 73.8%.');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  if (!isGoogleMeetModalOpen) return null;

  const handleCreateSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await createGoogleMeetSpace({
        title,
        inquiryType,
        institutionId: selectedInstitution.id,
        institutionName: selectedInstitution.name,
        notes,
      });
      // Reset defaults
      setTitle(`Statutory Inquiry • ${selectedInstitution.name}`);
    } catch (err: any) {
      console.error('Error in handleCreateSpace:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = (uri: string, id: number) => {
    navigator.clipboard.writeText(uri);
    setCopiedId(id);
    showToast('Google Meet link copied to clipboard for official summons dispatch');
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div id="google-meet-modal-backdrop" className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div id="google-meet-modal-container" className="bg-surface-container-lowest text-on-surface rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-outline-variant shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-4 bg-primary text-on-primary flex items-center justify-between border-b border-primary-container">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Video className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight">GOOGLE MEET VIRTUAL INQUIRY CHAMBER</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Database className="w-2.5 h-2.5" /> CLOUD SQL PERSISTED
                </span>
              </div>
              <p className="text-xs text-on-primary/80">
                Statutory Virtual Hearings under Section 44A of Central Vigilance Act • Encrypted G-Suite Workspace
              </p>
            </div>
          </div>

          <button
            id="close-meet-modal-btn"
            onClick={closeGoogleMeetModal}
            className="p-1.5 rounded-lg text-on-primary/80 hover:text-on-primary hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Quick Create Form */}
          <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/60 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold font-mono text-primary">
                <Plus className="w-4 h-4" />
                <span>GENERATE NEW GOOGLE MEET HEARING ROOM</span>
              </div>
              <span className="text-[11px] text-on-surface-variant font-mono">
                Target: {selectedInstitution.name} ({selectedInstitution.regNumber})
              </span>
            </div>

            <form onSubmit={handleCreateSpace} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-semibold text-on-surface-variant mb-1">
                    HEARING PURPOSE & TITLE
                  </label>
                  <input
                    id="meet-title-input"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full bg-surface-container-lowest border border-outline rounded-lg px-3 py-1.5 text-xs font-sans text-on-surface focus:outline-hidden focus:ring-1 focus:ring-primary"
                    placeholder="e.g., Section 44A Show-Cause Hearing"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-semibold text-on-surface-variant mb-1">
                    STATUTORY PROCEEDING TYPE
                  </label>
                  <select
                    id="meet-inquiry-type-select"
                    value={inquiryType}
                    onChange={(e) => setInquiryType(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline rounded-lg px-3 py-1.5 text-xs font-sans text-on-surface focus:outline-hidden focus:ring-1 focus:ring-primary"
                  >
                    <option value="Section 44A Statutory Show-Cause">Section 44A Statutory Show-Cause Hearing</option>
                    <option value="Biometric Discrepancy Cross-Examination">AEBAS Biometric Discrepancy Examination</option>
                    <option value="Field Squad Real-Time Briefing">Field Squad Tactical Briefing</option>
                    <option value="PFMS Tranche Adjudication">PFMS Tranche Adjudication Board</option>
                    <option value="CDAC DSC Verification Board">CDAC Cryptographic Signoff Hearing</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-semibold text-on-surface-variant mb-1">
                  OFFICIAL HEARING NOTES / SUMMONS DIRECTIVE
                </label>
                <input
                  id="meet-notes-input"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline rounded-lg px-3 py-1.5 text-xs font-sans text-on-surface focus:outline-hidden focus:ring-1 focus:ring-primary"
                  placeholder="Official instructions for respondent trustees and vigilance counsel"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="text-[11px] text-on-surface-variant flex items-center gap-1.5 font-mono">
                  <ShieldAlert className="w-3.5 h-3.5 text-secondary" />
                  <span>Google Meet space will be registered with DoSJE Vigilance audit credentials.</span>
                </div>
                <button
                  id="submit-create-meet-btn"
                  type="submit"
                  disabled={isCreating}
                  className="bg-primary hover:bg-primary/90 text-on-primary px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs disabled:opacity-50"
                >
                  <Video className="w-4 h-4 text-emerald-400" />
                  <span>{isCreating ? 'Provisioning Meet Space...' : 'Provision Google Meet Chamber'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Existing Hearings Table from Cloud SQL */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-secondary" />
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-on-surface">
                  Vigilance Hearings Roster (Cloud SQL PostgreSQL)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-secondary/10 text-secondary">
                  {meetHearingsList.length} Sessions
                </span>
              </div>

              <button
                id="refresh-hearings-btn"
                onClick={fetchMeetHearings}
                className="p-1 rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition flex items-center gap-1 text-[11px]"
                title="Refresh Cloud SQL Records"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync</span>
              </button>
            </div>

            {meetHearingsList.length === 0 ? (
              <div className="bg-surface-container-low rounded-xl p-8 text-center border border-dashed border-outline-variant">
                <Video className="w-8 h-8 text-on-surface-variant/40 mx-auto mb-2" />
                <div className="text-xs font-medium text-on-surface-variant">No active Google Meet hearings scheduled</div>
                <div className="text-[11px] text-on-surface-variant/70 mt-1">
                  Click "Provision Google Meet Chamber" above to schedule a virtual hearing session.
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {meetHearingsList.map((hearing) => (
                  <div
                    key={hearing.id}
                    id={`hearing-card-${hearing.id}`}
                    className="bg-surface-container-low hover:bg-surface-container rounded-xl p-3.5 border border-outline-variant/70 shadow-xs transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          hearing.status === 'ACTIVE'
                            ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 animate-pulse'
                            : hearing.status === 'SCHEDULED'
                            ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                            : 'bg-surface-container-high text-on-surface-variant'
                        }`}>
                          {hearing.status}
                        </span>
                        <span className="text-xs font-bold text-on-surface font-sans">
                          {hearing.title}
                        </span>
                        <span className="text-[11px] font-mono text-on-surface-variant">
                          • {hearing.inquiryType}
                        </span>
                      </div>

                      <div className="text-[11px] text-on-surface-variant flex items-center gap-3 font-mono">
                        <span>Institution: <strong className="text-on-surface">{hearing.institutionName || 'Pragati Shiksha Trust'}</strong></span>
                        <span>•</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold truncate max-w-xs">{hearing.meetingUri}</span>
                      </div>

                      {hearing.notes && (
                        <div className="text-[11px] text-on-surface-variant/80 italic">
                          "{hearing.notes}"
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        id={`copy-meet-btn-${hearing.id}`}
                        onClick={() => copyToClipboard(hearing.meetingUri, hearing.id)}
                        className="p-1.5 rounded-lg border border-outline bg-surface-container-lowest hover:bg-surface-container-high text-on-surface text-xs font-mono flex items-center gap-1 transition"
                        title="Copy Meet Link"
                      >
                        {copiedId === hearing.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-[11px] text-emerald-500">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span className="text-[11px]">Copy</span>
                          </>
                        )}
                      </button>

                      <a
                        id={`join-meet-btn-${hearing.id}`}
                        href={hearing.meetingUri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join Meet</span>
                        <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                      </a>

                      {hearing.status !== 'CONCLUDED' ? (
                        <button
                          id={`conclude-meet-btn-${hearing.id}`}
                          onClick={() => updateMeetHearingStatusInSql(hearing.id, 'CONCLUDED')}
                          className="px-2.5 py-1.5 rounded-lg text-[11px] font-mono text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high border border-outline transition"
                          title="Mark inquiry as concluded"
                        >
                          Conclude
                        </button>
                      ) : (
                        <button
                          id={`reopen-meet-btn-${hearing.id}`}
                          onClick={() => updateMeetHearingStatusInSql(hearing.id, 'ACTIVE')}
                          className="px-2.5 py-1.5 rounded-lg text-[11px] font-mono text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high border border-outline transition"
                          title="Reopen inquiry"
                        >
                          Reopen
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-surface-container border-t border-outline-variant flex items-center justify-between text-xs font-mono text-on-surface-variant">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>GOOGLE WORKSPACE MEET API ACTIVE • SCOPES: SPACE.CREATED, SPACE.READONLY, SPACE.SETTINGS</span>
          </div>
          <button
            onClick={closeGoogleMeetModal}
            className="px-4 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-medium transition"
          >
            Close Chamber
          </button>
        </div>
      </div>
    </div>
  );
};
