import React, { useState } from 'react';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  Pin, 
  InfoWindow,
  useMap 
} from '@vis.gl/react-google-maps';
import { FieldSquad } from '../../types';
import { Radio, Navigation, Battery, Video, ShieldAlert } from 'lucide-react';

const GOOGLE_MAPS_API_KEY = ((import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY as string) || "AIzaSyCsX0SM1H_VifwSKQYqeNcWKPSh4rgxcdE";

interface TacticalSquadMapProps {
  squads: FieldSquad[];
  selectedSquadId: string;
  onSelectSquad: (id: string) => void;
  onOpenVideoCall: () => void;
}

const squadCoordinates: Record<string, { lat: number; lng: number }> = {
  'squad-01': { lat: 25.5941, lng: 85.0442 }, // Patna Rural
  'squad-02': { lat: 28.7041, lng: 77.1025 }, // Delhi North
  'squad-03': { lat: 26.4499, lng: 80.3319 }, // Kanpur Dehat
  'squad-04': { lat: 21.1458, lng: 79.0882 }, // Nagpur Zone
};

export const TacticalSquadMap: React.FC<TacticalSquadMapProps> = ({
  squads,
  selectedSquadId,
  onSelectSquad,
  onOpenVideoCall,
}) => {
  const [activeSquad, setActiveSquad] = useState<FieldSquad | null>(null);

  const selectedCoord = squadCoordinates[selectedSquadId] || { lat: 28.7041, lng: 77.1025 };

  return (
    <div className="relative w-full h-[260px] sm:h-[300px] rounded-xl overflow-hidden border border-outline-variant shadow-inner">
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY} internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}>
        <Map
          id="tactical-dispatch-map"
          defaultCenter={{ lat: 25.5, lng: 80.5 }}
          defaultZoom={5}
          mapTypeId="roadmap"
          gestureHandling="greedy"
          disableDefaultUI={false}
          className="w-full h-full"
        >
          {squads.map((squad) => {
            const pos = squadCoordinates[squad.id] || { lat: 28.6139, lng: 77.2090 };
            const isSelected = squad.id === selectedSquadId;

            return (
              <AdvancedMarker
                key={squad.id}
                position={pos}
                onClick={() => {
                  onSelectSquad(squad.id);
                  setActiveSquad(squad);
                }}
                title={`Tactical Squad: ${squad.callsign}`}
              >
                <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-mono font-bold shadow-lg transition transform ${
                  isSelected 
                    ? 'bg-secondary text-white scale-110 ring-2 ring-white z-30' 
                    : 'bg-primary-container text-white hover:scale-105'
                }`}>
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                  <span>{squad.callsign}</span>
                </div>
              </AdvancedMarker>
            );
          })}

          {activeSquad && (
            <InfoWindow
              position={squadCoordinates[activeSquad.id] || { lat: 28.6139, lng: 77.2090 }}
              onCloseClick={() => setActiveSquad(null)}
            >
              <div className="p-2 max-w-[220px] font-sans text-slate-900 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-1 font-mono">
                  <strong>{activeSquad.callsign}</strong>
                  <span className="text-[10px] px-1 rounded bg-emerald-100 text-emerald-800 font-bold">
                    {activeSquad.activeStatus}
                  </span>
                </div>
                <div className="space-y-0.5 text-[11px]">
                  <div><strong>Lead:</strong> {activeSquad.leadOfficer}</div>
                  <div><strong>Target:</strong> {activeSquad.assignedNGO}</div>
                  <div><strong>Distance:</strong> {activeSquad.distanceToTarget}</div>
                  <div><strong>Battery:</strong> {activeSquad.battery}</div>
                </div>
                <button
                  onClick={onOpenVideoCall}
                  className="mt-2 w-full flex items-center justify-center gap-1 py-1 rounded bg-secondary text-white text-[10px] font-bold hover:brightness-110"
                >
                  <Video className="w-3 h-3" />
                  <span>Bodycam Stream</span>
                </button>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>

      <div className="absolute top-2 right-2 z-10 px-2 py-1 rounded bg-surface-container-lowest/90 backdrop-blur-md border border-outline-variant text-[10px] font-mono text-on-surface-variant flex items-center gap-1.5 shadow">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>TACTICAL GPS GEOFENCE ACTIVE</span>
      </div>
    </div>
  );
};
