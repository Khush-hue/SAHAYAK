import React, { useState, useMemo } from 'react';
import { useVigilance } from '../../context/VigilanceContext';
import { Institution } from '../../types';
import { GoogleRiskMap } from '../maps/GoogleRiskMap';
import { 
  AlertTriangle, 
  MapPin, 
  Search, 
  Filter, 
  RotateCw, 
  ShieldAlert, 
  Lock, 
  Camera, 
  Video, 
  ChevronRight, 
  Download, 
  Layers, 
  Compass, 
  Radio, 
  CheckSquare, 
  Square,
  FileSpreadsheet
} from 'lucide-react';

export const RiskHeatmap: React.FC = () => {
  const { 
    syncState, 
    selectedInstitution, 
    setSelectedInstitution, 
    telemetryLogs, 
    freezeTranche, 
    reRunMLModel, 
    openVideoCall,
    setActiveTab, 
    showToast 
  } = useVigilance();

  // Filters
  const [selectedScheme, setSelectedScheme] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRows, setSelectedRows] = useState<string[]>(['pragati-shiksha']);
  const [mapLayer, setMapLayer] = useState<'heat' | 'satellite' | 'squads'>('heat');
  const [isRecalculating, setIsRecalculating] = useState<boolean>(false);

  const filteredInstitutions = useMemo(() => {
    return syncState.institutions.filter(inst => {
      if (selectedScheme !== 'all' && !inst.scheme.toLowerCase().includes(selectedScheme.toLowerCase())) {
        return false;
      }
      if (selectedSeverity !== 'all' && inst.riskSeverity !== selectedSeverity) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return inst.name.toLowerCase().includes(q) || 
               inst.darpanId.toLowerCase().includes(q) || 
               inst.district.toLowerCase().includes(q);
      }
      return true;
    });
  }, [syncState.institutions, selectedScheme, selectedSeverity, searchQuery]);

  const handleReRunModel = async () => {
    setIsRecalculating(true);
    await reRunMLModel();
    setTimeout(() => {
      setIsRecalculating(false);
    }, 900);
  };

  const toggleSelectRow = (id: string) => {
    setSelectedRows(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleLaunchCCTV = (inst: Institution) => {
    setSelectedInstitution(inst);
    setActiveTab('cctv');
    showToast(`Switched to Live CCTV stream for ${inst.name}`);
  };

  const handleFreezeFromTable = async (inst: Institution) => {
    setSelectedInstitution(inst);
    if (inst.id === 'pragati-shiksha') {
      setActiveTab('adjudication');
    } else {
      await freezeTranche();
      showToast(`Statutory hold initiated for ${inst.name} (${inst.darpanId})`);
    }
  };

  const handleExportReport = () => {
    showToast('Exporting National Vigilance Risk Dossier (Excel/PDF)... File download initiated.');
  };

  return (
    <div className="space-y-4">
      {/* 1. Status & Geo-Sync Bar */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant px-4 py-2 text-xs font-mono flex flex-wrap items-center justify-between gap-2 shadow-xs">
        <div className="flex items-center gap-3 flex-wrap text-on-surface-variant">
          <span className="text-emerald-500 font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            POSTGIS CLUSTER ENGINE: ACTIVE (28 STATES)
          </span>
          <span className="text-outline-variant">|</span>
          <span>FASTAPI SURVEILLANCE MICROSERVICES: HEALTHY</span>
          <span className="text-outline-variant">|</span>
          <span className="text-secondary font-bold">e-Anudaan PFMS DB SYNC: REAL-TIME</span>
        </div>

        <div className="text-[11px] text-on-surface-variant">
          CENTRAL ML RUN: 14:15 IST • RESCORING INTERVAL: 300S
        </div>
      </div>

      {/* 2. Executive KPI Ribbon (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Monitored Units */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 shadow-xs">
          <div className="text-xs font-medium text-on-surface-variant uppercase">Monitored Facilities</div>
          <div className="text-2xl font-bold font-mono text-on-surface mt-1">14,820 Units</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            +412 New Enrolment FY 25-26
          </div>
        </div>

        {/* Card 2: Active Flags */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 shadow-xs">
          <div className="text-xs font-medium text-on-surface-variant uppercase">Active Anomaly Flags</div>
          <div className="text-2xl font-bold font-mono text-error mt-1">142 Flags</div>
          <div className="text-[11px] text-on-surface-variant font-mono mt-1">
            96 AEBAS Deltas • 46 CCTV Drops
          </div>
        </div>

        {/* Card 3: Surprise Audits */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 shadow-xs">
          <div className="text-xs font-medium text-on-surface-variant uppercase">Surprise Audits Active</div>
          <div className="text-2xl font-bold font-mono text-secondary mt-1">
            {syncState.activeAuditsCount} Squads
          </div>
          <div className="text-[11px] text-on-surface-variant font-medium mt-1">
            19 In-Progress • 19 Queued
          </div>
        </div>

        {/* Card 4: Active Holds */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 shadow-xs">
          <div className="text-xs font-medium text-on-surface-variant uppercase">Cumulative Grant Holds</div>
          <div className="text-2xl font-bold font-mono text-error mt-1">
            ₹{syncState.activeHoldsTotalCr.toFixed(1)} Cr
          </div>
          <div className="text-[11px] text-error font-medium mt-1">
            {syncState.frozenTranchesCount} Tranches Frozen (Sec 44A)
          </div>
        </div>
      </div>

      {/* 3. Filter & Query Control Strip */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-3 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 flex-wrap flex-1">
          {/* Search Box */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search NGO name, Darpan ID, District..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant text-xs text-on-surface focus:outline-hidden focus:ring-1 focus:ring-secondary"
            />
          </div>

          {/* Scheme Dropdown */}
          <select
            value={selectedScheme}
            onChange={(e) => setSelectedScheme(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-surface-container border border-outline-variant text-xs text-on-surface"
          >
            <option value="all">All Central Schemes</option>
            <option value="DDRS">DDRS Divyangjan</option>
            <option value="SHATAYU">SHATAYU Senior Citizens</option>
            <option value="NAPDDR">NAPDDR De-Addiction</option>
            <option value="Top Class">SC Top Class Hostels</option>
          </select>

          {/* Severity Dropdown */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-surface-container border border-outline-variant text-xs text-on-surface"
          >
            <option value="all">All Severity Levels</option>
            <option value="CRITICAL">Critical (&gt;80)</option>
            <option value="HIGH RISK">High Risk (70-79)</option>
            <option value="ELEVATED">Elevated (60-69)</option>
          </select>

          {/* Reset Filters */}
          {(selectedScheme !== 'all' || selectedSeverity !== 'all' || searchQuery !== '') && (
            <button
              onClick={() => {
                setSelectedScheme('all');
                setSelectedSeverity('all');
                setSearchQuery('');
              }}
              className="text-secondary hover:underline font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Re-run ML Model button */}
        <button
          onClick={handleReRunModel}
          disabled={isRecalculating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-container text-on-primary-container hover:brightness-110 font-bold transition shadow-xs"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin' : ''}`} />
          <span>{isRecalculating ? 'Re-scoring Weights...' : 'Re-Run ML Anomaly Model'}</span>
        </button>
      </div>

      {/* 4. National PostGIS Spatial Risk Grid (Interactive Google Maps Platform) */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-xs p-1">
        <div className="p-3 bg-surface-container flex items-center justify-between border-b border-outline-variant rounded-t-lg mb-1">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-secondary" />
            <h3 className="text-xs sm:text-sm font-bold text-on-surface uppercase tracking-wide">
              National PostGIS Spatial Risk Grid • Interactive Google Map
            </h3>
          </div>
          <div className="text-[11px] font-mono text-on-surface-variant flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Google Maps Platform Active</span>
          </div>
        </div>

        <GoogleRiskMap
          institutions={filteredInstitutions}
          selectedInstitution={selectedInstitution}
          onSelectInstitution={(inst) => {
            setSelectedInstitution(inst);
            showToast(`Selected facility: ${inst.name}`);
          }}
          mapLayer={mapLayer}
          setMapLayer={setMapLayer}
          fieldSquads={syncState.fieldSquads || []}
          onLaunchCCTV={handleLaunchCCTV}
          onFreezeTranche={handleFreezeFromTable}
          telemetryLogs={telemetryLogs}
        />
      </div>

      {/* 5. High-Risk Statutory Anomaly Prioritization Matrix (Table) */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-on-surface uppercase tracking-wide">
              High-Risk Statutory Anomaly Prioritization Matrix
            </h3>
            <p className="text-xs text-on-surface-variant">
              Facilities ranked by AI Variance Probability based on AEBAS discrepancies and CCTV stream blackouts.
            </p>
          </div>

          {/* Bulk Action Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportReport}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold border border-outline-variant transition"
              title="Download Full Vigilance Dossier in Excel/PDF format"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Report</span>
            </button>

            {syncState.isTranche3Frozen ? (
              <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold">
                <Lock className="w-3.5 h-3.5" />
                <span>Tranche 3 Frozen</span>
              </span>
            ) : (
              <button
                onClick={freezeTranche}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-error text-white text-xs font-bold hover:brightness-110 active:scale-95 transition shadow-xs"
                title="Execute immediate Stage-1 grant hold on selected facilities"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Bulk Tranche Freeze</span>
              </button>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-lg border border-outline-variant">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-surface-container-high text-on-surface-variant uppercase text-[10px]">
              <tr>
                <th className="p-3 w-10 text-center">
                  <span className="sr-only">Select</span>
                </th>
                <th className="px-3 py-2.5">Institution & Darpan ID</th>
                <th className="px-3 py-2.5">Scheme & Location</th>
                <th className="px-3 py-2.5">AEBAS vs Physical</th>
                <th className="px-3 py-2.5">AI Risk Score</th>
                <th className="px-3 py-2.5">Assigned Officer</th>
                <th className="px-3 py-2.5 text-right">Statutory Enforcement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60 bg-surface-container-low">
              {filteredInstitutions.map((inst) => {
                const isSelected = selectedRows.includes(inst.id);
                const isCurrent = selectedInstitution.id === inst.id;
                const isInstFrozen = inst.isFrozen || (inst.id === 'pragati-shiksha' && syncState.isTranche3Frozen);

                return (
                  <tr 
                    key={inst.id}
                    className={`transition-colors ${
                      isCurrent 
                        ? 'bg-secondary-fixed/30 dark:bg-secondary-fixed/10' 
                        : 'hover:bg-surface-container'
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="p-3 text-center">
                      <button 
                        onClick={() => toggleSelectRow(inst.id)}
                        className="text-on-surface-variant hover:text-secondary"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-secondary" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* Name & Darpan ID */}
                    <td className="px-3 py-2.5">
                      <div className="font-sans font-bold text-on-surface">
                        {inst.name}
                      </div>
                      <div className="text-[10px] text-on-surface-variant font-mono">
                        DARPAN: {inst.darpanId}
                      </div>
                    </td>

                    {/* Scheme & District */}
                    <td className="px-3 py-2.5">
                      <div className="text-on-surface font-semibold">{inst.scheme}</div>
                      <div className="text-[10px] text-on-surface-variant">{inst.location}</div>
                    </td>

                    {/* AEBAS vs Physical Count */}
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span>AEBAS: {inst.aebasRegistered}</span>
                        <span>/</span>
                        <span>Phys: {inst.physicalCount}</span>
                      </div>
                      <div className="text-error font-bold text-[10px]">
                        Deficit: {inst.deficit} Beneficiaries
                      </div>
                    </td>

                    {/* Risk Score */}
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inst.riskSeverity === 'CRITICAL'
                            ? 'bg-error-container text-on-error-container'
                            : inst.riskSeverity === 'HIGH RISK'
                              ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-surface-container-highest text-on-surface'
                        }`}>
                          {inst.riskScore}/100 • {inst.riskSeverity}
                        </span>
                      </div>
                    </td>

                    {/* Officer */}
                    <td className="px-3 py-2.5">
                      <div className="text-on-surface font-medium">{inst.assignedOfficer.name}</div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400">
                        {inst.assignedOfficer.status}
                      </div>
                    </td>

                    {/* Action buttons */}
                    <td className="px-3 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleLaunchCCTV(inst)}
                          className="px-2 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface text-[11px] font-semibold border border-outline-variant transition flex items-center gap-1"
                          title="View live CCTV feed"
                        >
                          <Camera className="w-3 h-3 text-secondary" />
                          <span>CCTV</span>
                        </button>

                        <button
                          onClick={() => handleFreezeFromTable(inst)}
                          className={`px-2 py-1 rounded text-[11px] font-bold transition flex items-center gap-1 ${
                            isInstFrozen
                              ? 'bg-primary-container text-white'
                              : 'bg-error text-white hover:brightness-110'
                          }`}
                          title="Execute grant freeze"
                        >
                          <Lock className="w-3 h-3" />
                          <span>{isInstFrozen ? 'Frozen' : 'Freeze'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Statutory Compliance & Audit Authority Notice Banner */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 shadow-xs flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
        <div className="text-xs text-on-surface-variant leading-relaxed">
          <strong className="text-on-surface font-bold">STATUTORY NOTICE UNDER CENTRAL VIGILANCE ACT (SECTION 44A):</strong>{' '}
          The Competent Authority holds non-appealable administrative jurisdiction to enforce immediate grant holds on electronic PFMS disbursals whenever field inspectors establish verified discrepancies in AEBAS biometric attendance or intentional CCTV feed blackouts during prescribed operating hours.
        </div>
      </div>
    </div>
  );
};
