import React, { useState, useEffect } from 'react';
import { useVigilance } from '../../context/VigilanceContext';
import { 
  X, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff, 
  Camera, 
  ShieldCheck, 
  Radio, 
  Volume2 
} from 'lucide-react';

export const SurpriseVideoConferenceModal: React.FC = () => {
  const { activeVideoCall, closeVideoCall, openGoogleMeetModal, selectedInstitution, showToast } = useVigilance();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [callSeconds, setCallSeconds] = useState(14);

  useEffect(() => {
    if (!activeVideoCall) return;
    const interval = setInterval(() => {
      setCallSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeVideoCall]);

  if (!activeVideoCall) return null;

  const formatCallTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleTakeSnapshot = () => {
    showToast('High-resolution timestamped frame captured & added to audit evidence manifest.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-2xl max-w-3xl w-full overflow-hidden border border-outline-variant shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="p-3.5 bg-primary-container text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <div>
              <div className="text-xs font-mono font-bold">
                ENCRYPTED WEBRTC INTERCOM // SQUAD: INS-2026-904
              </div>
              <div className="text-[11px] text-on-primary-container">
                Inspector S. Sharma • On-Premises at {selectedInstitution.name}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-black/40 text-emerald-400">
              {formatCallTime(callSeconds)}
            </span>
            <button
              onClick={closeVideoCall}
              className="p-1 rounded-md hover:bg-white/10 text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Area */}
        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
          {/* Simulated Live Officer Bodycam Video Stream */}
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAheGhz4e6nABsLiWs_82q0RWba623373Zz5EthD67bHpi_SwKshqXrwzu5NAdyVMMONgBg_jfOgkTRAUQXueRM1eEeTMDlZZGh2NO7-trV-dvupD-LYMmrGowmqVTBecNqSyskmzrex9Qa_8mM9p4j9Qm27_cTSmB8U4yqiFcIMBr-8iUgd6CfEazqdkr3vb3AgncJG2vKo-elRIOLyXcFprRaeMDj_bz06Ac26mRwHKEFXUf7hFga"
            alt="Field Officer Feed"
            className="w-full h-full object-cover opacity-90"
            referrerPolicy="no-referrer"
          />

          {/* HUD Overlay */}
          <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono p-2 rounded border border-white/20 space-y-0.5">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>BODYCAM: AXON-GOV-092 (LIVE 1080p60)</span>
            </div>
            <div>LAT: 28.524419° N | LNG: 77.158491° E (±0.4m)</div>
            <div>FPS: 60 • BITRATE: 4.8 Mbps • TLS 1.3 AES-GCM</div>
          </div>

          {/* Picture-in-picture Officer Selfie / HQ */}
          <div className="absolute bottom-3 right-3 w-28 h-20 bg-slate-900 rounded-lg overflow-hidden border-2 border-emerald-500 shadow-xl flex items-center justify-center">
            <div className="text-center text-white">
              <div className="text-[10px] font-bold">Dr. Rajiv Verma</div>
              <div className="text-[8px] text-slate-400">HQ Console (Host)</div>
            </div>
          </div>

          {/* Audio Waveform Simulator */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/60 px-2 py-1 rounded backdrop-blur-xs">
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            <div className="flex items-end gap-0.5 h-3">
              <span className="w-1 bg-emerald-400 h-2 animate-pulse"></span>
              <span className="w-1 bg-emerald-400 h-3 animate-pulse"></span>
              <span className="w-1 bg-emerald-400 h-1 animate-pulse"></span>
              <span className="w-1 bg-emerald-400 h-2.5 animate-pulse"></span>
            </div>
          </div>
        </div>

        {/* Video Controls Bar */}
        <div className="p-3 bg-surface-container flex items-center justify-center gap-3">
          <button
            onClick={() => setIsMuted(prev => !prev)}
            className={`p-2.5 rounded-full transition ${isMuted ? 'bg-error text-white' : 'bg-surface-container-highest text-on-surface hover:bg-surface-container-high'}`}
            title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsVideoMuted(prev => !prev)}
            className={`p-2.5 rounded-full transition ${isVideoMuted ? 'bg-error text-white' : 'bg-surface-container-highest text-on-surface hover:bg-surface-container-high'}`}
            title={isVideoMuted ? 'Turn on camera' : 'Turn off camera'}
          >
            {isVideoMuted ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
          </button>

          <button
            onClick={handleTakeSnapshot}
            className="p-2.5 rounded-full bg-secondary text-white hover:brightness-110 transition"
            title="Capture timestamped evidentiary frame"
          >
            <Camera className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              closeVideoCall();
              openGoogleMeetModal();
            }}
            className="px-3 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            title="Switch to Official Google Meet Statutory Room"
          >
            <Video className="w-4 h-4" />
            <span>Google Meet Room</span>
          </button>

          <button
            onClick={closeVideoCall}
            className="px-4 py-2 rounded-full bg-error text-white text-xs font-bold hover:brightness-110 transition flex items-center gap-1.5"
            title="Terminate Video Intercom"
          >
            <PhoneOff className="w-4 h-4" />
            <span>End Intercom</span>
          </button>
        </div>
      </div>
    </div>
  );
};
