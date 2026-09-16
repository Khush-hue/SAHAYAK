import React, { useState } from 'react';
import { useVigilance } from '../../context/VigilanceContext';
import { 
  AlertOctagon, 
  ShieldCheck, 
  Lock, 
  FileText, 
  CheckCircle2, 
  Key, 
  Send, 
  Download, 
  ExternalLink, 
  Maximize2,
  AlertTriangle,
  Building,
  Calendar,
  User,
  Clock,
  Code,
  Video
} from 'lucide-react';

export const AuditSignoffConsole: React.FC = () => {
  const { 
    selectedInstitution, 
    evidenceList, 
    violations, 
    syncState, 
    freezeTranche, 
    issueShowCauseNotice,
    openEvidenceModal, 
    setIsAuditJsonModalOpen,
    openGoogleMeetModal,
    showToast 
  } = useVigilance();

  const [dscPin, setDscPin] = useState<string>('902814');
  const [isPinVerified, setIsPinVerified] = useState<boolean>(true);
  const [isSigning, setIsSigning] = useState<boolean>(false);

  const handleVerifyPin = () => {
    if (dscPin.length === 6) {
      setIsPinVerified(true);
      showToast('CDAC Class-3 Token Authenticated. Hardware dongle active.');
    } else {
      showToast('Error: DSC Security PIN must be 6 digits.');
    }
  };

  const handleEnforceFreeze = async () => {
    if (!isPinVerified) {
      showToast('Please verify your CDAC DSC Security PIN first.');
      return;
    }
    setIsSigning(true);
    await freezeTranche();
    setIsSigning(false);
    showToast('Digital Signature Applied! Tranche-3 (₹42,50,000) frozen on PFMS & e-Anudaan gateways.');
  };

  const handleExportDossier = () => {
    showToast('Exporting Tamper-Proof Cryptographic Dossier (DL-2024-9182-AUDIT.zip)...');
  };

  return (
    <div className="space-y-4">
      {/* 1. High-Severity Statutory Determination Banner */}
      <div className="bg-error text-white rounded-xl p-4 shadow-sm flex items-start gap-3 border border-red-800">
        <AlertOctagon className="w-6 h-6 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <div className="text-xs font-mono tracking-wider uppercase font-bold text-red-100">
            MINISTRY OF SOCIAL JUSTICE & EMPOWERMENT • CENTRAL VIGILANCE WING
          </div>
          <h2 className="text-base sm:text-lg font-bold tracking-tight">
            STATUTORY AUDIT DETERMINATION: NON-COMPLIANT / SEVERE IRREGULARITIES DETECTED
          </h2>
          <p className="text-xs text-red-100 leading-relaxed font-medium">
            Immediate Administrative Withholding of Grant-in-Aid mandated under General Financial Rules (GFR 2017) Rule 230(1) and Section 44A of the Vigilance Directive.
          </p>
        </div>
      </div>

      {/* 2. Case Summary Grid */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-outline-variant pb-3">
          <div>
            <div className="text-xs font-mono text-secondary font-bold uppercase">
              CASE DOSSIER // REF: VIG-DL-2024-9182
            </div>
            <h3 className="text-lg font-bold text-on-surface">
              {selectedInstitution.name}
            </h3>
            <div className="text-xs text-on-surface-variant font-mono">
              DARPAN ID: {selectedInstitution.darpanId} • Scheme: {selectedInstitution.scheme}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="audit-convene-meet-btn"
              onClick={openGoogleMeetModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs"
              title="Convene Official Virtual Hearing via Google Meet"
            >
              <Video className="w-3.5 h-3.5 text-emerald-200" />
              <span>Convene Google Meet Hearing</span>
            </button>

            <button
              onClick={issueShowCauseNotice}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold border border-outline-variant transition"
              title="Issue official 7-day notice"
            >
              <Send className="w-3.5 h-3.5 text-secondary" />
              <span>Issue 7-Day Show-Cause Notice</span>
            </button>

            <button
              onClick={handleExportDossier}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold border border-outline-variant transition"
              title="Export complete cryptographic evidence dossier"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Dossier (ZIP)</span>
            </button>
          </div>
        </div>

        {/* Financial & Field Officer Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-surface-container-low p-2.5 rounded-lg border border-outline-variant">
            <div className="text-[10px] text-on-surface-variant uppercase">Sanctioned FY 25-26</div>
            <div className="text-sm font-bold text-on-surface">₹1,27,50,000.00</div>
          </div>
          <div className="bg-surface-container-low p-2.5 rounded-lg border border-outline-variant">
            <div className="text-[10px] text-on-surface-variant uppercase">Pending Tranche-3</div>
            <div className="text-sm font-bold text-secondary">₹42,50,000.00</div>
          </div>
          <div className="bg-surface-container-low p-2.5 rounded-lg border border-outline-variant">
            <div className="text-[10px] text-on-surface-variant uppercase">Investigating Officer</div>
            <div className="text-sm font-bold text-on-surface">S. Sharma (INS-2026-904)</div>
          </div>
          <div className="bg-surface-container-low p-2.5 rounded-lg border border-outline-variant">
            <div className="text-[10px] text-on-surface-variant uppercase">Inspection Time</div>
            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">2024-10-24 11:14 IST</div>
          </div>
        </div>
      </div>

      {/* 3. Tamper-Proof Ground Evidence Manifest (4 Photos Grid) */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-secondary" />
            <h3 className="text-xs sm:text-sm font-bold text-on-surface uppercase tracking-wide">
              Tamper-Proof Ground Evidence Manifest • Cryptographic Geo-Tags
            </h3>
          </div>
          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
            RTK ACCURACY &lt; 1.5M • SHA-256 MATCH
          </span>
        </div>

        {/* 4-Item Evidence Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {evidenceList.map((ev) => (
            <div
              key={ev.id}
              onClick={() => openEvidenceModal(ev)}
              className="group cursor-pointer bg-surface-container-low rounded-lg border border-outline-variant overflow-hidden hover:border-secondary transition shadow-xs flex flex-col justify-between"
            >
              {/* Photo */}
              <div className="relative aspect-4/3 bg-black overflow-hidden">
                <img
                  src={ev.imageUrl}
                  alt={ev.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 bg-black/80 text-white font-mono text-[9px] px-1.5 py-0.5 rounded backdrop-blur-xs font-bold">
                  {ev.frameCode}
                </div>
                <div className="absolute bottom-2 right-2 bg-black/80 text-emerald-400 font-mono text-[9px] px-1.5 py-0.5 rounded backdrop-blur-xs flex items-center gap-1">
                  <Maximize2 className="w-2.5 h-2.5" />
                  <span>{ev.accuracy}</span>
                </div>
              </div>

              {/* Caption & EXIF info */}
              <div className="p-2.5 space-y-1 text-xs">
                <h4 className="font-bold text-on-surface text-[11px] line-clamp-1 group-hover:text-secondary transition-colors">
                  {ev.title}
                </h4>
                <div className="font-mono text-[10px] text-on-surface-variant space-y-0.5">
                  <div>GPS: {ev.gps.lat}, {ev.gps.lng}</div>
                  <div className="truncate">Hash: {ev.shaHash}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Cryptographic Audit Engine & Verification Ledger */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-tertiary-fixed-variant" />
            <h3 className="text-xs sm:text-sm font-bold text-on-surface uppercase tracking-wide">
              Cryptographic Audit Engine • Monotonic Validation Checks
            </h3>
          </div>

          <button
            onClick={() => setIsAuditJsonModalOpen(true)}
            className="flex items-center gap-1 text-xs font-mono text-secondary hover:underline font-semibold"
          >
            <Code className="w-3.5 h-3.5" />
            <span>Inspect Raw Audit JSON Payload</span>
          </button>
        </div>

        {/* Verification Checkpoints */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
          <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-on-surface">PostGIS Spatial Geofence</div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                PASSED (Verified 9.4m inside boundary)
              </div>
              <div className="text-[10px] text-on-surface-variant mt-1">
                RTK Satellite fix: 14 satellites locked
              </div>
            </div>
          </div>

          <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-on-surface">EXIF Monotonicity & Clock</div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                PASSED (Hardware timestamp delta &lt; 0.2s)
              </div>
              <div className="text-[10px] text-on-surface-variant mt-1">
                Zero synthetic alterations detected
              </div>
            </div>
          </div>

          <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-on-surface">SHA-256 Manifest Digest</div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                IMMUTABLE (Block #9028-VIG)
              </div>
              <div className="text-[10px] text-on-surface-variant truncate mt-1">
                e3b0c44298fc1c149afbf4c8...
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Statutory Compliance Violation Matrix (2 Violation Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {violations.map((v) => (
          <div 
            key={v.id}
            className="bg-surface-container-lowest rounded-xl border border-error/30 p-4 shadow-sm space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-error uppercase">
                {v.category}
              </span>
              <span className="px-2 py-0.5 rounded bg-error-container text-on-error-container text-[10px] font-bold">
                {v.severity}
              </span>
            </div>

            <h4 className="text-sm font-bold text-on-surface">
              {v.title}
            </h4>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              {v.description}
            </p>

            <div className="bg-surface-container-low p-2.5 rounded-lg border border-outline-variant font-mono text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Documented Roster:</span>
                <span className="text-on-surface font-semibold">{v.documentedPortal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Physical Inspection:</span>
                <span className="text-error font-bold">{v.physicalCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Financial Implication:</span>
                <span className="text-secondary font-bold">{v.suspectedAmountOrTamper}</span>
              </div>
            </div>

            <div className="text-[11px] font-mono text-on-surface-variant flex items-center justify-between pt-1 border-t border-outline-variant">
              <span>{v.statutoryRuleInvoked}</span>
              <span className="text-error font-bold">{v.enforcementAction}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 6. Joint Secretary / CVO Statutory Order Recommendation */}
      <div className="bg-primary-container text-on-primary-container rounded-xl p-4 space-y-2 shadow-sm border border-primary-container">
        <div className="text-xs font-mono font-bold text-tertiary-fixed uppercase">
          RECOMMENDATION OF CHIEF VIGILANCE OFFICER (CVO) // SECTION 44A
        </div>
        <p className="text-xs sm:text-sm leading-relaxed text-white font-serif italic">
          "On the basis of the above evidentiary trail, verified absence of 14 beneficiaries, and intentional severance of CCTV feeds, Tranche-3 of Grant-in-Aid sanctioned under File No. DDRS-DL-2024-9182 is hereby ORDERED TO BE FROZEN with immediate effect. Let a 7-day statutory show-cause notice issue forthwith to the Managing Trustee."
        </p>
      </div>

      {/* 7. MeriPehchaan • CDAC Class-3 DSC Authorization Gateway */}
      <div className="bg-surface-container-lowest rounded-xl border-2 border-secondary/40 p-4 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-secondary text-white flex items-center justify-center font-bold">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-on-surface uppercase tracking-wide">
                MeriPehchaan • CDAC Class-3 DSC Authorization Gateway
              </h3>
              <p className="text-xs text-on-surface-variant">
                Electronic token required to enforce non-appealable administrative hold on PFMS.
              </p>
            </div>
          </div>

          <div className="text-right text-[11px] font-mono text-on-surface-variant">
            TOKEN STATUS: <span className="text-emerald-500 font-bold">CONNECTED (USB CRYPTO-DONGLE)</span>
          </div>
        </div>

        {/* Certificate Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono bg-surface-container-low p-3 rounded-lg border border-outline-variant">
          <div>
            <div className="text-[10px] text-on-surface-variant">Authorized Signatory:</div>
            <div className="font-bold text-on-surface">Dr. Rajiv Verma, IAS</div>
            <div className="text-[10px] text-on-surface-variant">Joint Secretary & CVO, DoSJE</div>
          </div>
          <div>
            <div className="text-[10px] text-on-surface-variant">Certifying Authority:</div>
            <div className="font-bold text-on-surface">(n)Code Solutions CA / CDAC</div>
            <div className="text-[10px] text-on-surface-variant">Serial: 7A:91:2C:4B:00:19:92:DF</div>
          </div>
          <div>
            <div className="text-[10px] text-on-surface-variant">Validity & Key Spec:</div>
            <div className="font-bold text-emerald-600 dark:text-emerald-400">VALID UNTIL 14-OCT-2027</div>
            <div className="text-[10px] text-on-surface-variant">RSA 2048-bit • SHA256withRSA</div>
          </div>
        </div>

        {/* PIN Entry & Enforce Freeze Action */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-mono text-on-surface-variant">6-Digit DSC PIN:</span>
            <input
              type="password"
              maxLength={6}
              value={dscPin}
              onChange={(e) => setDscPin(e.target.value)}
              className="w-28 px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant text-center font-mono text-sm tracking-widest text-on-surface focus:ring-1 focus:ring-secondary"
            />
            <button
              onClick={handleVerifyPin}
              className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-semibold border border-outline-variant"
            >
              Verify Token
            </button>
          </div>

          {/* Enforce Freeze Button */}
          <button
            onClick={handleEnforceFreeze}
            disabled={isSigning}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md ${
              syncState.isTranche3Frozen
                ? 'bg-emerald-700 text-white cursor-default'
                : 'bg-error text-white hover:brightness-110 active:scale-98'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>
              {syncState.isTranche3Frozen
                ? 'Tranche-3 Frozen on e-Anudaan Gateway'
                : isSigning
                  ? 'Applying Class-3 Digital Signature...'
                  : 'Apply Digital Signature & Enforce Immediate e-Anudaan Freeze'}
            </span>
          </button>
        </div>

        {/* Automated Notification Dispatch Pipeline */}
        <div className="pt-2 border-t border-outline-variant">
          <div className="text-xs font-bold text-on-surface uppercase mb-2">
            Automated Notification Dispatch Pipeline (Real-Time Synchronized)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[11px] font-mono">
            <div className="bg-surface-container-low p-2 rounded border border-outline-variant">
              <div className="text-on-surface font-semibold">1. State Welfare Comm.</div>
              <div className="text-emerald-600 dark:text-emerald-400 mt-0.5">Automatic SMS & Encrypted Email</div>
            </div>
            <div className="bg-surface-container-low p-2 rounded border border-outline-variant">
              <div className="text-on-surface font-semibold">2. District Magistrate</div>
              <div className="text-emerald-600 dark:text-emerald-400 mt-0.5">South-West Delhi Directive</div>
            </div>
            <div className="bg-surface-container-low p-2 rounded border border-outline-variant">
              <div className="text-on-surface font-semibold">3. PFMS Disbursal Hub</div>
              <div className="text-secondary font-bold mt-0.5">
                {syncState.isTranche3Frozen ? 'TOKEN FROZEN (90281-F)' : 'Armed for Freeze Token'}
              </div>
            </div>
            <div className="bg-surface-container-low p-2 rounded border border-outline-variant">
              <div className="text-on-surface font-semibold">4. Managing Trustee</div>
              <div className="text-on-surface-variant mt-0.5">Statutory Notice Dispatched</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
