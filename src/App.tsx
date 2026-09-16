import React from 'react';
import { VigilanceProvider, useVigilance } from './context/VigilanceContext';
import { Header } from './components/Header';
import { LiveCCTVMonitor } from './components/screens/LiveCCTVMonitor';
import { RiskHeatmap } from './components/screens/RiskHeatmap';
import { AuditSignoffConsole } from './components/screens/AuditSignoffConsole';
import { InspectionDispatch } from './components/screens/InspectionDispatch';
import { SurpriseVideoConferenceModal } from './components/modals/SurpriseVideoConferenceModal';
import { PTZControlModal } from './components/modals/PTZControlModal';
import { EvidenceDetailModal } from './components/modals/EvidenceDetailModal';
import { AuditJsonModal } from './components/modals/AuditJsonModal';
import { NotificationDrawer } from './components/modals/NotificationDrawer';
import { GoogleMeetInquiryModal } from './components/modals/GoogleMeetInquiryModal';
import { WifiOff, RefreshCw, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { 
    activeTab, 
    isOnline, 
    isSimulatedOffline, 
    offlineQueueLength, 
    flushOfflineQueue,
    toastMessage 
  } = useVigilance();

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col transition-colors duration-200">
      {/* 1. Offline Mode Alert Banner */}
      {!isOnline && (
        <div className="bg-amber-600 text-slate-950 px-4 py-2 text-xs font-mono font-bold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 animate-bounce" />
            <span>
              OFFLINE VIGILANCE MODE ACTIVE • LOCAL SQLCIPHER LEDGER QUEUING ACTIONS
              {isSimulatedOffline && ' (SIMULATED MODE)'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>{offlineQueueLength} Actions Queued</span>
            <button
              onClick={flushOfflineQueue}
              className="bg-slate-950 text-amber-400 px-2 py-0.5 rounded text-[11px] hover:bg-slate-900 transition flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Force Flush Queue</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Main Executive Header */}
      <Header />

      {/* 3. Screen Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-6">
        {activeTab === 'cctv' && <LiveCCTVMonitor />}
        {activeTab === 'heatmap' && <RiskHeatmap />}
        {activeTab === 'adjudication' && <AuditSignoffConsole />}
        {activeTab === 'dispatch' && <InspectionDispatch />}
      </main>

      {/* 4. Footer */}
      <footer className="mt-auto border-t border-outline-variant bg-surface-container-lowest py-3 px-4 text-xs font-mono text-on-surface-variant flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <span>MINISTRY OF SOCIAL JUSTICE & EMPOWERMENT • CENTRAL SURVEILLANCE & VIGILANCE DESK</span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span>SERVER RUNTIME: NODE 22 + EXPRESS V4</span>
          <span>•</span>
          <span className="text-secondary font-bold">SECTION 44A VIGILANCE ENFORCEMENT</span>
        </div>
      </footer>

      {/* 5. Modals & Drawers */}
      <SurpriseVideoConferenceModal />
      <GoogleMeetInquiryModal />
      <PTZControlModal />
      <EvidenceDetailModal />
      <AuditJsonModal />
      <NotificationDrawer />

      {/* 6. Floating Action Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md bg-primary text-on-primary px-4 py-3 rounded-xl shadow-2xl border border-tertiary-fixed/30 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-tertiary-fixed shrink-0" />
          <div className="text-xs font-medium font-sans">
            {toastMessage}
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <VigilanceProvider>
      <MainAppContent />
    </VigilanceProvider>
  );
}
