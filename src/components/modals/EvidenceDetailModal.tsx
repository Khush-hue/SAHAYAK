import React from 'react';
import { useVigilance } from '../../context/VigilanceContext';
import { X, ShieldCheck, MapPin, Clock, Camera, Hash, CheckCircle2 } from 'lucide-react';

export const EvidenceDetailModal: React.FC = () => {
  const { selectedEvidence, closeEvidenceModal } = useVigilance();

  if (!selectedEvidence) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-2xl max-w-2xl w-full overflow-hidden border border-outline-variant shadow-2xl space-y-4 p-5 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-secondary" />
            <div>
              <span className="text-[10px] font-mono font-bold text-secondary uppercase">
                {selectedEvidence.frameCode}
              </span>
              <h3 className="text-sm font-bold text-on-surface">
                {selectedEvidence.title}
              </h3>
            </div>
          </div>
          <button
            onClick={closeEvidenceModal}
            className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* High Res Image */}
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-outline-variant">
          <img
            src={selectedEvidence.imageUrl}
            alt={selectedEvidence.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute bottom-2 left-2 bg-black/80 text-white font-mono text-[9px] px-2 py-1 rounded backdrop-blur-xs flex items-center gap-2">
            <MapPin className="w-3 h-3 text-emerald-400" />
            <span>{selectedEvidence.gps.lat}, {selectedEvidence.gps.lng} ({selectedEvidence.accuracy})</span>
          </div>
        </div>

        {/* EXIF Metadata & Cryptographic Integrity */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-surface-container-low p-3 rounded-lg border border-outline-variant">
          <div>
            <span className="text-on-surface-variant">Timestamp:</span>
            <div className="text-on-surface font-semibold">{selectedEvidence.timestamp}</div>
          </div>
          <div>
            <span className="text-on-surface-variant">Field Officer ID:</span>
            <div className="text-on-surface font-semibold">{selectedEvidence.officerId} (Verified)</div>
          </div>
          <div className="col-span-2 truncate">
            <span className="text-on-surface-variant">SHA-256 Digest:</span>
            <div className="text-secondary font-semibold truncate">{selectedEvidence.shaHash}</div>
          </div>
        </div>

        {/* Field Officer Observations */}
        <div className="space-y-1">
          <span className="text-xs font-bold text-on-surface uppercase font-mono">
            Inspector Field Observations:
          </span>
          <p className="text-xs text-on-surface-variant leading-relaxed bg-surface-container-low p-2.5 rounded-lg border border-outline-variant">
            {selectedEvidence.notes}
          </p>
        </div>

        {/* Close Button */}
        <div className="pt-2 border-t border-outline-variant flex justify-end">
          <button
            onClick={closeEvidenceModal}
            className="px-4 py-1.5 rounded-lg bg-secondary text-white text-xs font-bold hover:brightness-110 transition"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
