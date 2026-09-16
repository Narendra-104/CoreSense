'use client';

import React, { useState } from 'react';
import { useTelemetryEngine } from '@/hooks/useTelemetryEngine';
import { useDemoEngine } from '@/hooks/useDemoEngine';
import { CommandHeader } from '@/components/layout/CommandHeader';
import { PolarRadarCanvas } from '@/components/radar/PolarRadarCanvas';
import { TopographicalMapView } from '@/components/radar/TopographicalMapView';
import { TargetInspectionDrawer } from '@/components/radar/TargetInspectionDrawer';
import { AtmosphericEngineCard } from '@/components/thermal/AtmosphericEngineCard';
import { PidThermalControllerCard } from '@/components/thermal/PidThermalControllerCard';
import { LifePo4BatteryCard } from '@/components/thermal/LifePo4BatteryCard';
import { RfSpectrumWaterfall } from '@/components/sensors/RfSpectrumWaterfall';
import { AcousticBeamformingCard } from '@/components/sensors/AcousticBeamformingCard';
import { DualBandPtzOptics } from '@/components/sensors/DualBandPtzOptics';
import { IncursionEventLog } from '@/components/sensors/IncursionEventLog';
import { CountermeasureConsole } from '@/components/countermeasures/CountermeasureConsole';
import { UsrpB210Panel } from '@/components/sensors/UsrpB210Panel';

export default function MissionControlDashboard() {
  const {
    atmospheric,
    thermal,
    battery,
    network,
    setNetwork,
    countermeasures,
    setCountermeasures,
    usrpUnits,
    tracks,
    setTracks,
    selectedTrackId,
    setSelectedTrackId,
    logEvents,
    addLogEvent,
    toggleGnssJamming,
    toggleC2Jamming,
    toggleVideoJamming,
    setJammingPower,
    toggleGimbalLock,
    armNetLauncher,
    setRwsFireMode,
    authorizeRoe,
    fireRwsBurst,
    triggerDefrostCycle,
  } = useTelemetryEngine();

  const {
    demoState,
    startDemo,
    pauseDemo,
    resumeDemo,
    resetDemo,
    jumpToPhase,
    setPlaybackSpeed,
    injectCustomDrone,
  } = useDemoEngine({
    tracks,
    setTracks,
    setSelectedTrackId,
    addLogEvent,
    setCountermeasures,
    setNetwork,
  });

  const [radarMode, setRadarMode] = useState<'POLAR' | 'TERRAIN'>('POLAR');
  const [selectedRfBand, setSelectedRfBand] = useState<'900M' | '2.4G' | '5.8G' | 'GNSS' | 'ALL'>('ALL');

  const selectedTrack = tracks.find((t) => t.id === selectedTrackId) || null;
  const hasHostileTarget = tracks.some((t) => t.threatLevel === 'HOSTILE' || t.threatLevel === 'CRITICAL' || t.threatLevel === 'NEUTRALIZED');
  const isTargetMitigated = tracks.some((t) => t.isMitigated);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-mono selection:bg-sky-200 selection:text-slate-900">
      {/* Command Header */}
      <CommandHeader
        network={network}
        demoState={demoState}
        onStartDemo={startDemo}
        onPauseDemo={pauseDemo}
        onResumeDemo={resumeDemo}
        onResetDemo={resetDemo}
        onJumpToPhase={jumpToPhase}
        onSetSpeed={setPlaybackSpeed}
        onInjectTarget={injectCustomDrone}
      />

      {/* Main Mission Control Grid */}
      <main className="flex-1 p-3 grid grid-cols-1 xl:grid-cols-12 gap-3 max-w-[1920px] mx-auto w-full">
        {/* Left Column: Tactical Radar / Topography & Countermeasures (7 Columns on XL) */}
        <div className="xl:col-span-7 flex flex-col space-y-3">
          {/* Primary Visualization Area: Polar Radar or Mountain LOS Terrain */}
          <div className="min-h-[460px] flex-1">
            {radarMode === 'POLAR' ? (
              <PolarRadarCanvas
                tracks={tracks}
                selectedTrackId={selectedTrackId}
                onSelectTrack={setSelectedTrackId}
                radarMode={radarMode}
                setRadarMode={setRadarMode}
              />
            ) : (
              <TopographicalMapView
                tracks={tracks}
                selectedTrackId={selectedTrackId}
                onSelectTrack={setSelectedTrackId}
                onSwitchToPolar={() => setRadarMode('POLAR')}
              />
            )}
          </div>

          {/* Target Inspector (when a track is selected) */}
          {selectedTrack && (
            <TargetInspectionDrawer
              track={selectedTrack}
              onClose={() => setSelectedTrackId(null)}
              onAutoSlewGimbal={toggleGimbalLock}
              onEngageJammer={() => {
                toggleC2Jamming();
                toggleGnssJamming();
              }}
              isGimbalLocked={countermeasures.opticalGimbalLocked}
              isJammingActive={countermeasures.c2LinkJammingActive || countermeasures.gnssJammingActive}
            />
          )}

          {/* Interlocked Countermeasure & Mitigation Console */}
          {/* Interlocked Countermeasure & Mitigation Console */}
          <CountermeasureConsole
            state={countermeasures}
            onToggleGnss={toggleGnssJamming}
            onToggleC2={toggleC2Jamming}
            onToggleVideo={toggleVideoJamming}
            onSetPower={setJammingPower}
            onToggleGimbal={toggleGimbalLock}
            onArmNetLauncher={armNetLauncher}
            onTriggerDefrost={triggerDefrostCycle}
            onSetRwsFireMode={setRwsFireMode}
            onAuthorizeRoe={authorizeRoe}
            onFireRwsBurst={fireRwsBurst}
            onLogAction={(title, details, severity) =>
              addLogEvent({
                title,
                details,
                severity,
                sensorSource: 'GUARDIAN_S08',
              })
            }
          />

          {/* Live Incursion Audit Log */}
          <IncursionEventLog events={logEvents} />
        </div>

        {/* Right Column: High-Altitude Core Telemetry & Multi-Sensor Fusion (5 Columns on XL) */}
        <div className="xl:col-span-5 flex flex-col space-y-3">
          {/* NI Ettus USRP B210 Array Panel */}
          <UsrpB210Panel units={usrpUnits} />

          {/* Dedicated High-Altitude Performance & Thermal Optimization Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <AtmosphericEngineCard telemetry={atmospheric} />
            <PidThermalControllerCard
              telemetry={thermal}
              onTriggerDefrost={triggerDefrostCycle}
            />
          </div>

          {/* LiFePO4 Cold-Discharge Power System */}
          <LifePo4BatteryCard telemetry={battery} />

          {/* Dual-Band PTZ Optics (LWIR + Visible) Feed */}
          <DualBandPtzOptics
            isLocked={countermeasures.opticalGimbalLocked}
            azimuthDeg={countermeasures.opticalGimbalAzimuthDeg}
            elevationDeg={countermeasures.opticalGimbalElevationDeg}
            hasHostileTarget={hasHostileTarget}
            isMitigated={isTargetMitigated}
          />

          {/* SDR RF Spectrum & Dynamic Waterfall Visualizer */}
          <RfSpectrumWaterfall
            isJammingActive={countermeasures.c2LinkJammingActive || countermeasures.gnssJammingActive}
            selectedBand={selectedRfBand}
            setSelectedBand={setSelectedRfBand}
            hasHostileSignal={hasHostileTarget}
          />

          {/* USRP B210 Direction-Finding Card */}
          <AcousticBeamformingCard
            hasHostileSignal={hasHostileTarget}
            confidence={selectedTrack ? selectedTrack.dfConfidencePct || 91 : 0}
          />
        </div>
      </main>
    </div>
  );
}
