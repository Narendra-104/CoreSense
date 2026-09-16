import { useState, useEffect, useRef, useCallback } from 'react';
import { DemoPhase, DemoScenarioState, TargetTrack, IncursionLogEvent } from '@/types/dashboard';
import { soundEngine } from '@/utils/soundSynthesizer';

interface UseDemoEngineProps {
  tracks: TargetTrack[];
  setTracks: React.Dispatch<React.SetStateAction<TargetTrack[]>>;
  setSelectedTrackId: (id: string | null) => void;
  addLogEvent: (event: Omit<IncursionLogEvent, 'id' | 'timestamp' | 'timeOffsetSec'>) => void;
  setCountermeasures: React.Dispatch<React.SetStateAction<any>>;
  setNetwork: React.Dispatch<React.SetStateAction<any>>;
}

export function useDemoEngine({
  setTracks,
  setSelectedTrackId,
  addLogEvent,
  setCountermeasures,
  setNetwork,
}: UseDemoEngineProps) {
  const [demoState, setDemoState] = useState<DemoScenarioState>({
    isRunning: false,
    currentPhase: 0,
    elapsedSeconds: 0,
    playbackSpeed: 1,
    phaseDescription: 'Phase 0: Baseline Sentry — AGT3DRD5000X + USRP B210 ×3 Online',
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const phaseDescriptions: Record<DemoPhase, string> = {
    0: 'T+0s: Baseline Sentry — FlySpark AGT3DRD5000X + USRP B210 ×3 sweeping, XBOOM A30TR1575 standby',
    1: 'T+3s: USRP B210 AoA Fix — 2.437 GHz OcuSync burst detected, AoA bearing 042°, DEFCON 3',
    2: 'T+6s: AGT3DRD5000X Ku-Band Track Confirmed + XBOOM AI Lock — DEFCON 2, Hostile Inbound',
    3: 'T+10s: XBOOM A30TR1575 Slew-to-Cue + Guardian-S08 Directional Jam Advisory',
    4: 'T+14s: Guardian-S08 180W EIRP Active — C2 Link Severed, Target Neutralized',
  };

  const hostileTrackTemplate: TargetTrack = {
    id: 'TRK-H-809',
    callsign: 'HOSTILE-MATRICE-300',
    classification: 'HOSTILE_DRONE',
    threatLevel: 'HOSTILE',
    rangeMeters: 4200,
    azimuthDeg: 42,
    elevationDeg: 14.5,
    altitudeMslMeters: 5120,
    altitudeAglMeters: 270,
    groundSpeedKmh: 68.4,
    climbRateMs: -1.2,
    rfFrequencyGhz: 2.437,
    rfProtocol: 'DJI OcuSync 3.0',
    rfSignalDbm: -74,
    aoaBearingDeg: 42.1,
    tdoaTimeDiffNs: 14.6,
    dfConfidencePct: 91,
    kuBandReflectivity: -12.4,
    radarCrossSection: 0.18,
    opticalConfidence: 94,
    xboomLrfRangeM: 4198,
    fusionConfidence: 96,
    losBlocked: false,
    isTargetLocked: true,
    isMitigated: false,
    firstDetectedAt: '09:03:10 UTC',
    history: [],
  };

  const applyPhaseEffects = useCallback((phase: DemoPhase) => {
    switch (phase) {
      case 0: {
        setTracks((prev) => prev.filter((t) => t.id !== 'TRK-H-809' && t.id !== 'TRK-U-404'));
        setSelectedTrackId(null);
        setNetwork((prev: any) => ({ ...prev, defconLevel: 4, readinessState: 'OPTIMAL' }));
        setCountermeasures((prev: any) => ({
          ...prev,
          gnssJammingActive: false,
          c2LinkJammingActive: false,
          videoDownlinkJammingActive: false,
          opticalGimbalLocked: false,
          xboomAiTrackActive: false,
        }));
        break;
      }
      case 1: {
        // USRP B210 AoA fix — unidentified RF
        const rfAnomalyTrack: TargetTrack = {
          id: 'TRK-U-404',
          callsign: 'UNID-RF-ANOMALY',
          classification: 'UNIDENTIFIED_RF',
          threatLevel: 'ELEVATED',
          rangeMeters: 4200,
          azimuthDeg: 42,
          elevationDeg: 12.0,
          altitudeMslMeters: 5080,
          altitudeAglMeters: 230,
          groundSpeedKmh: 62.0,
          climbRateMs: 0.5,
          rfFrequencyGhz: 2.437,
          rfProtocol: 'DJI OcuSync 3.0',
          rfSignalDbm: -82,
          aoaBearingDeg: 41.8,
          tdoaTimeDiffNs: 14.2,
          dfConfidencePct: 72,
          kuBandReflectivity: -15.2,
          radarCrossSection: 0.09,
          opticalConfidence: 40,
          xboomLrfRangeM: 4198,
          fusionConfidence: 62,
          losBlocked: false,
          isTargetLocked: false,
          isMitigated: false,
          firstDetectedAt: '09:03:03 UTC',
          history: [
            { x: 4200 * Math.sin(42 * Math.PI / 180), y: 4200 * Math.cos(42 * Math.PI / 180), timestamp: Date.now() }
          ],
        };
        setTracks((prev) => [...prev.filter((t) => t.id !== 'TRK-U-404' && t.id !== 'TRK-H-809'), rfAnomalyTrack]);
        setSelectedTrackId('TRK-U-404');
        setNetwork((prev: any) => ({ ...prev, defconLevel: 3, readinessState: 'OPTIMAL' }));
        soundEngine?.playAnomalyChirp();
        addLogEvent({
          severity: 'WARNING',
          sensorSource: 'USRP_B210',
          title: 'USRP B210 — 2.437 GHz FHSS Burst at 4.2 km',
          details: 'NI Ettus USRP B210 Unit-1 detected DJI OcuSync 3.0 FHSS burst. AoA fix: 041.8° ±2.1°. TDOA: 14.2ns. DF confidence: 72%. AGT3DRD5000X tasked to correlate.',
          targetId: 'TRK-U-404',
        });
        break;
      }
      case 2: {
        // AGT3DRD5000X Ku-band track + XBOOM AI lock
        const activeHostile: TargetTrack = {
          ...hostileTrackTemplate,
          rangeMeters: 3100,
          azimuthDeg: 42,
          history: [
            { x: 4200 * Math.sin(42 * Math.PI / 180), y: 4200 * Math.cos(42 * Math.PI / 180), timestamp: Date.now() - 3000 },
            { x: 3600 * Math.sin(42 * Math.PI / 180), y: 3600 * Math.cos(42 * Math.PI / 180), timestamp: Date.now() - 1500 },
            { x: 3100 * Math.sin(42 * Math.PI / 180), y: 3100 * Math.cos(42 * Math.PI / 180), timestamp: Date.now() },
          ],
        };
        setTracks((prev) => [...prev.filter((t) => t.id !== 'TRK-U-404' && t.id !== 'TRK-H-809'), activeHostile]);
        setSelectedTrackId('TRK-H-809');
        setNetwork((prev: any) => ({ ...prev, defconLevel: 2, readinessState: 'ENGAGING' }));
        soundEngine?.playHostileAlert();
        addLogEvent({
          severity: 'ALERT',
          sensorSource: 'AGT3D_RADAR',
          title: 'AGT3DRD5000X Ku-Band — Hostile Track Confirmed (TRK-H-809)',
          details: 'FlySpark AGT3DRD5000X 3D radar correlated Ku-band RCS −12.4 dBsm (class: multi-rotor ~0.18m²). XBOOM A30TR1575 AI tracking engaged. Fusion confidence: 96%.',
          targetId: 'TRK-H-809',
        });
        break;
      }
      case 3: {
        // XBOOM A30TR1575 slew-to-cue + Guardian-S08 advisory
        setCountermeasures((prev: any) => ({
          ...prev,
          opticalGimbalLocked: true,
          xboomAiTrackActive: true,
          xboomLrfRangingActive: true,
          opticalGimbalAzimuthDeg: 42,
          opticalGimbalElevationDeg: 14.5,
          jammingAzimuthDeg: 42,
        }));
        setTracks((prev) =>
          prev.map((t) =>
            t.id === 'TRK-H-809'
              ? {
                  ...t,
                  rangeMeters: 2200,
                  isTargetLocked: true,
                  xboomLrfRangeM: 2198,
                  history: [
                    ...t.history,
                    { x: 2200 * Math.sin(42 * Math.PI / 180), y: 2200 * Math.cos(42 * Math.PI / 180), timestamp: Date.now() },
                  ],
                }
              : t
          )
        );
        soundEngine?.playHostileAlert();
        addLogEvent({
          severity: 'ALERT',
          sensorSource: 'XBOOM_OPTICS',
          title: 'XBOOM A30TR1575 — Slew-to-Cue + LRF: 2,198m',
          details: 'XBOOM 30× EO + 5× IR thermal locked on TRK-H-809. LRF measured: 2,198m. AI tracking confidence: 94%. Guardian-S08 directional jaw advisory issued (042° azimuth, 180W).',
          targetId: 'TRK-H-809',
        });
        break;
      }
      case 4: {
        // Guardian-S08 full-power jam — neutralize
        setCountermeasures((prev: any) => ({
          ...prev,
          gnssJammingActive: true,
          c2LinkJammingActive: true,
          videoDownlinkJammingActive: true,
          jammingPowerEirpWatts: 180,
        }));
        setTracks((prev) =>
          prev.map((t) =>
            t.id === 'TRK-H-809'
              ? {
                  ...t,
                  threatLevel: 'NEUTRALIZED',
                  groundSpeedKmh: 0.0,
                  climbRateMs: -3.8,
                  isMitigated: true,
                  rfSignalDbm: -115,
                  fusionConfidence: 100,
                }
              : t
          )
        );
        setNetwork((prev: any) => ({ ...prev, defconLevel: 4, readinessState: 'OPTIMAL' }));
        soundEngine?.playJammerPulse();
        setTimeout(() => soundEngine?.playNeutralizedChime(), 600);
        addLogEvent({
          severity: 'SUCCESS',
          sensorSource: 'GUARDIAN_S08',
          title: 'Guardian-S08 — 180W EIRP Active, C2 Link Severed',
          details: 'FlySpark Guardian-S08 directional jam: 2.4 GHz + GNSS L1/L2 + 5.8 GHz. Target C2 packet loss 100%. GNSS spoof active. Hostile drone forced to emergency descent. Threat neutralized.',
          targetId: 'TRK-H-809',
        });
        break;
      }
    }
  }, [addLogEvent, setCountermeasures, setNetwork, setSelectedTrackId, setTracks]);

  useEffect(() => {
    if (!demoState.isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    const intervalMs = 1000 / demoState.playbackSpeed;
    timerRef.current = setInterval(() => {
      setDemoState((prev) => {
        const nextSec = prev.elapsedSeconds + 1;
        let nextPhase: DemoPhase = prev.currentPhase;
        if (nextSec >= 14) nextPhase = 4;
        else if (nextSec >= 10) nextPhase = 3;
        else if (nextSec >= 6) nextPhase = 2;
        else if (nextSec >= 3) nextPhase = 1;
        else nextPhase = 0;
        if (nextPhase !== prev.currentPhase) applyPhaseEffects(nextPhase);
        if (nextSec >= 18) {
          return {
            ...prev,
            isRunning: false,
            elapsedSeconds: 18,
            currentPhase: 4,
            phaseDescription: 'Incursion Neutralized — Guardian-S08 Soft-Kill Successful',
          };
        }
        return { ...prev, elapsedSeconds: nextSec, currentPhase: nextPhase, phaseDescription: phaseDescriptions[nextPhase] };
      });
    }, intervalMs);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [demoState.isRunning, demoState.playbackSpeed, applyPhaseEffects]);

  const startDemo = () => {
    setDemoState((prev) => ({ ...prev, isRunning: true, elapsedSeconds: 0, currentPhase: 0, phaseDescription: phaseDescriptions[0] }));
    applyPhaseEffects(0);
    soundEngine?.playRadarBlip();
  };

  const pauseDemo = () => setDemoState((prev) => ({ ...prev, isRunning: false }));
  const resumeDemo = () => setDemoState((prev) => ({ ...prev, isRunning: true }));
  const resetDemo = () => {
    setDemoState({ isRunning: false, currentPhase: 0, elapsedSeconds: 0, playbackSpeed: 1, phaseDescription: phaseDescriptions[0] });
    applyPhaseEffects(0);
  };
  const jumpToPhase = (phase: DemoPhase) => {
    const timeMap: Record<DemoPhase, number> = { 0: 0, 1: 3, 2: 6, 3: 10, 4: 14 };
    setDemoState((prev) => ({ ...prev, currentPhase: phase, elapsedSeconds: timeMap[phase], phaseDescription: phaseDescriptions[phase] }));
    applyPhaseEffects(phase);
  };
  const setPlaybackSpeed = (speed: 1 | 2 | 5) => setDemoState((prev) => ({ ...prev, playbackSpeed: speed }));

  const injectCustomDrone = (type: 'HOSTILE' | 'UNIDENTIFIED' | 'FRIENDLY') => {
    const randomAzimuth = Math.floor(Math.random() * 360);
    const randomRange = Math.floor(1500 + Math.random() * 3000);
    const customId = `TRK-${type[0]}-${Math.floor(100 + Math.random() * 900)}`;

    const newTarget: TargetTrack = {
      id: customId,
      callsign: `TEST-${type}-${customId.slice(-3)}`,
      classification: type === 'HOSTILE' ? 'HOSTILE_DRONE' : type === 'UNIDENTIFIED' ? 'UNIDENTIFIED_RF' : 'FRIENDLY_UAV',
      threatLevel: type === 'HOSTILE' ? 'HOSTILE' : type === 'UNIDENTIFIED' ? 'ELEVATED' : 'NOMINAL',
      rangeMeters: randomRange,
      azimuthDeg: randomAzimuth,
      elevationDeg: 12.0,
      altitudeMslMeters: 5100,
      altitudeAglMeters: 250,
      groundSpeedKmh: 58.0,
      climbRateMs: 0.1,
      rfFrequencyGhz: 2.412,
      rfProtocol: type === 'HOSTILE' ? 'CRSF / ExpressLRS' : 'DJI OcuSync 3.0',
      rfSignalDbm: -72,
      aoaBearingDeg: randomAzimuth + (Math.random() - 0.5) * 4,
      tdoaTimeDiffNs: 10 + Math.random() * 20,
      dfConfidencePct: 72 + Math.random() * 20,
      kuBandReflectivity: -14 + Math.random() * 4,
      radarCrossSection: 0.08 + Math.random() * 0.15,
      opticalConfidence: 80 + Math.random() * 15,
      xboomLrfRangeM: randomRange - 2,
      fusionConfidence: 85 + Math.random() * 10,
      losBlocked: false,
      isTargetLocked: false,
      isMitigated: false,
      firstDetectedAt: 'MANUAL INJECT',
      history: [
        { x: randomRange * Math.sin(randomAzimuth * Math.PI / 180), y: randomRange * Math.cos(randomAzimuth * Math.PI / 180), timestamp: Date.now() }
      ],
    };

    setTracks((prev) => [...prev, newTarget]);
    setSelectedTrackId(customId);
    if (type === 'HOSTILE') {
      soundEngine?.playHostileAlert();
      addLogEvent({
        severity: 'ALERT',
        sensorSource: 'AGT3D_RADAR',
        title: `AGT3DRD5000X — Manual Hostile Inject (${customId})`,
        details: `Simulated hostile at ${randomRange}m bearing ${randomAzimuth}°. USRP B210 AoA fix correlated.`,
        targetId: customId,
      });
    }
  };

  return { demoState, startDemo, pauseDemo, resumeDemo, resetDemo, jumpToPhase, setPlaybackSpeed, injectCustomDrone };
}
