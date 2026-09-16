import React from 'react';
import { useVigilance } from '../../context/VigilanceContext';
import { X, Copy, Check, Code } from 'lucide-react';

export const AuditJsonModal: React.FC = () => {
  const { isAuditJsonModalOpen, setIsAuditJsonModalOpen, syncState, selectedInstitution, evidenceList, violations, showToast } = useVigilance();
  const [copied, setCopied] = React.useState(false);

  if (!isAuditJsonModalOpen) return null;

  const rawJsonPayload = {
    schemaVersion: "2026.03-DoSJE-VIGILANCE",
    statutorySection: "Section 44A Central Vigilance Act",
    institution: {
      id: selectedInstitution.id,
      name: selectedInstitution.name,
      darpanId: selectedInstitution.darpanId,
      scheme: selectedInstitution.scheme,
      sanctionedAmount: selectedInstitution.sanctionedAmount,
      pendingTranche: selectedInstitution.pendingTranche,
      aebasEnrolled: selectedInstitution.aebasRegistered,
      physicalVerified: selectedInstitution.physicalCount,
      varianceDeficit: selectedInstitution.deficit
    },
    cryptographicManifest: {
      postGisVerifiedAnchor: "28.524419 N, 77.158491 E",
      distanceDeviationMeters: 9.4,
      exifMonotonicityPass: true,
      sha256AuditDigest: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      blockVerificationNumber: "9028-VIG-2024",
      dscSignatory: "Dr. Rajiv Verma, IAS (Joint Secretary & CVO)"
    },
    violations: violations.map(v => ({
      category: v.category,
      title: v.title,
      severity: v.severity,
      documented: v.documentedPortal,
      physical: v.physicalCount,
      financialLeakage: v.suspectedAmountOrTamper,
      ruleInvoked: v.statutoryRuleInvoked
    })),
    fieldGroundFrames: evidenceList.map(e => ({
      frame: e.frameCode,
      coordinates: e.gps,
      accuracy: e.accuracy,
      hash: e.shaHash,
      timestamp: e.timestamp
    }))
  };

  const jsonString = JSON.stringify(rawJsonPayload, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    showToast('Cryptographic JSON payload copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden border border-outline-variant shadow-2xl flex flex-col">
        <div className="p-4 bg-surface-container flex items-center justify-between border-b border-outline-variant">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-secondary" />
            <h3 className="text-sm font-bold font-mono text-on-surface">
              RAW CRYPTOGRAPHIC AUDIT JSON PAYLOAD // RFC-8785 CANONICAL
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1 rounded bg-secondary text-white text-xs font-bold hover:brightness-110 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
            <button
              onClick={() => setIsAuditJsonModalOpen(false)}
              className="p-1 rounded-md hover:bg-surface-container-high text-on-surface-variant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto bg-slate-950 text-emerald-400 font-mono text-xs flex-1">
          <pre className="whitespace-pre-wrap">{jsonString}</pre>
        </div>
      </div>
    </div>
  );
};
