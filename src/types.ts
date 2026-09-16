export type TabId = 
  | 'heatmap' 
  | 'dispatch' 
  | 'cctv' 
  | 'adjudication';

export interface Institution {
  id: string;
  name: string;
  darpanId: string;
  location: string;
  district: string;
  state: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  scheme: string;
  category: string;
  sanctionedAmount: string;
  pendingTranche: string;
  aebasRegistered: number;
  physicalCount: number;
  deficit: number;
  riskScore: number;
  riskSeverity: 'CRITICAL' | 'HIGH RISK' | 'ELEVATED' | 'COMPLIANT';
  confidence: number;
  assignedOfficer: {
    id: string;
    name: string;
    status: string;
    geofenceDist: string;
    battery: string;
    phoneModel: string;
  };
  anomalyFactors: {
    aebasDiscrepancy: string;
    cctvTelemetry: string;
    auditStatus: string;
    geoDrift?: string;
  };
  isFrozen: boolean;
  statusText: string;
}

export interface CameraFeed {
  id: string;
  camCode: string;
  name: string;
  locationDetails: string;
  imageUrl: string;
  fps: number;
  resolution: string;
  latencyMs: number;
  gps: {
    lat: string;
    lng: string;
  };
  timestamp: string;
  shaHash: string;
  watchdogStatus: 'ONLINE' | 'DELTA DETECTED' | 'TAMPER SUSPECTED' | 'OFFLINE';
  aiHeadcount?: number;
  aebasCount?: number;
  detectionBoxes?: { x: number; y: number; w: number; h: number; label: string; conf: number }[];
  incidentFlag?: string;
  packetDrop?: string;
  uptimePercent: number;
}

export interface StaffCrossCheck {
  id: string;
  designation: string;
  mandated: number;
  presentToday: number;
  certificationCode: string;
  status: 'Compliant' | '1 Shortfall' | 'Absent';
}

export interface TelemetryEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  type: 'geofence' | 'anomaly' | 'rtsp' | 'dispatch' | 'freeze';
  tags?: string[];
  actionLabel?: string;
}

export interface GroundEvidenceArtifact {
  id: string;
  frameCode: string;
  title: string;
  imageUrl: string;
  accuracy: string;
  gps: {
    lat: string;
    lng: string;
  };
  timestamp: string;
  shaHash: string;
  officerId: string;
  isVerified: boolean;
  notes: string;
}

export interface StatutoryViolation {
  id: string;
  title: string;
  category: string;
  severity: string;
  description: string;
  documentedPortal: string;
  physicalCount: string;
  suspectedAmountOrTamper: string;
  statutoryRuleInvoked: string;
  enforcementAction: string;
}

export interface FieldSquad {
  id: string;
  callsign: string;
  leadOfficer: string;
  currentLocation: string;
  state: string;
  activeStatus: 'LOCKED' | 'EN_ROUTE' | 'ON_SITE' | 'STANDBY';
  distanceToTarget: string;
  eta: string;
  battery: string;
  connection: string;
  assignedNGO: string;
}

export interface SyncState {
  version: number;
  lastUpdated: string;
  institutions: Institution[];
  cameraFeeds: CameraFeed[];
  telemetryStream: TelemetryEvent[];
  fieldSquads: FieldSquad[];
  activeHoldsTotalCr: number;
  activeAuditsCount: number;
  frozenTranchesCount: number;
  isTranche3Frozen: boolean;
  rollCallActive: boolean;
  rollCallSecondsRemaining: number;
  offlineSyncQueue: {
    id: string;
    timestamp: string;
    actionType: string;
    payload: Record<string, unknown>;
  }[];
}
