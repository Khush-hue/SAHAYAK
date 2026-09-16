import React from 'react';
import { useVigilance } from '../../context/VigilanceContext';
import { X, Bell, ShieldAlert, Radio, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const NotificationDrawer: React.FC = () => {
  const { isNotificationDrawerOpen, setIsNotificationDrawerOpen, telemetryLogs, showToast } = useVigilance();

  if (!isNotificationDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        onClick={() => setIsNotificationDrawerOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      ></div>

      <div className="absolute inset-y-0 right-0 max-w-md w-full bg-surface-container-lowest shadow-2xl border-l border-outline-variant flex flex-col z-10">
        {/* Header */}
        <div className="p-4 bg-primary-container text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-tertiary-fixed" />
            <h3 className="text-sm font-bold tracking-tight">
              National Vigilance Telemetry Feed
            </h3>
          </div>
          <button
            onClick={() => setIsNotificationDrawerOpen(false)}
            className="p-1 rounded hover:bg-white/10 text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Real-Time Alerts */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1 divide-y divide-outline-variant/50">
          {telemetryLogs.map((log) => (
            <div key={log.id} className="pt-3 first:pt-0 space-y-1 text-xs">
              <div className="flex items-center justify-between font-mono">
                <span className="text-[10px] text-secondary font-bold">{log.timestamp}</span>
                <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-surface-container-high font-bold text-on-surface-variant">
                  {log.type}
                </span>
              </div>
              <h4 className="font-bold text-on-surface text-xs">{log.title}</h4>
              <p className="text-on-surface-variant text-[11px] leading-relaxed font-sans">{log.description}</p>
              {log.tags && (
                <div className="flex gap-1 flex-wrap pt-1">
                  {log.tags.map((t, idx) => (
                    <span key={idx} className="px-1.5 py-0.2 rounded bg-surface-container text-[9px] font-mono font-bold text-on-surface-variant">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 bg-surface-container border-t border-outline-variant text-center">
          <button
            onClick={() => {
              setIsNotificationDrawerOpen(false);
              showToast('Marked all vigilance alerts as reviewed.');
            }}
            className="text-xs font-bold text-secondary hover:underline"
          >
            Acknowledge & Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
};
