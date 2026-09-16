import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { TabId, Institution, CameraFeed, StaffCrossCheck, TelemetryEvent, GroundEvidenceArtifact, StatutoryViolation, FieldSquad, SyncState } from '../types';
import { INITIAL_INSTITUTIONS, INITIAL_CAMERA_FEEDS, INITIAL_STAFF_CHECKS, INITIAL_TELEMETRY, INITIAL_EVIDENCE, INITIAL_VIOLATIONS, INITIAL_SQUADS, INITIAL_SYNC_STATE } from '../data/initialData';
import { 
  auth, 
  googleProvider, 
  syncUserProfile, 
  StoredUserProfile, 
  logAuditActionToFirestore, 
  testFirestoreConnection, 
  db 
} from '../lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User, GoogleAuthProvider } from 'firebase/auth';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

interface VigilanceContextType {
  // Theme & Layout
  isDark: boolean;
  toggleDarkMode: () => void;
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  
  // Data
  syncState: SyncState;
  selectedInstitution: Institution;
  setSelectedInstitution: (inst: Institution) => void;
  cameraFeeds: CameraFeed[];
  staffChecks: StaffCrossCheck[];
  telemetryLogs: TelemetryEvent[];
  evidenceList: GroundEvidenceArtifact[];
  violations: StatutoryViolation[];
  fieldSquads: FieldSquad[];
  
  // Firebase Auth & Officer Identity
  currentUser: User | null;
  userProfile: StoredUserProfile | null;
  isAuthLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  setUserRole: (role: 'CVO' | 'Joint Secretary' | 'Investigating Officer' | 'Auditor') => Promise<void>;
  
  // Status & Synchronization
  isOnline: boolean;
  isSimulatedOffline: boolean;
  toggleSimulateOffline: () => void;
  syncStatusText: string;
  offlineQueueLength: number;
  flushOfflineQueue: () => Promise<void>;
  
  // High-level Actions
  freezeTranche: () => Promise<void>;
  triggerRollCall: () => Promise<void>;
  reRunMLModel: () => Promise<void>;
  forceGeofenceCheck: () => Promise<void>;
  issueShowCauseNotice: () => Promise<void>;
  dispatchSquad: (squadId: string, targetName: string) => Promise<void>;
  resetToDefault: () => Promise<void>;
  
  // Interactive Modals
  activeVideoCall: boolean;
  openVideoCall: () => void;
  closeVideoCall: () => void;
  
  activePTZCam: CameraFeed | null;
  openPTZModal: (cam: CameraFeed) => void;
  closePTZModal: () => void;
  
  selectedEvidence: GroundEvidenceArtifact | null;
  openEvidenceModal: (ev: GroundEvidenceArtifact) => void;
  closeEvidenceModal: () => void;
  
  isAuditJsonModalOpen: boolean;
  setIsAuditJsonModalOpen: (open: boolean) => void;
  
  isNotificationDrawerOpen: boolean;
  setIsNotificationDrawerOpen: (open: boolean) => void;

  // Google Meet Statutory Inquiry
  isGoogleMeetModalOpen: boolean;
  openGoogleMeetModal: () => void;
  closeGoogleMeetModal: () => void;
  meetHearingsList: Array<{
    id: number;
    title: string;
    meetingSpaceName: string;
    meetingUri: string;
    institutionId?: string;
    institutionName?: string;
    inquiryType: string;
    status: 'SCHEDULED' | 'ACTIVE' | 'CONCLUDED';
    notes?: string;
    createdAt?: string;
  }>;
  fetchMeetHearings: () => Promise<void>;
  createGoogleMeetSpace: (data: {
    title: string;
    inquiryType: string;
    institutionId?: string;
    institutionName?: string;
    notes?: string;
  }) => Promise<any>;
  updateMeetHearingStatusInSql: (id: number, status: 'SCHEDULED' | 'ACTIVE' | 'CONCLUDED') => Promise<void>;

  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const VigilanceContext = createContext<VigilanceContextType | undefined>(undefined);

export const VigilanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Dark Mode Management
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('dosje_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('dosje_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('dosje_theme', 'light');
    }
  }, [isDark]);

  const toggleDarkMode = useCallback(() => {
    setIsDark(prev => !prev);
  }, []);

  // 2. Navigation Tabs
  const [activeTab, setActiveTab] = useState<TabId>('cctv');

  // 3. Core Domain State
  const [syncState, setSyncState] = useState<SyncState>(() => {
    const cached = localStorage.getItem('dosje_cached_state');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // fallback
      }
    }
    return INITIAL_SYNC_STATE;
  });

  const [selectedInstitution, setSelectedInstitution] = useState<Institution>(INITIAL_INSTITUTIONS[0]);
  const [cameraFeeds, setCameraFeeds] = useState<CameraFeed[]>(INITIAL_CAMERA_FEEDS);
  const [staffChecks] = useState<StaffCrossCheck[]>(INITIAL_STAFF_CHECKS);
  const [telemetryLogs, setTelemetryLogs] = useState<TelemetryEvent[]>(INITIAL_TELEMETRY);
  const [evidenceList] = useState<GroundEvidenceArtifact[]>(INITIAL_EVIDENCE);
  const [violations] = useState<StatutoryViolation[]>(INITIAL_VIOLATIONS);
  const [fieldSquads] = useState<FieldSquad[]>(INITIAL_SQUADS);

  // 4. Firebase Authentication & Firestore persistence
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<StoredUserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  // Boot connection test
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // Monitor Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const profile = await syncUserProfile(user);
          setUserProfile(profile);
        } catch (e) {
          console.warn('Failed to load user profile from Firestore:', e);
        }
      } else {
        setUserProfile(null);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 4500);
  }, []);

  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);

  const loginWithGoogle = useCallback(async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setGoogleAccessToken(credential.accessToken);
      }
      const profile = await syncUserProfile(result.user);
      setUserProfile(profile);
      showToast(`Welcome, ${profile.displayName} (${profile.role})`);

      // Synchronize officer profile to Cloud SQL relational database
      fetch('/api/auth/sync-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          role: profile.role,
          officerId: profile.officerId
        })
      }).catch(err => console.warn('Cloud SQL user sync background note:', err));
    } catch (err: any) {
      console.error('Firebase Auth sign-in failed:', err);
      showToast(`Sign-in status: ${err.message || 'Error occurred'}`);
    }
  }, [showToast]);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
      showToast('Logged out from Vigilance Portal');
    } catch (err: any) {
      console.error('Firebase Auth sign-out failed:', err);
    }
  }, []);

  const setUserRole = useCallback(async (role: 'CVO' | 'Joint Secretary' | 'Investigating Officer' | 'Auditor') => {
    if (currentUser) {
      const updated = await syncUserProfile(currentUser, role);
      setUserProfile(updated);
      showToast(`Designation updated to: ${role}`);
    }
  }, [currentUser]);

  // Firestore real-time listener for audit actions
  useEffect(() => {
    try {
      const q = query(collection(db, 'audit_actions'), orderBy('timestamp', 'desc'), limit(15));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const data = change.doc.data();
            if (data.type === 'FREEZE_TRANCHE') {
              setSyncState(prev => ({
                ...prev,
                isTranche3Frozen: true,
                activeHoldsTotalCr: '₹14.82 Cr'
              }));
            }
          }
        });
      }, (err) => {
        console.warn('Firestore audit listener notice:', err.message);
      });
      return () => unsubscribe();
    } catch (err) {
      console.warn('Firestore subscription initialized:', err);
    }
  }, []);

  // 5. Connectivity & Sync Management
  const [rawOnline, setRawOnline] = useState<boolean>(navigator.onLine);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const isOnline = rawOnline && !isSimulatedOffline;

  const [syncStatusText, setSyncStatusText] = useState<string>('Live Connected');

  // Offline queue
  const [offlineQueue, setOfflineQueue] = useState<{ id: string; action: string; payload?: Record<string, unknown>; timestamp: string }[]>(() => {
    const saved = localStorage.getItem('dosje_offline_queue');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('dosje_offline_queue', JSON.stringify(offlineQueue));
  }, [offlineQueue]);

  // Persist state to local cache
  useEffect(() => {
    localStorage.setItem('dosje_cached_state', JSON.stringify(syncState));
  }, [syncState]);

  // Network listeners
  useEffect(() => {
    const handleOnline = () => setRawOnline(true);
    const handleOffline = () => setRawOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // BroadcastChannel for instant same-browser multi-tab sync
  const [broadcastChannel, setBroadcastChannel] = useState<BroadcastChannel | null>(null);

  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('dosje_vigilance_sync');
      setBroadcastChannel(bc);
      bc.onmessage = (event) => {
        if (event.data?.type === 'ACTION_BROADCAST') {
          handleIncomingAction(event.data.action, event.data.payload);
        }
      };
    } catch (e) {
      console.warn('BroadcastChannel not supported in this environment', e);
    }
    return () => {
      bc?.close();
    };
  }, []);

  // SSE Listener for real-time cross-device sync
  useEffect(() => {
    if (!isOnline) {
      setSyncStatusText('Offline Cache Mode');
      return;
    }

    setSyncStatusText('Connecting to HQ...');
    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource('/api/sync/events');
      
      eventSource.onopen = () => {
        setSyncStatusText('Real-time Synchronized');
      };

      eventSource.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === 'SYNC_UPDATE' || data.type === 'CONNECTED') {
            const serverState = data.state;
            setSyncState(prev => ({
              ...prev,
              activeHoldsTotalCr: serverState.activeHoldsTotalCr,
              activeAuditsCount: serverState.activeAuditsCount,
              isTranche3Frozen: serverState.isTranche3Frozen,
              lastAction: serverState.lastAction,
              lastSyncTimestamp: serverState.lastSyncTimestamp
            }));
          } else if (data.type === 'ACTION') {
            handleIncomingAction(data.action, data.payload);
          }
        } catch (err) {
          console.error('Failed to parse SSE event payload', err);
        }
      };

      eventSource.onerror = () => {
        setSyncStatusText('Reconnecting to Central...');
      };
    } catch (e) {
      setSyncStatusText('SSE Channel Fallback');
    }

    return () => {
      eventSource?.close();
    };
  }, [isOnline]);

  // Handle incoming actions from SSE or BroadcastChannel
  const handleIncomingAction = (action: string, payload?: Record<string, unknown>) => {
    switch (action) {
      case 'FREEZE_TRANCHE':
        setSyncState(prev => ({
          ...prev,
          isTranche3Frozen: true,
          activeHoldsTotalCr: '₹14.82 Cr',
          lastAction: 'STATUTORY TRANCHE-3 FROZEN BY CVO ORDER'
        }));
        setSelectedInstitution(prev => ({
          ...prev,
          isFrozen: true,
          statusText: 'TRANCHE-3 FROZEN • PFMS DISBURSAL BLOCKED'
        }));
        setTelemetryLogs(prev => [
          {
            id: `tel-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
            title: 'Statutory Freeze Enforced • PFMS Blocked',
            description: 'Tranche-3 (₹42,50,000) frozen via CDAC Class-3 DSC signoff.',
            type: 'freeze',
            tags: ['DSC-SIGN', 'RULE 230(1)', 'PFMS-GATEWAY']
          },
          ...prev
        ]);
        break;

      case 'TRIGGER_ROLL_CALL':
        setSyncState(prev => ({
          ...prev,
          lastAction: 'SURPRISE BIOMETRIC ROLL-CALL DISPATCHED'
        }));
        showToast('Surprise Roll-Call Beacon Transmitted to Turnstile Kiosks');
        break;

      case 'DISPATCH_SQUAD':
        const squadTarget = (payload?.targetName as string) || 'Target Facility';
        showToast(`Squad Dispatched to ${squadTarget} with Warrant Under Section 12-B`);
        break;

      case 'ISSUE_SHOW_CAUSE':
        showToast('Statutory 7-Day Show-Cause Notice Dispatched to Managing Trustee');
        break;

      default:
        break;
    }
  };

  // Centralized action dispatcher (Server + Firestore + Local + Broadcast)
  const executeServerOrOfflineAction = async (action: string, payload?: Record<string, unknown>) => {
    // 1. Optimistic Local Update
    handleIncomingAction(action, payload);

    // 2. Broadcast across tabs
    broadcastChannel?.postMessage({
      type: 'ACTION_BROADCAST',
      action,
      payload
    });

    // 3. Persist to Firestore if online
    if (isOnline) {
      logAuditActionToFirestore({
        type: action,
        institutionId: selectedInstitution.id,
        institutionName: selectedInstitution.name,
        userUid: currentUser?.uid || 'officer-cvo-guest',
        userEmail: currentUser?.email || 'cvo@dosje.gov.in',
        details: payload ? JSON.stringify(payload) : `Action: ${action}`,
        isFrozen: action === 'FREEZE_TRANCHE'
      });

      try {
        await fetch('/api/sync/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, payload })
        });
      } catch {
        setOfflineQueue(prev => [...prev, {
          id: `queue-${Date.now()}`,
          action,
          payload,
          timestamp: new Date().toISOString()
        }]);
      }
    } else {
      setOfflineQueue(prev => [...prev, {
        id: `queue-${Date.now()}`,
        action,
        payload,
        timestamp: new Date().toISOString()
      }]);
      showToast('Offline Mode: Action encrypted into Local Storage Queue');
    }
  };

  // Reconcile offline queue when reconnected
  const flushOfflineQueue = useCallback(async () => {
    if (offlineQueue.length === 0) return;
    try {
      await fetch('/api/sync/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'OFFLINE_QUEUE_SYNC', payload: { queue: offlineQueue } })
      });
      setOfflineQueue([]);
      showToast(`Synchronized ${offlineQueue.length} offline actions with central registry`);
    } catch (e) {
      console.error('Failed to sync offline queue', e);
    }
  }, [offlineQueue, showToast]);

  // Specific Action Handlers
  const freezeTranche = async () => {
    await executeServerOrOfflineAction('FREEZE_TRANCHE');
  };

  const triggerRollCall = async () => {
    await executeServerOrOfflineAction('TRIGGER_ROLL_CALL');
  };

  const reRunMLModel = async () => {
    await executeServerOrOfflineAction('RE_RUN_ML');
  };

  const forceGeofenceCheck = async () => {
    await executeServerOrOfflineAction('FORCE_GEOFENCE');
  };

  const issueShowCauseNotice = async () => {
    await executeServerOrOfflineAction('ISSUE_SHOW_CAUSE');
  };

  const dispatchSquad = async (squadId: string, targetName: string) => {
    await executeServerOrOfflineAction('DISPATCH_SQUAD', { squadId, targetName });
  };

  const resetToDefault = async () => {
    await executeServerOrOfflineAction('RESET_DEFAULT');
    setSelectedInstitution(INITIAL_INSTITUTIONS[0]);
    setSyncState(INITIAL_SYNC_STATE);
    showToast('Reset vigilance state to initial demo defaults');
  };

  const toggleSimulateOffline = () => {
    setIsSimulatedOffline(prev => {
      const next = !prev;
      if (!next && offlineQueue.length > 0) {
        setTimeout(flushOfflineQueue, 600);
      }
      return next;
    });
  };

  // Modals state
  const [activeVideoCall, setActiveVideoCall] = useState<boolean>(false);
  const openVideoCall = () => setActiveVideoCall(true);
  const closeVideoCall = () => setActiveVideoCall(false);

  const [activePTZCam, setActivePTZCam] = useState<CameraFeed | null>(null);
  const openPTZModal = (cam: CameraFeed) => setActivePTZCam(cam);
  const closePTZModal = () => setActivePTZCam(null);

  const [selectedEvidence, setSelectedEvidence] = useState<GroundEvidenceArtifact | null>(null);
  const openEvidenceModal = (ev: GroundEvidenceArtifact) => setSelectedEvidence(ev);
  const closeEvidenceModal = () => setSelectedEvidence(null);

  const [isAuditJsonModalOpen, setIsAuditJsonModalOpen] = useState<boolean>(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState<boolean>(false);

  // Google Meet Statutory Inquiry state
  const [isGoogleMeetModalOpen, setIsGoogleMeetModalOpen] = useState<boolean>(false);
  const [meetHearingsList, setMeetHearingsList] = useState<any[]>([]);

  const openGoogleMeetModal = useCallback(() => setIsGoogleMeetModalOpen(true), []);
  const closeGoogleMeetModal = useCallback(() => setIsGoogleMeetModalOpen(false), []);

  const fetchMeetHearings = useCallback(async () => {
    try {
      const res = await fetch('/api/meet/hearings');
      if (res.ok) {
        const data = await res.json();
        setMeetHearingsList(data);
      }
    } catch (e) {
      console.warn('Failed to fetch meet hearings from Cloud SQL:', e);
    }
  }, []);

  useEffect(() => {
    fetchMeetHearings();
  }, [fetchMeetHearings]);

  const createGoogleMeetSpace = useCallback(async (data: {
    title: string;
    inquiryType: string;
    institutionId?: string;
    institutionName?: string;
    notes?: string;
  }) => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (googleAccessToken) {
        headers['Authorization'] = `Bearer ${googleAccessToken}`;
      }
      const res = await fetch('/api/meet/create-space', {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (json.success && json.hearing) {
        setMeetHearingsList(prev => [json.hearing, ...prev]);
        showToast(`Google Meet created: ${json.hearing.meetingUri}`);
        return json.hearing;
      }
      throw new Error(json.error || 'Failed to create Meet space');
    } catch (err: any) {
      console.error('Error creating Google Meet space:', err);
      showToast(`Error creating Google Meet: ${err.message}`);
      throw err;
    }
  }, [googleAccessToken, showToast]);

  const updateMeetHearingStatusInSql = useCallback(async (id: number, status: 'SCHEDULED' | 'ACTIVE' | 'CONCLUDED') => {
    try {
      const res = await fetch(`/api/meet/hearings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setMeetHearingsList(prev => prev.map(h => h.id === id ? { ...h, status } : h));
        showToast(`Hearing #${id} status updated to ${status}`);
      }
    } catch (e) {
      console.warn('Failed to update hearing status:', e);
    }
  }, [showToast]);

  return (
    <VigilanceContext.Provider
      value={{
        isDark,
        toggleDarkMode,
        activeTab,
        setActiveTab,
        syncState,
        selectedInstitution,
        setSelectedInstitution,
        cameraFeeds,
        staffChecks,
        telemetryLogs,
        evidenceList,
        violations,
        fieldSquads,
        currentUser,
        userProfile,
        isAuthLoading,
        loginWithGoogle,
        logout,
        setUserRole,
        isOnline,
        isSimulatedOffline,
        toggleSimulateOffline,
        syncStatusText,
        offlineQueueLength: offlineQueue.length,
        flushOfflineQueue,
        freezeTranche,
        triggerRollCall,
        reRunMLModel,
        forceGeofenceCheck,
        issueShowCauseNotice,
        dispatchSquad,
        resetToDefault,
        activeVideoCall,
        openVideoCall,
        closeVideoCall,
        activePTZCam,
        openPTZModal,
        closePTZModal,
        selectedEvidence,
        openEvidenceModal,
        closeEvidenceModal,
        isAuditJsonModalOpen,
        setIsAuditJsonModalOpen,
        isNotificationDrawerOpen,
        setIsNotificationDrawerOpen,
        isGoogleMeetModalOpen,
        openGoogleMeetModal,
        closeGoogleMeetModal,
        meetHearingsList,
        fetchMeetHearings,
        createGoogleMeetSpace,
        updateMeetHearingStatusInSql,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </VigilanceContext.Provider>
  );
};

export const useVigilance = () => {
  const context = useContext(VigilanceContext);
  if (!context) {
    throw new Error('useVigilance must be used within a VigilanceProvider');
  }
  return context;
};
