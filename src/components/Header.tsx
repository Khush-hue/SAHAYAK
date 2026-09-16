import React, { useState, useEffect } from 'react';
import { useVigilance } from '../context/VigilanceContext';
import { TabId } from '../types';
import { 
  ShieldAlert, 
  Moon, 
  Sun, 
  Wifi, 
  WifiOff, 
  Bell, 
  Lock, 
  Download, 
  Activity, 
  Database, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Camera,
  MapPin,
  FileSpreadsheet,
  Gavel,
  LogIn,
  LogOut,
  UserCheck,
  ChevronDown,
  Video
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    isDark, 
    toggleDarkMode, 
    activeTab, 
    setActiveTab, 
    syncState, 
    isOnline, 
    isSimulatedOffline, 
    toggleSimulateOffline, 
    syncStatusText, 
    offlineQueueLength,
    flushOfflineQueue,
    setIsNotificationDrawerOpen,
    resetToDefault,
    currentUser,
    userProfile,
    isAuthLoading,
    loginWithGoogle,
    logout,
    setUserRole,
    openGoogleMeetModal,
    meetHearingsList,
    showToast
  } = useVigilance();

  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

  // PWA Install prompt handling
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      showToast('PWA: Running in standalone or browser already installed.');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      showToast('DoSJE Vigilance Portal installed on device homescreen');
    }
    setDeferredPrompt(null);
  };

  const navItems: { id: TabId; label: string; icon: any; countBadge?: string; alert?: boolean }[] = [
    { 
      id: 'heatmap', 
      label: 'National Surveillance & Risk Heatmap', 
      icon: MapPin,
      countBadge: '142 Flags', 
      alert: true 
    },
    { 
      id: 'dispatch', 
      label: 'Surprise Inspection Enforcement & Dispatch', 
      icon: Activity,
      countBadge: '4 Squads' 
    },
    { 
      id: 'cctv', 
      label: 'Live CCTV & Biometric Stream Monitor', 
      icon: Camera,
      countBadge: '4 Feeds Active' 
    },
    { 
      id: 'adjudication', 
      label: 'Statutory Audit Sign-off & Grant Freezes', 
      icon: Gavel,
      countBadge: syncState.isTranche3Frozen ? 'FROZEN' : 'Action Req',
      alert: syncState.isTranche3Frozen 
    }
  ];

  return (
    <header className="sticky top-0 z-40 bg-surface-container-lowest border-b border-outline-variant shadow-sm select-none">
      {/* 1. Operational Security & Telemetry Strip */}
      <div className="bg-primary-container text-on-primary-container px-4 py-1.5 text-xs font-mono flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/30">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-tertiary-fixed">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-white">API SETU mTLS:</span>
            <span>256-BIT ENCRYPTED</span>
          </div>
          <span className="text-outline-variant">|</span>
          <div className="flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-on-primary-container" />
            <span>PostGIS Node: <strong className="text-white">DEL-VIG-048 (±0.4m)</strong></span>
          </div>
          <span className="text-outline-variant hidden sm:inline">|</span>
          <div className="hidden sm:flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-tertiary-fixed" />
            <span>MeriPehchaan SSO: <strong className="text-white">GOV-29402-AUTH</strong></span>
          </div>
        </div>

        {/* Real-time sync & Offline access controls */}
        <div className="flex items-center gap-3">
          {/* Sync Status Badge */}
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border ${
            isOnline 
              ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300' 
              : 'bg-amber-950/70 border-amber-500/40 text-amber-300'
          }`}>
            {isOnline ? <Wifi className="w-3 h-3 text-emerald-400" /> : <WifiOff className="w-3 h-3 text-amber-400" />}
            <span>{syncStatusText}</span>
            {offlineQueueLength > 0 && (
              <button 
                onClick={flushOfflineQueue}
                title="Sync offline queued actions now" 
                className="ml-1 bg-amber-500 text-amber-950 px-1 rounded text-[10px] font-bold hover:bg-amber-400 flex items-center gap-0.5"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                {offlineQueueLength} Queued
              </button>
            )}
          </div>

          {/* Simulate Offline Mode Toggle for Testing */}
          <button
            onClick={toggleSimulateOffline}
            className={`px-2 py-0.5 rounded text-[11px] font-sans font-medium transition-colors border ${
              isSimulatedOffline 
                ? 'bg-amber-600 text-white border-amber-400 shadow-sm' 
                : 'bg-surface-container-high/60 hover:bg-surface-container-high text-on-primary-container border-transparent'
            }`}
            title="Toggle offline mode to test offline ledger persistence & caching"
          >
            {isSimulatedOffline ? 'Resume Online' : 'Simulate Offline'}
          </button>

          {/* Reset Demo State Button */}
          <button
            onClick={resetToDefault}
            className="text-on-primary-container/80 hover:text-white transition-colors"
            title="Reset to official demo state"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Main Executive Header Bar */}
      <div className="px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          {/* Official Emblem Icon */}
          <div className="w-11 h-11 rounded-lg bg-primary-container border border-primary-container/40 p-2 flex items-center justify-center shadow-inner shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
              <circle cx="50" cy="50" r="38" stroke="#acf4a4" strokeWidth="6" />
              <circle cx="50" cy="50" r="16" fill="#fd6c19" />
              <path d="M50 12L50 88M12 50L88 50M23 23L77 77M23 77L77 23" stroke="#acf4a4" strokeWidth="3" />
              <circle cx="50" cy="50" r="6" fill="#ffffff" />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-wider text-secondary uppercase">
                GOVERNMENT OF INDIA • MINISTRY OF SOCIAL JUSTICE & EMPOWERMENT
              </span>
              <span className="px-1.5 py-0.2 bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold rounded">
                SEC 44-A
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-on-surface tracking-tight leading-tight">
              Surveillance, CCTV Stream Monitor & Grant-in-Aid Adjudication Console
            </h1>
          </div>
        </div>

        {/* Right side controls: Officer badge, Dark mode toggle, PWA install */}
        <div className="flex items-center gap-2.5 flex-wrap self-end md:self-auto">
          {/* Active Hold Metric */}
          <div className="hidden lg:flex flex-col items-end border-r border-outline-variant pr-3 mr-1">
            <span className="text-[10px] uppercase font-bold text-on-surface-variant">Statutory Holds</span>
            <span className="text-xs font-mono font-bold text-secondary">
              ₹{syncState.activeHoldsTotalCr.toFixed(1)} Cr Active
            </span>
          </div>

          {/* PWA Install Button */}
          {isInstallable && (
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-tertiary-container text-on-tertiary-container hover:brightness-110 transition border border-tertiary-fixed/30"
              title="Install Web App for Offline Field Access"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Install PWA</span>
            </button>
          )}

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            aria-label="Toggle Dark Mode"
            className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition border border-outline-variant/60"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Google Meet Inquiry Chamber Button */}
          <button
            id="header-open-google-meet-btn"
            onClick={openGoogleMeetModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs"
            title="Open Google Meet Virtual Inquiry Chamber"
          >
            <Video className="w-3.5 h-3.5 text-emerald-200" />
            <span className="hidden sm:inline">Google Meet</span>
            {meetHearingsList?.some(h => h.status === 'ACTIVE') && (
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping"></span>
            )}
          </button>

          {/* Notification Button */}
          <button
            onClick={() => setIsNotificationDrawerOpen(true)}
            className="relative p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition border border-outline-variant/60"
            title="Vigilance Telemetry Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-secondary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              3
            </span>
          </button>

          {/* Firebase Officer Identity & Google Sign-In */}
          <div className="relative flex items-center gap-2 pl-2 border-l border-outline-variant">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsRoleMenuOpen(prev => !prev)}
                  className="flex items-center gap-2 p-1 rounded-lg hover:bg-surface-container transition text-left"
                  title="Click to view officer credentials or change designation"
                >
                  {userProfile?.photoURL ? (
                    <img 
                      src={userProfile.photoURL} 
                      alt="Officer" 
                      className="w-8 h-8 rounded-full ring-2 ring-tertiary-fixed/40 object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center text-xs font-bold ring-2 ring-tertiary-fixed/40">
                      {userProfile?.displayName ? userProfile.displayName.slice(0, 2).toUpperCase() : 'RV'}
                    </div>
                  )}
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-bold text-on-surface leading-none flex items-center gap-1">
                      <span>{userProfile?.displayName || currentUser.displayName || 'Dr. Rajiv Verma, IAS'}</span>
                      <ChevronDown className="w-3 h-3 text-on-surface-variant" />
                    </div>
                    <div className="text-[10px] text-secondary font-mono mt-0.5">
                      {userProfile?.role || 'CVO'} • {userProfile?.officerId || 'INS-2026-904'}
                    </div>
                  </div>
                </button>

                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg hover:bg-error-container text-on-surface-variant hover:text-error transition"
                  title="Sign out from Firebase Auth"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>

                {/* Role Switcher Popover */}
                {isRoleMenuOpen && (
                  <div className="absolute right-0 top-12 z-50 w-64 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl p-3 space-y-2 text-xs">
                    <div className="border-b border-outline-variant pb-2">
                      <div className="font-bold text-on-surface">Authenticated Officer (Firebase)</div>
                      <div className="text-[10px] text-on-surface-variant font-mono truncate">{currentUser.email}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-on-surface-variant mb-1 font-mono">
                        Select Statutory Role:
                      </div>
                      {(['CVO', 'Joint Secretary', 'Investigating Officer', 'Auditor'] as const).map(role => (
                        <button
                          key={role}
                          onClick={() => {
                            setUserRole(role);
                            setIsRoleMenuOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition ${
                            userProfile?.role === role 
                              ? 'bg-secondary text-white font-bold' 
                              : 'hover:bg-surface-container text-on-surface'
                          }`}
                        >
                          <span>{role}</span>
                          {userProfile?.role === role && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={loginWithGoogle}
                disabled={isAuthLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant text-xs font-semibold text-on-surface transition shadow-xs"
                title="Sign in with Google via Firebase Auth"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>Google Sign-In</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs matching Screen 1, 2, 3 */}
      <nav className="flex items-center px-4 overflow-x-auto border-t border-outline-variant/50 bg-surface-container-low no-scrollbar">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 py-3 px-4 border-b-2 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'border-secondary text-secondary bg-surface-container-lowest font-bold shadow-xs'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-secondary' : 'text-on-surface-variant'}`} />
              <span>{item.label}</span>
              {item.countBadge && (
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                  item.alert 
                    ? 'bg-secondary text-white' 
                    : isActive 
                      ? 'bg-secondary-fixed text-on-secondary-fixed' 
                      : 'bg-surface-container-high text-on-surface-variant'
                }`}>
                  {item.countBadge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
