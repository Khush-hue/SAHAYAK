import React, { useState } from 'react';
import { useVigilance } from '../../context/VigilanceContext';
import { 
  X, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Circle, 
  ZoomIn, 
  ZoomOut, 
  Sliders, 
  Camera, 
  RefreshCw 
} from 'lucide-react';

export const PTZControlModal: React.FC = () => {
  const { activePTZCam, closePTZModal, showToast } = useVigilance();
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [activePreset, setActivePreset] = useState<string>('preset-1');

  if (!activePTZCam) return null;

  const handlePanTilt = (direction: string) => {
    showToast(`PTZ Command: Pan/Tilt ${direction} dispatched to ${activePTZCam.camCode}`);
  };

  const handleZoomChange = (delta: number) => {
    setZoomLevel(prev => {
      const next = Math.min(8.0, Math.max(1.0, parseFloat((prev + delta).toFixed(1))));
      showToast(`PTZ Zoom adjusted to ${next}x`);
      return next;
    });
  };

  const handlePresetSelect = (preset: string) => {
    setActivePreset(preset);
    showToast(`PTZ Servo Recalled: ${preset}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full overflow-hidden border border-outline-variant shadow-2xl space-y-4 p-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-secondary" />
            <div>
              <h3 className="text-sm font-bold text-on-surface uppercase font-mono">
                PTZ Remote Servo Controls • {activePTZCam.camCode}
              </h3>
              <p className="text-xs text-on-surface-variant">
                {activePTZCam.name} ({activePTZCam.locationDetails})
              </p>
            </div>
          </div>
          <button
            onClick={closePTZModal}
            className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview Stream Mini Window */}
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-outline-variant">
          <img
            src={activePTZCam.imageUrl}
            alt={activePTZCam.name}
            style={{ transform: `scale(${zoomLevel})` }}
            className="w-full h-full object-cover transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-2 left-2 bg-black/70 text-white font-mono text-[9px] px-1.5 py-0.5 rounded">
            ZOOM: {zoomLevel.toFixed(1)}x • MOTOR: READY
          </div>
        </div>

        {/* Pan/Tilt D-Pad & Zoom Controls */}
        <div className="grid grid-cols-2 gap-4 pt-1">
          {/* Pan/Tilt 4-Way D-Pad */}
          <div className="flex flex-col items-center justify-center">
            <span className="text-[11px] font-mono text-on-surface-variant mb-2 font-bold uppercase">
              Pan / Tilt Servo
            </span>
            <div className="grid grid-cols-3 gap-1.5 w-32 h-32 bg-surface-container-low p-2 rounded-2xl border border-outline-variant">
              <div></div>
              <button
                onClick={() => handlePanTilt('UP')}
                className="rounded-lg bg-surface-container hover:bg-secondary hover:text-white transition flex items-center justify-center text-on-surface active:scale-90"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
              <div></div>

              <button
                onClick={() => handlePanTilt('LEFT')}
                className="rounded-lg bg-surface-container hover:bg-secondary hover:text-white transition flex items-center justify-center text-on-surface active:scale-90"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => handlePanTilt('CENTER / RECENTER')}
                className="rounded-lg bg-surface-container-high hover:bg-secondary hover:text-white transition flex items-center justify-center text-on-surface text-[10px] font-bold"
              >
                <Circle className="w-3 h-3" />
              </button>
              <button
                onClick={() => handlePanTilt('RIGHT')}
                className="rounded-lg bg-surface-container hover:bg-secondary hover:text-white transition flex items-center justify-center text-on-surface active:scale-90"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <div></div>
              <button
                onClick={() => handlePanTilt('DOWN')}
                className="rounded-lg bg-surface-container hover:bg-secondary hover:text-white transition flex items-center justify-center text-on-surface active:scale-90"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
              <div></div>
            </div>
          </div>

          {/* Optical Zoom & Focus */}
          <div className="space-y-3 flex flex-col justify-center">
            <div>
              <span className="text-[11px] font-mono text-on-surface-variant font-bold uppercase">
                Optical Zoom ({zoomLevel.toFixed(1)}x)
              </span>
              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={() => handleZoomChange(-0.5)}
                  className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant transition"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="0.5"
                  value={zoomLevel}
                  onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                  className="flex-1 accent-secondary"
                />
                <button
                  onClick={() => handleZoomChange(0.5)}
                  className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant transition"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Presets */}
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-on-surface-variant font-bold uppercase">
                Calibrated Presets
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
                <button
                  onClick={() => handlePresetSelect('PRESET 1: ENTRANCE TURNSTILE')}
                  className="p-1.5 rounded bg-surface-container hover:bg-surface-container-high text-left border border-outline-variant text-[10px]"
                >
                  P-1: Turnstile
                </button>
                <button
                  onClick={() => handlePresetSelect('PRESET 2: AEBAS TERMINAL')}
                  className="p-1.5 rounded bg-surface-container hover:bg-surface-container-high text-left border border-outline-variant text-[10px]"
                >
                  P-2: Terminal
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-outline-variant flex justify-end">
          <button
            onClick={closePTZModal}
            className="px-4 py-1.5 rounded-lg bg-secondary text-white text-xs font-bold hover:brightness-110 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
