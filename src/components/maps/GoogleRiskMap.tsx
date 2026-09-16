import React, { useState, useCallback } from 'react';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  Pin, 
  InfoWindow,
  useMap 
} from '@vis.gl/react-google-maps';
import { Institution, FieldSquad } from '../../types';
import { 
  ShieldAlert, 
  Camera, 
  Gavel, 
  Compass, 
  Radio, 
  Lock, 
  Maximize2, 
  RotateCcw,
  Layers,
  MapPin,
  ExternalLink
} from 'lucide-react';

const GOOGLE_MAPS_API_KEY = ((import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY as string) || "AIzaSyCsX0SM1H_VifwSKQYqeNcWKPSh4rgxcdE";

interface GoogleRiskMapProps {
  institutions: Institution[];
  selectedInstitution: Institution;
  onSelectInstitution: (inst: Institution) => void;
  mapLayer: 'heat' | 'satellite' | 'squads';
  setMapLayer: (layer: 'heat' | 'satellite' | 'squads') => void;
  fieldSquads?: FieldSquad[];
  onLaunchCCTV: (inst: Institution) => void;
  onFreezeTranche: (inst: Institution) => void;
  telemetryLogs?: any[];
}

// Sub-component to manage map pan/zoom dynamically
const MapController: React.FC<{ targetCoords?: { lat: number; lng: number } }> = ({ targetCoords }) => {
  const map = useMap();
  
  const resetToIndia = () => {
    if (map) {
      map.setCenter({ lat: 23.5937, lng: 79.9629 });
      map.setZoom(5);
    }
  };

  return (
    <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-surface-container-lowest/90 backdrop-blur-md px-2 py-1.5 rounded-lg border border-outline-variant shadow-md text-xs">
      <button 
        onClick={resetToIndia}
        className="flex items-center gap-1 px-2 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold transition"
        title="Reset view to National India Overview"
      >
        <RotateCcw className="w-3 h-3 text-secondary" />
        <span>India Pan</span>
      </button>
    </div>
  );
};

export const GoogleRiskMap: React.FC<GoogleRiskMapProps> = ({
  institutions,
  selectedInstitution,
  onSelectInstitution,
  mapLayer,
  setMapLayer,
  fieldSquads = [],
  onLaunchCCTV,
  onFreezeTranche,
  telemetryLogs = []
}) => {
  const [activeInfoWindowInst, setActiveInfoWindowInst] = useState<Institution | null>(null);
  const [activeSquad, setActiveSquad] = useState<FieldSquad | null>(null);

  const getSeverityColor = (score: number) => {
    if (score >= 80) return '#dc2626'; // Critical Red
    if (score >= 70) return '#f59e0b'; // Amber High
    return '#10b981'; // Green Compliant
  };

  const centerCoord = selectedInstitution.coordinates || { lat: 28.5244, lng: 77.1585 };

  return (
    <div className="relative w-full h-[380px] sm:h-[440px] rounded-xl overflow-hidden border border-outline-variant shadow-inner">
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY} internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}>
        <Map
          id="dosje-national-risk-map"
          defaultCenter={{ lat: 23.5, lng: 79.5 }}
          defaultZoom={5}
          mapTypeId={mapLayer === 'satellite' ? 'hybrid' : 'roadmap'}
          gestureHandling="greedy"
          disableDefaultUI={false}
          className="w-full h-full"
        >
          <MapController targetCoords={selectedInstitution.coordinates} />

          {/* Render Markers for all Institutions */}
          {institutions.map((inst) => {
            const coords = inst.coordinates || { lat: 28.6139, lng: 77.2090 };
            const isSelected = selectedInstitution.id === inst.id;
            const pinColor = getSeverityColor(inst.riskScore);

            return (
              <AdvancedMarker
                key={inst.id}
                position={coords}
                onClick={() => {
                  onSelectInstitution(inst);
                  setActiveInfoWindowInst(inst);
                  setActiveSquad(null);
                }}
                title={`${inst.name} (Risk: ${inst.riskScore}%)`}
              >
                <Pin 
                  background={pinColor}
                  borderColor={isSelected ? '#ffffff' : '#1e293b'}
                  glyphColor="#ffffff"
                  scale={isSelected ? 1.3 : 1.0}
                />
              </AdvancedMarker>
            );
          })}

          {/* Render Field Squads when Squads Layer is enabled */}
          {mapLayer === 'squads' && fieldSquads.map((squad) => {
            // Coordinate mapping for squads
            const squadCoords: Record<string, { lat: number; lng: number }> = {
              'squad-01': { lat: 25.5941, lng: 85.0442 }, // Patna
              'squad-02': { lat: 28.7041, lng: 77.1025 }, // Delhi North
              'squad-03': { lat: 26.4499, lng: 80.3319 }, // Kanpur
              'squad-04': { lat: 21.1458, lng: 79.0882 }, // Nagpur
            };

            const coords = squadCoords[squad.id] || { lat: 28.6139, lng: 77.2090 };

            return (
              <AdvancedMarker
                key={squad.id}
                position={coords}
                onClick={() => {
                  setActiveSquad(squad);
                  setActiveInfoWindowInst(null);
                }}
                title={`Tactical Squad: ${squad.callsign}`}
              >
                <div className="px-2 py-1 rounded-md bg-primary-container text-white text-[10px] font-mono font-bold shadow-lg border border-tertiary-fixed flex items-center gap-1">
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                  <span>{squad.callsign}</span>
                </div>
              </AdvancedMarker>
            );
          })}

          {/* InfoWindow for Selected Institution */}
          {activeInfoWindowInst && activeInfoWindowInst.coordinates && (
            <InfoWindow
              position={activeInfoWindowInst.coordinates}
              onCloseClick={() => setActiveInfoWindowInst(null)}
            >
              <div className="p-2 max-w-[280px] font-sans text-slate-900">
                <div className="flex items-center justify-between gap-1 border-b border-slate-200 pb-1.5 mb-1.5">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-white ${
                    activeInfoWindowInst.riskScore >= 80 ? 'bg-red-600' : activeInfoWindowInst.riskScore >= 70 ? 'bg-amber-500' : 'bg-emerald-600'
                  }`}>
                    RISK {activeInfoWindowInst.riskScore}% • {activeInfoWindowInst.riskSeverity}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">{activeInfoWindowInst.darpanId}</span>
                </div>

                <h4 className="font-bold text-xs text-slate-900 leading-snug">
                  {activeInfoWindowInst.name}
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {activeInfoWindowInst.location}
                </p>

                <div className="grid grid-cols-2 gap-1.5 my-2 p-1.5 rounded bg-slate-100 text-[10px] font-mono">
                  <div>
                    <span className="text-slate-500 block">Sanctioned:</span>
                    <strong className="text-slate-900">{activeInfoWindowInst.sanctionedAmount.split(' ')[0]}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Pending Hold:</span>
                    <strong className="text-red-700">{activeInfoWindowInst.pendingTranche}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Headcount Deficit:</span>
                    <strong className="text-red-600">{activeInfoWindowInst.deficit} Beneficiaries</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Officer Geofence:</span>
                    <strong className="text-emerald-700">{activeInfoWindowInst.assignedOfficer.status}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    onClick={() => {
                      onLaunchCCTV(activeInfoWindowInst);
                      setActiveInfoWindowInst(null);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded bg-indigo-900 text-white text-[10px] font-bold hover:bg-indigo-800 transition shadow-xs"
                  >
                    <Camera className="w-3 h-3" />
                    <span>Live CCTV</span>
                  </button>
                  <button
                    onClick={() => {
                      onFreezeTranche(activeInfoWindowInst);
                      setActiveInfoWindowInst(null);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded bg-red-600 text-white text-[10px] font-bold hover:bg-red-700 transition shadow-xs"
                  >
                    <Lock className="w-3 h-3" />
                    <span>Freeze Tranche</span>
                  </button>
                </div>
              </div>
            </InfoWindow>
          )}

          {/* InfoWindow for Selected Tactical Squad */}
          {activeSquad && (
            <InfoWindow
              position={
                activeSquad.id === 'squad-01' ? { lat: 25.5941, lng: 85.0442 } :
                activeSquad.id === 'squad-02' ? { lat: 28.7041, lng: 77.1025 } :
                activeSquad.id === 'squad-03' ? { lat: 26.4499, lng: 80.3319 } :
                { lat: 21.1458, lng: 79.0882 }
              }
              onCloseClick={() => setActiveSquad(null)}
            >
              <div className="p-2 max-w-[240px] font-sans text-slate-900">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-1">
                  <strong className="text-xs font-mono font-bold text-indigo-950">{activeSquad.callsign}</strong>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {activeSquad.activeStatus}
                  </span>
                </div>
                <div className="text-[11px] space-y-1">
                  <div><strong>Lead:</strong> {activeSquad.leadOfficer}</div>
                  <div><strong>Target:</strong> {activeSquad.assignedNGO}</div>
                  <div><strong>Device:</strong> {activeSquad.deviceModel} ({activeSquad.batteryLevel})</div>
                  <div><strong>Warrant:</strong> {activeSquad.warrantType}</div>
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>

      {/* Floating Bottom Left: Field Telemetry Stream */}
      <div className="absolute bottom-3 left-3 max-w-xs sm:max-w-sm w-full bg-surface-container-lowest/90 backdrop-blur-md rounded-lg border border-outline-variant p-2.5 shadow-xl text-xs z-20 hidden md:block pointer-events-auto">
        <div className="flex items-center justify-between pb-1 mb-1 border-b border-outline-variant text-[11px] font-bold text-on-surface">
          <span className="flex items-center gap-1">
            <Radio className="w-3 h-3 text-secondary animate-pulse" />
            <span>GEOFENCE TELEMETRY FEED (LIVE)</span>
          </span>
          <span className="font-mono text-[10px] text-on-surface-variant">RTK GPS LOCKED</span>
        </div>
        <div className="space-y-1 max-h-24 overflow-y-auto pr-1 text-[10px] font-mono">
          {telemetryLogs.slice(0, 3).map((tel) => (
            <div key={tel.id} className="text-on-surface-variant">
              <span className="text-secondary font-semibold">{tel.timestamp}:</span>{' '}
              <span className="text-on-surface font-medium">{tel.title}</span> - {tel.description}
            </div>
          ))}
        </div>
      </div>

      {/* Layer Control Pills in top right */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-surface-container-lowest/90 backdrop-blur-md p-1 rounded-lg border border-outline-variant shadow-md text-xs font-mono">
        <button
          onClick={() => setMapLayer('heat')}
          className={`px-2 py-1 rounded transition ${mapLayer === 'heat' ? 'bg-secondary text-white font-bold' : 'text-on-surface hover:bg-surface-container'}`}
        >
          Roadmap
        </button>
        <button
          onClick={() => setMapLayer('satellite')}
          className={`px-2 py-1 rounded transition ${mapLayer === 'satellite' ? 'bg-secondary text-white font-bold' : 'text-on-surface hover:bg-surface-container'}`}
        >
          Satellite
        </button>
        <button
          onClick={() => setMapLayer('squads')}
          className={`px-2 py-1 rounded transition ${mapLayer === 'squads' ? 'bg-secondary text-white font-bold' : 'text-on-surface hover:bg-surface-container'}`}
        >
          Squads
        </button>
      </div>
    </div>
  );
};
