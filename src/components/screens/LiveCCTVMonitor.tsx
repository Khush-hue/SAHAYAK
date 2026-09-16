import React, { useState } from 'react';
import { useVigilance } from '../../context/VigilanceContext';
import { CameraFeed } from '../../types';
import { 
  Video, 
  UserCheck, 
  FileText, 
  AlertTriangle, 
  ShieldCheck, 
  Camera, 
  Maximize2, 
  Sliders, 
  Radio, 
  Lock, 
  PhoneCall, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  ChevronRight,
  ExternalLink,
  Volume2,
  Clock
} from 'lucide-react';

export const LiveCCTVMonitor: React.FC = () => {
  const { 
    selectedInstitution, 
    cameraFeeds, 
    staffChecks, 
    syncState, 
    triggerRollCall, 
    freezeTranche, 
    forceGeofenceCheck, 
    issueShowCauseNotice,
    openVideoCall, 
    openPTZModal,
    setActiveTab,
    showToast 
  } = useVigilance();

  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);
  const [selectedCamForDetail, setSelectedCamForDetail] = useState<CameraFeed | null>(null);

  const handleRollCallClick = async () => {
    await triggerRollCall();
  };

  const handleFreezeClick = async () => {
    if (syncState.isTranche3Frozen) {
      showToast('Tranche-3 is already frozen under Section 44A.');
      setActiveTab('adjudication');
    } else {
      setActiveTab('adjudication');
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Institute Profile & Command Header Strip */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
              <span className="bg-primary-container text-on-primary-container px-2 py-0.5 rounded font-semibold">
                INSTITUTE PROFILE // DARPAN ID: {selectedInstitution.darpanId}
              </span>
              <span className="text-secondary font-semibold">
                • {selectedInstitution.scheme}
              </span>
              <span className="text-on-surface-variant hidden md:inline">
                • {selectedInstitution.district}
              </span>
            </div>

            <div className="flex items-center gap-3 flex-wrap pt-0.5">
              <h2 className="text-lg sm:text-xl font-bold text-on-surface tracking-tight">
                {selectedInstitution.name}
              </h2>
              {/* High Anomaly Risk Badge */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-error-container text-on-error-container text-xs font-bold border border-error/30 animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5 text-error" />
                <span>HIGH ANOMALY RISK: {selectedInstitution.riskScore}/100</span>
              </div>
            </div>

            <p className="text-xs text-on-surface-variant font-medium">
              {selectedInstitution.location} • <strong className="text-on-surface">Sanctioned:</strong> {selectedInstitution.sanctionedAmount} • <strong className="text-secondary">Pending Tranche:</strong> {selectedInstitution.pendingTranche}
            </p>
          </div>

          {/* Action Matrix Buttons */}
          <div className="flex items-center gap-2 flex-wrap self-start lg:self-center">
            <button
              onClick={openVideoCall}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary text-white text-xs font-bold hover:brightness-110 active:scale-95 transition shadow-xs"
              title="Establish live WebRTC video feed with on-site inspector"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Trigger Surprise Video Conference</span>
            </button>

            <button
              onClick={handleRollCallClick}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border transition ${
                syncState.rollCallActive 
                  ? 'bg-amber-500 text-slate-950 border-amber-600 animate-pulse'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface border-outline-variant'
              }`}
              title="Mandate on-site inspector to conduct 15-min biometric roll call"
            >
              <UserCheck className="w-3.5 h-3.5 text-secondary" />
              <span>{syncState.rollCallActive ? 'Roll-Call Running' : 'Roll Call'}</span>
            </button>

            <button
              onClick={() => setActiveTab('adjudication')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold border border-outline-variant transition"
              title="Inspect statutory ledger & evidence dossier"
            >
              <FileText className="w-3.5 h-3.5 text-on-surface-variant" />
              <span>Audit Ledger</span>
            </button>
          </div>
        </div>

        {/* Quick telemetry KPI ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 mt-3 border-t border-outline-variant/60 font-mono">
          <div className="bg-surface-container-low p-2 rounded-md border border-outline-variant/40">
            <div className="text-[10px] text-on-surface-variant uppercase">AEBAS Registered</div>
            <div className="text-sm sm:text-base font-bold text-on-surface">
              {selectedInstitution.aebasRegistered} Beneficiaries
            </div>
          </div>
          <div className="bg-surface-container-low p-2 rounded-md border border-outline-variant/40">
            <div className="text-[10px] text-on-surface-variant uppercase">Physical Count (Live)</div>
            <div className="text-sm sm:text-base font-bold text-error flex items-center gap-1">
              <span>{selectedInstitution.physicalCount}</span>
              <span className="text-xs bg-error-container text-on-error-container px-1 py-0.2 rounded">
                -14 Deficit
              </span>
            </div>
          </div>
          <div className="bg-surface-container-low p-2 rounded-md border border-outline-variant/40">
            <div className="text-[10px] text-on-surface-variant uppercase">CCTV Gateway</div>
            <div className="text-sm sm:text-base font-bold text-on-surface flex items-center gap-1.5">
              <span className="text-amber-500">3/4 Streams</span>
              <span className="text-[10px] font-sans font-medium text-error bg-error-container/60 px-1 rounded">
                1 Offline
              </span>
            </div>
          </div>
          <div className="bg-surface-container-low p-2 rounded-md border border-outline-variant/40">
            <div className="text-[10px] text-on-surface-variant uppercase">RTSP Latency</div>
            <div className="text-sm sm:text-base font-bold text-tertiary-fixed-variant">
              148 ms <span className="text-[10px] text-on-surface-variant font-normal">(mTLS Secured)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Content Grid: CCTV Matrix (left 8 cols) & Tactical Command Panel (right 4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Left Column: 4-Angle Camera Grid & Cross-Verification Ledger */}
        <div className="xl:col-span-8 space-y-4">
          {/* CCTV Feed Matrix Card */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-secondary" />
                <h3 className="text-sm font-bold text-on-surface uppercase tracking-wide">
                  Multi-Angle Live CCTV Matrix • mTLS Authenticated Streams
                </h3>
              </div>

              {/* Bounding Box Toggle */}
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs text-on-surface-variant cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showBoundingBoxes}
                    onChange={(e) => setShowBoundingBoxes(e.target.checked)}
                    className="rounded text-secondary focus:ring-secondary"
                  />
                  <span>AI Detection Overlay</span>
                </label>
              </div>
            </div>

            {/* 4-Tile Video Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {cameraFeeds.map((feed) => {
                const isTampered = feed.watchdogStatus === 'TAMPER SUSPECTED';
                const isDelta = feed.watchdogStatus === 'DELTA DETECTED';
                return (
                  <div 
                    key={feed.id}
                    className="group relative bg-black rounded-lg overflow-hidden border border-outline-variant aspect-video flex flex-col justify-between"
                  >
                    {/* Video Background Image */}
                    <img
                      src={feed.imageUrl}
                      alt={feed.name}
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Dark gradient overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/70 pointer-events-none"></div>

                    {/* AI Bounding Boxes overlay on CAM-02 */}
                    {showBoundingBoxes && feed.detectionBoxes && (
                      <div className="absolute inset-0 pointer-events-none">
                        {feed.detectionBoxes.map((box, bIdx) => (
                          <div
                            key={bIdx}
                            style={{
                              left: `${box.x}%`,
                              top: `${box.y}%`,
                              width: `${box.w}%`,
                              height: `${box.h}%`
                            }}
                            className="absolute border border-amber-400 bg-amber-400/10 rounded-xs"
                          >
                            <span className="absolute -top-3.5 left-0 bg-amber-500 text-black text-[8px] font-mono font-bold px-1 rounded-xs">
                              {box.label} {(box.conf * 100).toFixed(0)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Top Overlay: Camera Code, Status, GPS */}
                    <div className="relative z-10 p-2.5 flex items-start justify-between text-white text-xs font-mono">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold bg-primary-container/80 backdrop-blur-xs px-1.5 py-0.5 rounded text-[11px] text-white">
                            {feed.camCode}
                          </span>
                          <span className="font-medium text-slate-200 text-[11px] drop-shadow">
                            {feed.name}
                          </span>
                        </div>
                        <div className="text-[9px] text-slate-300 drop-shadow">
                          {feed.gps.lat}, {feed.gps.lng}
                        </div>
                      </div>

                      {/* Status Tag */}
                      <div className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 backdrop-blur-xs ${
                        isTampered
                          ? 'bg-red-600/90 text-white'
                          : isDelta
                            ? 'bg-amber-600/90 text-white'
                            : 'bg-emerald-700/80 text-white'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          isTampered ? 'bg-white animate-ping' : isDelta ? 'bg-white' : 'bg-emerald-300'
                        }`}></span>
                        <span>{feed.watchdogStatus}</span>
                      </div>
                    </div>

                    {/* Incident Banner or Telemetry Pill in Center if flagged */}
                    {feed.incidentFlag && (
                      <div className="relative z-10 mx-auto px-2.5 py-0.5 rounded bg-black/75 backdrop-blur-xs border border-error/50 text-[11px] font-mono text-amber-300 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                        <span>{feed.incidentFlag}</span>
                      </div>
                    )}

                    {/* Bottom Overlay: Frame rate, Latency, Controls */}
                    <div className="relative z-10 p-2 flex items-center justify-between text-white text-[10px] font-mono">
                      <div className="flex items-center gap-2 text-slate-300">
                        <span>{feed.fps} FPS</span>
                        <span>•</span>
                        <span>{feed.latencyMs}ms</span>
                        <span>•</span>
                        <span>{feed.resolution}</span>
                      </div>

                      {/* Action buttons on camera */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openPTZModal(feed)}
                          className="p-1 rounded bg-black/60 hover:bg-black/90 text-white transition"
                          title="Open PTZ & Pan-Tilt-Zoom Controls"
                        >
                          <Sliders className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setSelectedCamForDetail(feed)}
                          className="p-1 rounded bg-black/60 hover:bg-black/90 text-white transition"
                          title="Expand Full Stream View"
                        >
                          <Maximize2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* API Setu Cross-Verification Ledger */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-secondary" />
                <h3 className="text-sm font-bold text-on-surface uppercase tracking-wide">
                  API Setu Cross-Verification Ledger & Staff Attendance
                </h3>
              </div>
              <span className="text-[11px] font-mono text-on-surface-variant">
                LIVE POSTGIS SYNC: ACTIVE
              </span>
            </div>

            {/* 3 Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant">
                <div className="text-xs text-on-surface-variant font-medium">AEBAS Biometric Delta</div>
                <div className="text-xl font-bold text-error mt-0.5">14 Unmatched</div>
                <div className="text-[11px] text-on-surface-variant font-mono mt-1">
                  -31.1% headcount discrepancy vs. e-Anudaan roll
                </div>
              </div>

              <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant">
                <div className="text-xs text-on-surface-variant font-medium">Geofence Compliance</div>
                <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">9.4m (Pass)</div>
                <div className="text-[11px] text-on-surface-variant font-mono mt-1">
                  Threshold: &lt;15m from registered coordinate
                </div>
              </div>

              <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant">
                <div className="text-xs text-on-surface-variant font-medium">Food Ration Claims</div>
                <div className="text-xl font-bold text-secondary mt-0.5">45 Active Claims</div>
                <div className="text-[11px] text-on-surface-variant font-mono mt-1">
                  14 ineligible allowances claimed for FY 25-26
                </div>
              </div>
            </div>

            {/* SHATAYU Staff Cross-Check Table */}
            <div>
              <div className="text-xs font-bold text-on-surface uppercase mb-2">
                Mandated Staff Biometric Verification Today
              </div>
              <div className="overflow-x-auto rounded-lg border border-outline-variant">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-surface-container-high text-on-surface-variant uppercase text-[10px]">
                    <tr>
                      <th className="px-3 py-2">Designation</th>
                      <th className="px-3 py-2">Mandated</th>
                      <th className="px-3 py-2">Present Today</th>
                      <th className="px-3 py-2">RCI / Council Reg</th>
                      <th className="px-3 py-2">Audit Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/60 bg-surface-container-low">
                    {staffChecks.map((staff) => (
                      <tr key={staff.id} className="hover:bg-surface-container transition-colors">
                        <td className="px-3 py-2 font-sans font-semibold text-on-surface">
                          {staff.designation}
                        </td>
                        <td className="px-3 py-2">{staff.mandated}</td>
                        <td className="px-3 py-2 font-bold">{staff.presentToday}</td>
                        <td className="px-3 py-2 text-on-surface-variant">{staff.certificationCode}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            staff.status === 'Compliant'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : staff.status === 'Absent'
                                ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {staff.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Feed Uptime & Watchdog Telemetry (Last 24 Hours) */}
            <div className="space-y-2 pt-2 border-t border-outline-variant/60">
              <div className="flex items-center justify-between text-xs font-bold text-on-surface">
                <span>FEED UPTIME & WATCHDOG TELEMETRY (LAST 24 HOURS)</span>
                <span className="font-mono text-[10px] text-on-surface-variant">AUTO-POLL: EVERY 5 SEC</span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                {/* CAM 01 */}
                <div className="space-y-0.5">
                  <div className="flex justify-between text-[11px] text-on-surface-variant">
                    <span>CAM-01 Gate Turnstile</span>
                    <span className="text-emerald-500 font-bold">100% Uptime</span>
                  </div>
                  <div className="h-2 w-full bg-surface-container-high rounded overflow-hidden flex">
                    <div className="h-full bg-emerald-500 w-full"></div>
                  </div>
                </div>

                {/* CAM 02 */}
                <div className="space-y-0.5">
                  <div className="flex justify-between text-[11px] text-on-surface-variant">
                    <span>CAM-02 Vocational Wing</span>
                    <span className="text-emerald-500 font-bold">92% Uptime</span>
                  </div>
                  <div className="h-2 w-full bg-surface-container-high rounded overflow-hidden flex">
                    <div className="h-full bg-emerald-500 w-[92%]"></div>
                    <div className="h-full bg-amber-500 w-[8%]"></div>
                  </div>
                </div>

                {/* CAM 03 */}
                <div className="space-y-0.5">
                  <div className="flex justify-between text-[11px] text-on-surface-variant">
                    <span>CAM-03 Dining Hall</span>
                    <span className="text-emerald-500 font-bold">100% Uptime</span>
                  </div>
                  <div className="h-2 w-full bg-surface-container-high rounded overflow-hidden flex">
                    <div className="h-full bg-emerald-500 w-full"></div>
                  </div>
                </div>

                {/* CAM 04 */}
                <div className="space-y-0.5">
                  <div className="flex justify-between text-[11px] text-on-surface-variant">
                    <span className="text-error font-bold">CAM-04 Physiotherapy Bay (3.2 hr outage)</span>
                    <span className="text-error font-bold">60% Uptime</span>
                  </div>
                  <div className="h-2 w-full bg-surface-container-high rounded overflow-hidden flex">
                    <div className="h-full bg-emerald-500 w-[45%]"></div>
                    <div className="h-full bg-red-600 w-[35%]"></div>
                    <div className="h-full bg-emerald-500 w-[20%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Field Officer Link & Sanctions Action Panel */}
        <div className="xl:col-span-4 space-y-4">
          {/* Field Officer Link Active */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
                <h3 className="text-xs font-bold text-on-surface uppercase tracking-wide">
                  Field Officer Link Active
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                LIVE
              </span>
            </div>

            <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Assigned Inspector:</span>
                <strong className="text-on-surface">{selectedInstitution.assignedOfficer.name} ({selectedInstitution.assignedOfficer.id})</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Squad:</span>
                <span className="text-on-surface font-mono">Delhi Central Vigilance Team-02</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Geofence Position:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                  {selectedInstitution.assignedOfficer.geofenceDist}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Terminal Battery:</span>
                <span className="text-on-surface font-mono">{selectedInstitution.assignedOfficer.battery}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Hardware Mode:</span>
                <span className="text-on-surface font-mono">{selectedInstitution.assignedOfficer.phoneModel}</span>
              </div>
            </div>

            {/* Field Squad Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                onClick={forceGeofenceCheck}
                className="w-full py-2 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold border border-outline-variant transition flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5 text-secondary" />
                <span>Force Geofence Re-verification</span>
              </button>

              <button
                onClick={openVideoCall}
                className="w-full py-2 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold border border-outline-variant transition flex items-center justify-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5 text-tertiary-fixed-variant" />
                <span>Direct Officer Intercom</span>
              </button>

              <button
                onClick={issueShowCauseNotice}
                className="w-full py-2 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-error text-xs font-semibold border border-outline-variant transition flex items-center justify-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-error" />
                <span>Issue Immediate Show-Cause Notice</span>
              </button>
            </div>
          </div>

          {/* Recommended Statutory Sanctions (AI Audit Engine) */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-error" />
              <h3 className="text-xs font-bold text-on-surface uppercase tracking-wide">
                Recommended Statutory Sanctions
              </h3>
            </div>

            <div className="bg-error-container/20 border border-error/30 rounded-lg p-3 space-y-2 text-xs">
              <div className="font-bold text-error">
                Trigger Conditions Met: Rule 14(2) Central Sector Guidelines
              </div>
              <ul className="list-disc pl-4 space-y-1 text-on-surface-variant font-medium">
                <li>Primary Finding: Unreconciled attendance variance &gt; 30% for 3 consecutive audit cycles.</li>
                <li>Secondary Finding: Unauthorized CCTV stream interruption (CAM-04) during inspection hours.</li>
                <li>Statutory Provision: Power to withhold subsequent grant tranches under Section 44A.</li>
              </ul>
            </div>

            {/* Big Action: Freeze Tranche */}
            <button
              onClick={handleFreezeClick}
              className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition shadow-sm ${
                syncState.isTranche3Frozen 
                  ? 'bg-primary-container text-white cursor-default'
                  : 'bg-error text-white hover:brightness-110 active:scale-98'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>
                {syncState.isTranche3Frozen 
                  ? 'Tranche-3 Frozen (₹42.5L Held)' 
                  : 'Initiate Stage-1 Grant Freeze (Tranche 3)'}
              </span>
            </button>
          </div>

          {/* Tamper-Evident Integrity Log */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 shadow-sm space-y-2">
            <h4 className="text-xs font-bold text-on-surface uppercase tracking-wide">
              Tamper-Evident Integrity Log
            </h4>
            <div className="bg-surface-container-low p-2.5 rounded-lg border border-outline-variant font-mono text-[10px] space-y-1 text-on-surface-variant">
              <div>SHA-256 Digest: <span className="text-on-surface">e3b0c44298fc1c149afbf4...</span></div>
              <div>Geotag Signature: <span className="text-emerald-500 font-bold">PASSED (RTK Corrected)</span></div>
              <div>Audit Monotonicity: <span className="text-emerald-500 font-bold">VERIFIED (Block #9028)</span></div>
              <div>CDAC DSC Token: <span className="text-on-surface">Dr. Rajiv Verma (Class 3)</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Camera Modal */}
      {selectedCamForDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-4xl w-full overflow-hidden border border-outline-variant shadow-2xl">
            <div className="p-3 bg-surface-container flex items-center justify-between border-b border-outline-variant">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-secondary" />
                <span className="text-xs font-bold font-mono">{selectedCamForDetail.camCode}: {selectedCamForDetail.name}</span>
              </div>
              <button 
                onClick={() => setSelectedCamForDetail(null)}
                className="p-1 rounded-md hover:bg-surface-container-high text-on-surface-variant"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="relative aspect-video bg-black">
              <img 
                src={selectedCamForDetail.imageUrl} 
                alt={selectedCamForDetail.name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-xs text-white text-xs font-mono p-2 rounded">
                <div>GPS: {selectedCamForDetail.gps.lat}, {selectedCamForDetail.gps.lng}</div>
                <div>Hash: {selectedCamForDetail.shaHash}</div>
                <div>Latency: {selectedCamForDetail.latencyMs}ms | {selectedCamForDetail.resolution}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
