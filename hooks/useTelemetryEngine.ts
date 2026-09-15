import { useState, useEffect, useRef } from 'react';
import {
  AtmosphericTelemetry,
  PidThermalTelemetry,
  LifePo4Telemetry,
  NetworkHealth,
  CountermeasureState,
  TargetTrack,
  IncursionLogEvent,
} from '@/types/dashboard';

export function useTelemetryEngine() {
  // Atmospheric Telemetry
  const [atmospheric, setAtmospheric] = useState<AtmosphericTelemetry>({
    ambientTempC: -24.8,
    barometricPressureKpa: 54.2,
    altitudeMsl: 4850,
    airDensityKgM3: 0.761,
    densityAltitudeRatio: 0.621,
    rotorLiftDeficitPct: 27.4,
    throttleCurrentMultiplier: 1.45,
    aerodynamicStallRisk: 'MODERATE',
    windSpeedKmh: 42.5,
    windDirectionDeg: 315,
    relativeHumidityPct: 28,
  });

  // PID Thermal Telemetry
  const [thermal, setThermal] = useState<PidThermalTelemetry>({
    enclosureTempC: 14.2,
    setpointTempC: 15.0,
    errorTempC: 0.8,
    kp: 4.2,
    ki: 0.15,
    kd: 1.8,
    pwmDutyCyclePct: 62.4,
    zones: {
      jetsonSbcCore: {
        name: 'Jetson Orin AGX Core',
        currentTempC: 38.6,
        targetTempC: 40.0,
        minTempC: -10.0,
        maxTempC: 85.0,
        status: 'NOMINAL',
        heaterDutyPct: 0,
      },
      rfFrontEndSdr: {
        name: 'AD9361 SDR RF Front-End',
        currentTempC: 24.1,
        targetTempC: 25.0,
        minTempC: -20.0,
        maxTempC: 70.0,
        status: 'NOMINAL',
        heaterDutyPct: 35,
      },
      ptzGimbalBearings: {
        name: 'PTZ Gimbal Harmonic Bearings',
        currentTempC: 8.4,
        targetTempC: 12.0,
        minTempC: -40.0,
        maxTempC: 50.0,
        status: 'HEATING',
        heaterDutyPct: 78,
      },
      opticalGermaniumDome: {
        name: 'Germanium LWIR Dome Window',
        currentTempC: 12.0,
        targetTempC: 12.0,
        minTempC: -30.0,
        maxTempC: 45.0,
        status: 'NOMINAL',
        heaterDutyPct: 65,
      },
      rfRadomeDeIcer: {
        name: 'PTFE Radar Radome Anti-Ice',
        currentTempC: 9.5,
        targetTempC: 10.0,
        minTempC: -30.0,
        maxTempC: 45.0,
        status: 'HEATING',
        heaterDutyPct: 60,
      },
    },
    antiIcingStripActive: true,
    autoDefrostRunning: false,
  });

  // LiFePO4 Battery Telemetry
  const [battery, setBattery] = useState<LifePo4Telemetry>({
    packVoltage: 51.2,
    packCurrentA: -6.42,
    stateOfChargePct: 84.6,
    stateOfHealthPct: 98.2,
    internalCoreTempC: 18.5,
    ambientSoakTempC: -24.8,
    preheatedCapacityAh: 94.2,
    coldSoakRawCapacityAh: 42.0,
    internalHeatingPadsActive: true,
    solarMpptWatts: 340,
    backupFuelCellOnline: true,
    cells: [
      { cellId: 1, voltage: 3.205, temperatureC: 18.6, impedanceMohm: 0.42 },
      { cellId: 2, voltage: 3.198, temperatureC: 18.4, impedanceMohm: 0.44 },
      { cellId: 3, voltage: 3.202, temperatureC: 18.7, impedanceMohm: 0.41 },
      { cellId: 4, voltage: 3.201, temperatureC: 18.5, impedanceMohm: 0.43 },
      { cellId: 5, voltage: 3.199, temperatureC: 18.3, impedanceMohm: 0.45 },
      { cellId: 6, voltage: 3.204, temperatureC: 18.8, impedanceMohm: 0.42 },
      { cellId: 7, voltage: 3.203, temperatureC: 18.5, impedanceMohm: 0.41 },
      { cellId: 8, voltage: 3.200, temperatureC: 18.4, impedanceMohm: 0.43 },
    ],
  });

  // Network & System Health
  const [network, setNetwork] = useState<NetworkHealth>({
    satcomLatencyMs: 38,
    satcomSnrDb: 18.4,
    satcomStatus: 'ACTIVE',
    loraMeshNodes: [
      { id: 'LORA-01', name: 'Khardung Ridge Pass Relay', rssi: -72, batteryPct: 92, online: true },
      { id: 'LORA-02', name: 'North Radar Blind-Zone Node', rssi: -84, batteryPct: 88, online: true },
      { id: 'LORA-03', name: 'Sector Perimeter Sentry-A', rssi: -76, batteryPct: 95, online: true },
      { id: 'LORA-04', name: 'Base Station Depot Uplink', rssi: -65, batteryPct: 100, online: true },
    ],
    sqliteBufferQueueLength: 0,
    sqliteWriteIops: 14,
    defconLevel: 4,
    readinessState: 'OPTIMAL',
  });

  // Active Countermeasure Controls
  const [countermeasures, setCountermeasures] = useState<CountermeasureState>({
    gnssJammingActive: false,
    c2LinkJammingActive: false,
    videoDownlinkJammingActive: false,
    jammingPowerEirpWatts: 60,
    jammingAzimuthDeg: 42,
    opticalGimbalLocked: false,
    opticalGimbalAzimuthDeg: 42,
    opticalGimbalElevationDeg: 14,
    netLauncherArmed: false,
    netLauncherSafetyPinPulled: false,
    autoDefrostCycleRemainingSec: 0,
  });

  // Target Tracks
  const [tracks, setTracks] = useState<TargetTrack[]>([
    {
      id: 'TRK-F-102',
      callsign: 'IAF-PATROL-BRAVO',
      classification: 'FRIENDLY_UAV',
      threatLevel: 'NOMINAL',
      rangeMeters: 3450,
      azimuthDeg: 215,
      elevationDeg: 8.2,
      altitudeMslMeters: 5320,
      altitudeAglMeters: 470,
      groundSpeedKmh: 54.0,
      climbRateMs: 0.2,
      rfFrequencyGhz: 1.425,
      rfProtocol: 'STANAG 4586 (Friendly)',
      rfSignalDbm: -68,
      acousticHarmonicHz: 180,
      acousticConfidence: 94,
      opticalConfidence: 98,
      fusionConfidence: 99,
      losBlocked: false,
      isTargetLocked: false,
      isMitigated: false,
      firstDetectedAt: '08:45:12 UTC',
      history: [
        { x: 3450 * Math.sin(215 * Math.PI / 180), y: 3450 * Math.cos(215 * Math.PI / 180), timestamp: Date.now() - 4000 },
        { x: 3420 * Math.sin(216 * Math.PI / 180), y: 3420 * Math.cos(216 * Math.PI / 180), timestamp: Date.now() - 2000 },
        { x: 3400 * Math.sin(217 * Math.PI / 180), y: 3400 * Math.cos(217 * Math.PI / 180), timestamp: Date.now() },
      ],
    },
  ]);

  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);

  // Live Incursion Log Events
  const [logEvents, setLogEvents] = useState<IncursionLogEvent[]>([
    {
      id: 'EVT-001',
      timestamp: '09:00:02 UTC',
      timeOffsetSec: 0,
      severity: 'INFO',
      sensorSource: 'RADAR_FUSION',
      title: 'Station Boot Sequence Complete',
      details: 'CoreSense High-Altitude Sentry initialized at 4,850m MSL. PID thermal loop active.',
    },
    {
      id: 'EVT-002',
      timestamp: '09:01:45 UTC',
      timeOffsetSec: 103,
      severity: 'INFO',
      sensorSource: 'SDR_SCANNER',
      title: 'STANAG Friendly UAV Correlated',
      details: 'Target TRK-F-102 verified via encrypted transponder handshake.',
      targetId: 'TRK-F-102',
    },
  ]);

  const tickRef = useRef<number>(0);

  // Live simulation tick (every 1s)
  useEffect(() => {
    const interval = setInterval(() => {
      tickRef.current += 1;
      const t = tickRef.current;

      // Small natural environmental fluctuation
      const tempDrift = Math.sin(t * 0.1) * 0.15;
      const currentAmbient = -24.8 + tempDrift;
      const pressure = 54.2 + Math.cos(t * 0.08) * 0.05;

      // Ideal gas formula for air density: rho = P * 1000 / (R_specific * T_Kelvin)
      // R_specific for dry air = 287.058 J/(kg·K)
      const tKelvin = currentAmbient + 273.15;
      const calculatedRho = (pressure * 1000) / (287.058 * tKelvin);

      setAtmospheric((prev) => ({
        ...prev,
        ambientTempC: parseFloat(currentAmbient.toFixed(1)),
        barometricPressureKpa: parseFloat(pressure.toFixed(2)),
        airDensityKgM3: parseFloat(calculatedRho.toFixed(3)),
        windSpeedKmh: parseFloat((42.0 + Math.sin(t * 0.2) * 3.5).toFixed(1)),
      }));

      // PID thermal controller small feedback adjustments
      setThermal((prev) => {
        const enc = 14.2 + Math.sin(t * 0.05) * 0.25;
        const err = prev.setpointTempC - enc;
        const duty = Math.min(100, Math.max(20, 62.0 + err * 4.2));

        let defrostTime = prev.autoDefrostRunning ? Math.max(0, (countermeasures.autoDefrostCycleRemainingSec || 0) - 1) : 0;
        return {
          ...prev,
          enclosureTempC: parseFloat(enc.toFixed(1)),
          errorTempC: parseFloat(err.toFixed(1)),
          pwmDutyCyclePct: parseFloat(duty.toFixed(1)),
          autoDefrostRunning: defrostTime > 0,
        };
      });

      // Battery subtle drain
      setBattery((prev) => ({
        ...prev,
        packVoltage: parseFloat((51.2 - (t * 0.0005)).toFixed(2)),
        solarMpptWatts: Math.max(280, Math.floor(340 + Math.sin(t * 0.1) * 20)),
      }));

      // Update friendly track position smoothly
      setTracks((prevTracks) =>
        prevTracks.map((trk) => {
          if (trk.id === 'TRK-F-102') {
            const nextAzimuth = (trk.azimuthDeg + 0.15) % 360;
            const nextRange = trk.rangeMeters + Math.sin(t * 0.1) * 3;
            const x = nextRange * Math.sin(nextAzimuth * Math.PI / 180);
            const y = nextRange * Math.cos(nextAzimuth * Math.PI / 180);
            return {
              ...trk,
              azimuthDeg: parseFloat(nextAzimuth.toFixed(1)),
              rangeMeters: Math.round(nextRange),
              history: [...trk.history.slice(-15), { x, y, timestamp: Date.now() }],
            };
          }
          return trk;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [countermeasures.autoDefrostCycleRemainingSec]);

  // Helper functions to control countermeasures
  const toggleGnssJamming = () => {
    setCountermeasures((prev) => ({ ...prev, gnssJammingActive: !prev.gnssJammingActive }));
  };

  const toggleC2Jamming = () => {
    setCountermeasures((prev) => ({ ...prev, c2LinkJammingActive: !prev.c2LinkJammingActive }));
  };

  const toggleVideoJamming = () => {
    setCountermeasures((prev) => ({ ...prev, videoDownlinkJammingActive: !prev.videoDownlinkJammingActive }));
  };

  const setJammingPower = (watts: number) => {
    setCountermeasures((prev) => ({ ...prev, jammingPowerEirpWatts: watts }));
  };

  const toggleGimbalLock = () => {
    setCountermeasures((prev) => ({ ...prev, opticalGimbalLocked: !prev.opticalGimbalLocked }));
  };

  const armNetLauncher = (armed: boolean) => {
    setCountermeasures((prev) => ({ ...prev, netLauncherArmed: armed }));
  };

  const triggerDefrostCycle = () => {
    setCountermeasures((prev) => ({ ...prev, autoDefrostCycleRemainingSec: 30 }));
    setThermal((prev) => ({ ...prev, autoDefrostRunning: true }));
    addLogEvent({
      severity: 'WARNING',
      sensorSource: 'COUNTERMEASURE',
      title: 'Rapid Auto-Defrost Pulse Activated',
      details: 'Heating elements boosted to 100% duty cycle for 30 seconds to vaporize rime ice accumulation.',
    });
  };

  const addLogEvent = (event: Omit<IncursionLogEvent, 'id' | 'timestamp' | 'timeOffsetSec'>) => {
    const now = new Date();
    const timeStr = `${now.getUTCHours().toString().padStart(2, '0')}:${now.getUTCMinutes().toString().padStart(2, '0')}:${now.getUTCSeconds().toString().padStart(2, '0')} UTC`;
    const newEvt: IncursionLogEvent = {
      id: `EVT-${Date.now().toString().slice(-4)}`,
      timestamp: timeStr,
      timeOffsetSec: tickRef.current,
      ...event,
    };
    setLogEvents((prev) => [newEvt, ...prev.slice(0, 49)]);
  };

  return {
    atmospheric,
    thermal,
    battery,
    network,
    setNetwork,
    countermeasures,
    setCountermeasures,
    tracks,
    setTracks,
    selectedTrackId,
    setSelectedTrackId,
    logEvents,
    setLogEvents,
    addLogEvent,
    toggleGnssJamming,
    toggleC2Jamming,
    toggleVideoJamming,
    setJammingPower,
    toggleGimbalLock,
    armNetLauncher,
    triggerDefrostCycle,
  };
}
