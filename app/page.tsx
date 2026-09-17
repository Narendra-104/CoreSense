'use client';

import React, { useState } from 'react';
import { useTelemetryEngine } from '@/hooks/useTelemetryEngine';
import { useDemoEngine } from '@/hooks/useDemoEngine';
import { CommandHeader } from '@/components/layout/CommandHeader';
import { PolarRadarCanvas } from '@/components/radar/PolarRadarCanvas';
import { TopographicalMapView } from '@/components/radar/TopographicalMapView';
import { TargetInspectionDrawer } from '@/components/radar/TargetInspectionDrawer';
import { HighAltitudeAtmosphericsCard } from '@/components/thermal/HighAltitudeAtmosphericsCard';
import { AirDensityEngineCard } from '@/components/thermal/AirDensityEngineCard';
import { LifePo4BatteryCard } from '@/components/thermal/LifePo4BatteryCard';
import { PidThermalControllerCard } from '@/components/thermal/PidThermalControllerCard';
import { CountermeasureConsole } from '@/components/countermeasures/CountermeasureConsole';
import { DualBandPtzOptics } from '@/components/sensors/DualBandPtzOptics';
import { RfSpectrumWaterfall } from '@/components/sensors/RfSpectrumWaterfall';
import { AcousticBeamformingCard } from '@/components/sensors/AcousticBeamformingCard';
import { IncursionEventLog } from '@/components/sensors/IncursionEventLog';
import { UsrpB210Panel } from '@/components/sensors/UsrpB210Panel';
import { RwsHardKillPanel } from '@/components/hardkill/RwsHardKillPanel';

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

  // Find inspected track or fallback to active hostile / first track
  const activeTrack =
    tracks.find((t) => t.id === selectedTrackId) ||
    tracks.find((t) => t.threatLevel === 'HOSTILE' || t.threatLevel === 'CRITICAL') ||
    tracks[0] ||
    null;

  const hasHostileTarget = tracks.some(
    (t) => t.threatLevel === 'HOSTILE' || t.threatLevel === 'CRITICAL' || t.threatLevel === 'NEUTRALIZED'
  );
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

      {/* Main Dashboard Layout Arranged Exactly to User Hand-Drawn Spec */}
      <main className="flex-1 p-3 flex flex-col space-y-3.5 max-w-[1920px] mx-auto w-full">
        {/* ================= PAGE 1 LAYOUT ================= */}

        {/* 1. Tactical 360° Polar Radar (Full Width Top Banner) */}
        <section className="w-full h-[460px] lg:h-[500px]">
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
        </section>

        {/* 2. Four-Card Row: Atmospherics | Air Density | LiFePO4 Battery | PID Thermal */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
          <HighAltitudeAtmosphericsCard telemetry={atmospheric} />
          <AirDensityEngineCard telemetry={atmospheric} />
          <LifePo4BatteryCard telemetry={battery} />
          <PidThermalControllerCard
            telemetry={thermal}
            onTriggerDefrost={triggerDefrostCycle}
          />
        </section>

        {/* 3. Hostile - Matrice 300 / Target Inspection (Full Width Middle Banner) */}
        <section className="w-full">
          {activeTrack && (
            <TargetInspectionDrawer
              track={activeTrack}
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
        </section>

        {/* 4. Interlocked Countermeasure Engagement Console (Full Width Bottom Banner) */}
        <section className="w-full">
          <CountermeasureConsole
            state={countermeasures}
            onToggleGnss={toggleGnssJamming}
            onToggleC2={toggleC2Jamming}
            onToggleVideo={toggleVideoJamming}
            onSetPower={setJammingPower}
            onToggleGimbal={toggleGimbalLock}
            onTriggerDefrost={triggerDefrostCycle}
            onLogAction={(title, details, severity) =>
              addLogEvent({
                title,
                details,
                severity,
                sensorSource: 'GUARDIAN_S08',
              })
            }
          />
        </section>

        {/* ================= PAGE 2 LAYOUT ================= */}

        {/* 5. Three Sensor Fusion Cards: Dual-Band PTZ Optics | SDR RF Waterfall | 4-Mic Acoustic (AoA/DF) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full pt-1">
          {/* Dual-Band PTZ Optics Gimbal (XBOOM A30TR1575) */}
          <div className="h-full">
            <DualBandPtzOptics
              isLocked={countermeasures.opticalGimbalLocked}
              azimuthDeg={countermeasures.opticalGimbalAzimuthDeg}
              elevationDeg={countermeasures.opticalGimbalElevationDeg}
              hasHostileTarget={hasHostileTarget}
              isMitigated={isTargetMitigated}
            />
          </div>

          {/* SDR RF Spectrum & Waterfall (NI Ettus USRP B210) */}
          <div className="h-full">
            <RfSpectrumWaterfall
              isJammingActive={countermeasures.c2LinkJammingActive || countermeasures.gnssJammingActive}
              selectedBand={selectedRfBand}
              setSelectedBand={setSelectedRfBand}
              hasHostileSignal={hasHostileTarget}
            />
          </div>

          {/* Direction-Finding / 4-Mic AoA Array */}
          <div className="h-full">
            <AcousticBeamformingCard
              hasHostileSignal={hasHostileTarget}
              confidence={activeTrack ? activeTrack.dfConfidencePct || 91 : 0}
            />
          </div>
        </section>

        {/* 6. 35–40mm RWS — AHEAD-Class Airburst Hard-Kill System (Moved Below the 3 Sensor Cards) */}
        <section className="w-full">
          <RwsHardKillPanel
            state={countermeasures.rws}
            onSetRwsFireMode={setRwsFireMode}
            onAuthorizeRoe={authorizeRoe}
            onFireRwsBurst={fireRwsBurst}
            onLogAction={(title, details, severity) =>
              addLogEvent({
                title,
                details,
                severity,
                sensorSource: 'RWS_HARDKILL',
              })
            }
          />
        </section>

        {/* NI Ettus USRP B210 Hardware Health Strip */}
        <section className="w-full">
          <UsrpB210Panel units={usrpUnits} />
        </section>

        {/* 7. Incursion & Telemetry Audit Log (Full Width Card) */}
        <section className="w-full pb-4">
          <IncursionEventLog events={logEvents} />
        </section>
      </main>
    </div>
  );
}
