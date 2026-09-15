import { useState, useEffect, useRef, useCallback } from 'react';
import { DemoPhase, DemoScenarioState, TargetTrack, IncursionLogEvent, ThreatLevel } from '@/types/dashboard';
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
    phaseDescription: 'Phase 0: Baseline High-Altitude Sentry Recon (Clear Skies)',
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const phaseDescriptions: Record<DemoPhase, string> = {
    0: 'T+0s: Baseline Sentry Recon — 4,850m MSL, -24.8°C, PID Active',
    1: 'T+3s: RF Anomaly Detected — 2.437 GHz FHSS Burst at 4.2 km (DEFCON 3)',
    2: 'T+6s: Multi-Sensor Fusion Lock — Acoustic (210Hz) + LWIR Optical Track (DEFCON 2)',
    3: 'T+10s: PTZ Gimbal Auto-Slew & RF Disruption Advisory Recommended',
    4: 'T+14s: Countermeasure Jamming Active — Target Speed 0 km/h (Threat Neutralized)',
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
    acousticHarmonicHz: 210,
    acousticConfidence: 89,
    opticalConfidence: 94,
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
        // Reset to nominal baseline
        setTracks((prev) => prev.filter((t) => t.id !== 'TRK-H-809' && t.id !== 'TRK-U-404'));
        setSelectedTrackId(null);
        setNetwork((prev: any) => ({ ...prev, defconLevel: 4, readinessState: 'OPTIMAL' }));
        setCountermeasures((prev: any) => ({
          ...prev,
          gnssJammingActive: false,
          c2LinkJammingActive: false,
          videoDownlinkJammingActive: false,
          opticalGimbalLocked: false,
        }));
        break;
      }
      case 1: {
        // RF Anomaly Detected
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
          acousticHarmonicHz: 205,
          acousticConfidence: 54,
          opticalConfidence: 40,
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
          sensorSource: 'SDR_SCANNER',
          title: 'RF Spectrum Anomaly at 4.2 km',
          details: 'AD9361 SDR detected 2.437 GHz FHSS bursts matching DJI OcuSync C2 protocol.',
          targetId: 'TRK-U-404',
        });
        break;
      }
      case 2: {
        // Multi-sensor fusion lock
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
          sensorSource: 'RADAR_FUSION',
          title: 'Hostile Incursion Confirmed (TRK-H-809)',
          details: 'Acoustic 4-blade signature (210 Hz) + LWIR thermal signature confirmed DJI Matrice 300 RTK payload drone inbound.',
          targetId: 'TRK-H-809',
        });
        break;
      }
      case 3: {
        // Auto-slew PTZ Gimbal & Advisory
        setCountermeasures((prev: any) => ({
          ...prev,
          opticalGimbalLocked: true,
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
          sensorSource: 'LWIR_OPTICS',
          title: 'PTZ Gimbal Auto-Slewed & Locked',
          details: 'Optical YOLO-v8 locked on target at 2.2 km. System recommends immediate Directional RF Jamming (2.4 GHz + GNSS L1).',
          targetId: 'TRK-H-809',
        });
        break;
      }
      case 4: {
        // Deploy Mitigation & Neutralize
        setCountermeasures((prev: any) => ({
          ...prev,
          gnssJammingActive: true,
          c2LinkJammingActive: true,
          videoDownlinkJammingActive: true,
          jammingPowerEirpWatts: 85,
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
        setTimeout(() => {
          soundEngine?.playNeutralizedChime();
        }, 600);
        addLogEvent({
          severity: 'SUCCESS',
          sensorSource: 'COUNTERMEASURE',
          title: 'Smart RF Disruption Active — C2 Link Severed',
          details: 'Directional 85W EIRP jamming applied. Target C2 packet loss 100%, GNSS spoof lock active. Hostile drone forced to emergency descent.',
          targetId: 'TRK-H-809',
        });
        break;
      }
    }
  }, [addLogEvent, setCountermeasures, setNetwork, setSelectedTrackId, setTracks]);

  // Handle play / timer
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

        if (nextPhase !== prev.currentPhase) {
          applyPhaseEffects(nextPhase);
        }

        // Auto-pause when scenario finishes at T+18s
        if (nextSec >= 18) {
          return {
            ...prev,
            isRunning: false,
            elapsedSeconds: 18,
            currentPhase: 4,
            phaseDescription: 'Incursion Neutralized — Mission Accomplished',
          };
        }

        return {
          ...prev,
          elapsedSeconds: nextSec,
          currentPhase: nextPhase,
          phaseDescription: phaseDescriptions[nextPhase],
        };
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [demoState.isRunning, demoState.playbackSpeed, applyPhaseEffects]);

  const startDemo = () => {
    setDemoState((prev) => ({
      ...prev,
      isRunning: true,
      elapsedSeconds: 0,
      currentPhase: 0,
      phaseDescription: phaseDescriptions[0],
    }));
    applyPhaseEffects(0);
    soundEngine?.playRadarBlip();
  };

  const pauseDemo = () => {
    setDemoState((prev) => ({ ...prev, isRunning: false }));
  };

  const resumeDemo = () => {
    setDemoState((prev) => ({ ...prev, isRunning: true }));
  };

  const resetDemo = () => {
    setDemoState({
      isRunning: false,
      currentPhase: 0,
      elapsedSeconds: 0,
      playbackSpeed: 1,
      phaseDescription: phaseDescriptions[0],
    });
    applyPhaseEffects(0);
  };

  const jumpToPhase = (phase: DemoPhase) => {
    const timeMap: Record<DemoPhase, number> = { 0: 0, 1: 3, 2: 6, 3: 10, 4: 14 };
    setDemoState((prev) => ({
      ...prev,
      currentPhase: phase,
      elapsedSeconds: timeMap[phase],
      phaseDescription: phaseDescriptions[phase],
    }));
    applyPhaseEffects(phase);
  };

  const setPlaybackSpeed = (speed: 1 | 2 | 5) => {
    setDemoState((prev) => ({ ...prev, playbackSpeed: speed }));
  };

  // Manual target injection for interactive testing
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
      acousticHarmonicHz: 215,
      acousticConfidence: 85,
      opticalConfidence: 90,
      fusionConfidence: 92,
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
        sensorSource: 'RADAR_FUSION',
        title: `Manual Hostile Target Injected (${customId})`,
        details: `Simulated hostile drone at ${randomRange}m bearing ${randomAzimuth}°`,
        targetId: customId,
      });
    }
  };

  return {
    demoState,
    startDemo,
    pauseDemo,
    resumeDemo,
    resetDemo,
    jumpToPhase,
    setPlaybackSpeed,
    injectCustomDrone,
  };
}
