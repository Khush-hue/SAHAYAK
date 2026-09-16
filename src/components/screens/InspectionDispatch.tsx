import React, { useState } from 'react';
import { useVigilance } from '../../context/VigilanceContext';
import { FieldSquad } from '../../types';
import { TacticalSquadMap } from '../maps/TacticalSquadMap';
import { 
  Activity, 
  MapPin, 
  Radio, 
  Send, 
  ShieldAlert, 
  Battery, 
  Video, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Navigation
} from 'lucide-react';

export const InspectionDispatch: React.FC = () => {
  const { 
    fieldSquads, 
    syncState, 
    dispatchSquad, 
    openVideoCall, 
    openGoogleMeetModal, 
    setActiveTab, 
    setSelectedInstitution, 
    showToast 
  } = useVigilance();

  const [selectedSquad, setSelectedSquad] = useState<string>(fieldSquads[0].id);
  const [targetNGO, setTargetNGO] = useState<string>('Jagriti Bal Vikas Sansthan');
  const [warrantClause, setWarrantClause] = useState<string>('Section 12-B Unannounced Entry');
  const [geofenceRadius, setGeofenceRadius] = useState<string>('25m');
  const [isDispatching, setIsDispatching] = useState<boolean>(false);

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDispatching(true);
    await dispatchSquad(selectedSquad, targetNGO);
    setIsDispatching(false);
  };

  return (
    <div className="space-y-4">
      {/* 1. Header Banner */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-xs font-mono text-secondary font-bold uppercase">
              ENFORCEMENT WING // RAPID FIELD INTERVENTION
            </div>
            <h2 className="text-lg font-bold text-on-surface">
              Surprise Inspection Enforcement & Squad Dispatch
            </h2>
            <p className="text-xs text-on-surface-variant">
              Live tactical dispatch to geofenced NGO premises under Section 12-B statutory powers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="dispatch-meet-briefing-btn"
              onClick={openGoogleMeetModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs"
              title="Launch Google Meet Squad Tactical Briefing"
            >
              <Video className="w-3.5 h-3.5 text-emerald-200" />
              <span>Google Meet Squad Briefing</span>
            </button>

            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>4 ACTIVE FIELD SQUADS</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Grid: Active Squads (left 8 cols) & Dispatch Form (right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Active Squads List */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-on-surface uppercase tracking-wide">
              Active Field Squads & Real-Time Telemetry
            </h3>
            <span className="text-xs font-mono text-on-surface-variant">Live Google Map Geofence</span>
          </div>

          {/* Interactive Tactical Map for Squads */}
          <TacticalSquadMap
            squads={fieldSquads}
            selectedSquadId={selectedSquad}
            onSelectSquad={(id) => {
              setSelectedSquad(id);
              showToast(`Selected squad: ${id}`);
            }}
            onOpenVideoCall={openVideoCall}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {fieldSquads.map((squad) => (
              <div 
                key={squad.id}
                className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 shadow-sm space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
                    <strong className="text-xs font-mono font-bold text-on-surface">
                      {squad.callsign}
                    </strong>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    squad.activeStatus === 'LOCKED'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : squad.activeStatus === 'EN_ROUTE'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-primary-container text-white'
                  }`}>
                    {squad.activeStatus}
                  </span>
                </div>

                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Lead Officer:</span>
                    <span className="text-on-surface font-semibold">{squad.leadOfficer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Target Facility:</span>
                    <span className="text-secondary font-bold truncate max-w-[180px]">{squad.assignedNGO}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Current Location:</span>
                    <span className="text-on-surface font-mono">{squad.currentLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Distance to Target:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">{squad.distanceToTarget}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Terminal Battery:</span>
                    <span className="text-on-surface font-mono">{squad.battery}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-outline-variant">
                  <button
                    onClick={openVideoCall}
                    className="flex-1 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-semibold border border-outline-variant flex items-center justify-center gap-1 text-on-surface"
                  >
                    <Video className="w-3.5 h-3.5 text-secondary" />
                    <span>Bodycam Link</span>
                  </button>

                  <button
                    onClick={() => {
                      showToast(`GPS Coordinate Lock enforced for ${squad.callsign}`);
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-semibold border border-outline-variant flex items-center justify-center gap-1 text-on-surface"
                  >
                    <Navigation className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Geofence Ping</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rapid Squad Dispatch Form */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-sm font-bold text-on-surface uppercase tracking-wide">
            Rapid Squad Dispatch Order
          </h3>

          <form 
            onSubmit={handleDispatch}
            className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 shadow-sm space-y-3 text-xs"
          >
            <div>
              <label className="block text-on-surface-variant font-medium mb-1">
                Select Field Enforcement Squad
              </label>
              <select
                value={selectedSquad}
                onChange={(e) => setSelectedSquad(e.target.value)}
                className="w-full p-2 rounded-lg bg-surface-container border border-outline-variant text-on-surface"
              >
                {fieldSquads.map(s => (
                  <option key={s.id} value={s.id}>{s.callsign} ({s.state})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-on-surface-variant font-medium mb-1">
                Target Institution / NGO Name
              </label>
              <input
                type="text"
                value={targetNGO}
                onChange={(e) => setTargetNGO(e.target.value)}
                className="w-full p-2 rounded-lg bg-surface-container border border-outline-variant text-on-surface"
                required
              />
            </div>

            <div>
              <label className="block text-on-surface-variant font-medium mb-1">
                Statutory Warrant Clause
              </label>
              <select
                value={warrantClause}
                onChange={(e) => setWarrantClause(e.target.value)}
                className="w-full p-2 rounded-lg bg-surface-container border border-outline-variant text-on-surface"
              >
                <option value="Section 12-B Unannounced Entry">Section 12-B Unannounced Entry & Inspection</option>
                <option value="Section 44A Grant Audit">Section 44A Forensic Grant Disbursal Audit</option>
                <option value="Rule 230(1) GFR Seizure">Rule 230(1) GFR Hardware & Register Seizure</option>
              </select>
            </div>

            <div>
              <label className="block text-on-surface-variant font-medium mb-1">
                Geofence Verification Radius
              </label>
              <select
                value={geofenceRadius}
                onChange={(e) => setGeofenceRadius(e.target.value)}
                className="w-full p-2 rounded-lg bg-surface-container border border-outline-variant text-on-surface"
              >
                <option value="15m">15 meters (Strict Boundary Gate)</option>
                <option value="25m">25 meters (Facility Perimeter)</option>
                <option value="50m">50 meters (Campus Boundary)</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isDispatching}
                className="w-full py-2.5 px-3 rounded-lg bg-secondary text-white font-bold hover:brightness-110 active:scale-98 transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isDispatching ? 'Transmitting Warrant...' : 'Dispatch Field Squad With Warrant'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
