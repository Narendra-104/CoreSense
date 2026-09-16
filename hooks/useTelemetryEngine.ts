import { useState, useEffect, useRef } from 'react';
import {
  AtmosphericTelemetry,
  PidThermalTelemetry,
  LifePo4Telemetry,
  NetworkHealth,
  CountermeasureState,
  TargetTrack,
  IncursionLogEvent,
  UsrpUnit,
} from '@/types/dashboard';

export function useTelemetryEngine() {
  // Atmospheric Telemetry — Ladakh Sector, 4,850m MSL
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

  // PID Thermal Telemetry — real hardware zone names
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
        name: 'Jetson Orin NX — GPU Inference',
        currentTempC: 38.6,
        targetTempC: 40.0,
        minTempC: -10.0,
        maxTempC: 85.0,
        status: 'NOMINAL',
        heaterDutyPct: 0,
      },
      usrpB210Sdr: {
        name: 'NI Ettus USRP B210 — RF Front-End',
        currentTempC: 24.1,
        targetTempC: 25.0,
        minTempC: -20.0,
        maxTempC: 70.0,
        status: 'NOMINAL',
        heaterDutyPct: 35,
      },
      xboomGimbalBearings: {
        name: 'XBOOM A30TR1575 — Gimbal Bearings',
        currentTempC: 8.4,
        targetTempC: 12.0,
        minTempC: -40.0,
        maxTempC: 50.0,
        status: 'HEATING',
        heaterDutyPct: 78,
      },
      xboomGermaniumDome: {
        name: 'XBOOM A30TR1575 — Ge IR Dome',
        currentTempC: 12.0,
        targetTempC: 12.0,
        minTempC: -30.0,
        maxTempC: 45.0,
        status: 'NOMINAL',
        heaterDutyPct: 65,
      },
      agt3dRadarRadome: {
        name: 'AGT3DRD5000X — Ku-Band Radome De-Icer',
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

  // USRP B210 SDR Array — 3 units
  const [usrpUnits, setUsrpUnits] = useState<UsrpUnit[]>([
    {
      unitId: 1, online: true, centerFreqGhz: 2.437, gainDb: 52, signalLevelDbm: -78,
      aoaBearingDeg: 42.4, tdoaTimeDiffNs: 14.2, channelA_Dbm: -78, channelB_Dbm: -81, lockState: 'SCANNING',
    },
    {
      unitId: 2, online: true, centerFreqGhz: 5.785, gainDb: 48, signalLevelDbm: -82,
      aoaBearingDeg: 42.1, tdoaTimeDiffNs: 14.5, channelA_Dbm: -82, channelB_Dbm: -80, lockState: 'SCANNING',
    },
    {
      unitId: 3, online: true, centerFreqGhz: 1.5754, gainDb: 60, signalLevelDbm: -91,
      aoaBearingDeg: 41.8, tdoaTimeDiffNs: 13.9, channelA_Dbm: -91, channelB_Dbm: -93, lockState: 'SCANNING',
    },
  ]);

  // Countermeasures — Guardian-S08 + XBOOM + RWS
  const [countermeasures, setCountermeasures] = useState<CountermeasureState>({
    gnssJammingActive: false,
    c2LinkJammingActive: false,
    videoDownlinkJammingActive: false,
    jammingPowerEirpWatts: 60,
    jammingAzimuthDeg: 42,
    guardianS08Online: true,
    opticalGimbalLocked: false,
    opticalGimbalAzimuthDeg: 42,
    opticalGimbalElevationDeg: 14,
    xboomAiTrackActive: false,
    xboomLrfRangingActive: false,
    rws: {
      fireMode: 'SAFE',
      azimuthDeg: 42,
      elevationDeg: 14,
      fcrLockActive: false,
      fcrLockTargetId: null,
      ammoType: '35MM_AHEAD',
      ammoRoundsRemaining: 24,
      airbustProximityFuseM: 3,
      barrelTempC: -18.4,
      hydraulicPressureBar: 185,
      roeAuthorized: false,
      lastFireTimestamp: null,
      effectiveRangeM: { min: 3000, max: 4000 },
    },
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
      aoaBearingDeg: 215,
      tdoaTimeDiffNs: 38.2,
      dfConfidencePct: 94,
      kuBandReflectivity: -18.5,
      radarCrossSection: 0.12,
      opticalConfidence: 98,
      xboomLrfRangeM: 3448,
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

  // Live Incursion Log
  const [logEvents, setLogEvents] = useState<IncursionLogEvent[]>([
    {
      id: 'EVT-001',
      timestamp: '09:00:02 UTC',
      timeOffsetSec: 0,
      severity: 'INFO',
      sensorSource: 'AGT3D_RADAR',
      title: 'FlySpark AGT3DRD5000X — Boot Complete',
      details: 'Ku-band 3D radar online. 360° scan active. Range: 5,000m. CoreSense C-UAS station initialized at 4,850m MSL.',
    },
    {
      id: 'EVT-002',
      timestamp: '09:00:18 UTC',
      timeOffsetSec: 16,
      severity: 'INFO',
      sensorSource: 'USRP_B210',
      title: 'USRP B210 Array ×3 — Online',
      details: 'NI Ettus USRP B210 units 1–3 initialized. 70 MHz–6 GHz sweep active. AoA/TDOA baseline calibrated.',
    },
    {
      id: 'EVT-003',
      timestamp: '09:01:45 UTC',
      timeOffsetSec: 103,
      severity: 'INFO',
      sensorSource: 'AGT3D_RADAR',
      title: 'STANAG Friendly UAV Correlated',
      details: 'Target TRK-F-102 (IAF-PATROL-BRAVO) verified via encrypted transponder. XBOOM LRF: 3,448m.',
      targetId: 'TRK-F-102',
    },
  ]);

  const tickRef = useRef<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      tickRef.current += 1;
      const t = tickRef.current;

      const tempDrift = Math.sin(t * 0.1) * 0.15;
      const currentAmbient = -24.8 + tempDrift;
      const pressure = 54.2 + Math.cos(t * 0.08) * 0.05;
      const tKelvin = currentAmbient + 273.15;
      const calculatedRho = (pressure * 1000) / (287.058 * tKelvin);

      setAtmospheric((prev) => ({
        ...prev,
        ambientTempC: parseFloat(currentAmbient.toFixed(1)),
        barometricPressureKpa: parseFloat(pressure.toFixed(2)),
        airDensityKgM3: parseFloat(calculatedRho.toFixed(3)),
        windSpeedKmh: parseFloat((42.0 + Math.sin(t * 0.2) * 3.5).toFixed(1)),
      }));

      setThermal((prev) => {
        const enc = 14.2 + Math.sin(t * 0.05) * 0.25;
        const err = prev.setpointTempC - enc;
        const duty = Math.min(100, Math.max(20, 62.0 + err * 4.2));
        return {
          ...prev,
          enclosureTempC: parseFloat(enc.toFixed(1)),
          errorTempC: parseFloat(err.toFixed(1)),
          pwmDutyCyclePct: parseFloat(duty.toFixed(1)),
        };
      });

      setBattery((prev) => ({
        ...prev,
        packVoltage: parseFloat((51.2 - (t * 0.0005)).toFixed(2)),
        solarMpptWatts: Math.max(280, Math.floor(340 + Math.sin(t * 0.1) * 20)),
      }));

      // Animate USRP units — simulate live scanning
      setUsrpUnits((prev) => prev.map((u) => ({
        ...u,
        signalLevelDbm: parseFloat((u.signalLevelDbm + (Math.random() - 0.5) * 2).toFixed(1)),
        aoaBearingDeg: parseFloat((u.aoaBearingDeg + (Math.random() - 0.5) * 0.3).toFixed(1)),
        channelA_Dbm: parseFloat((u.channelA_Dbm + (Math.random() - 0.5) * 1.5).toFixed(1)),
        channelB_Dbm: parseFloat((u.channelB_Dbm + (Math.random() - 0.5) * 1.5).toFixed(1)),
      })));

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
              xboomLrfRangeM: Math.round(nextRange - 2),
              history: [...trk.history.slice(-15), { x, y, timestamp: Date.now() }],
            };
          }
          return trk;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const toggleGnssJamming = () =>
    setCountermeasures((prev) => ({ ...prev, gnssJammingActive: !prev.gnssJammingActive }));

  const toggleC2Jamming = () =>
    setCountermeasures((prev) => ({ ...prev, c2LinkJammingActive: !prev.c2LinkJammingActive }));

  const toggleVideoJamming = () =>
    setCountermeasures((prev) => ({ ...prev, videoDownlinkJammingActive: !prev.videoDownlinkJammingActive }));

  const setJammingPower = (watts: number) =>
    setCountermeasures((prev) => ({ ...prev, jammingPowerEirpWatts: watts }));

  const toggleGimbalLock = () =>
    setCountermeasures((prev) => ({
      ...prev,
      opticalGimbalLocked: !prev.opticalGimbalLocked,
      xboomAiTrackActive: !prev.opticalGimbalLocked,
    }));

  const toggleXboomLrf = () =>
    setCountermeasures((prev) => ({ ...prev, xboomLrfRangingActive: !prev.xboomLrfRangingActive }));

  const armNetLauncher = (armed: boolean) =>
    setCountermeasures((prev) => ({
      ...prev,
      rws: { ...prev.rws, fireMode: armed ? 'ARMED' : 'SAFE' },
    }));

  const setRwsFireMode = (mode: 'SAFE' | 'ARMED' | 'WEAPONS_FREE') =>
    setCountermeasures((prev) => ({ ...prev, rws: { ...prev.rws, fireMode: mode } }));

  const authorizeRoe = (authorized: boolean) =>
    setCountermeasures((prev) => ({ ...prev, rws: { ...prev.rws, roeAuthorized: authorized } }));

  const fireRwsBurst = () => {
    const now = new Date();
    const timeStr = `${now.getUTCHours().toString().padStart(2, '0')}:${now.getUTCMinutes().toString().padStart(2, '0')}:${now.getUTCSeconds().toString().padStart(2, '0')} UTC`;
    setCountermeasures((prev) => ({
      ...prev,
      rws: {
        ...prev.rws,
        ammoRoundsRemaining: Math.max(0, prev.rws.ammoRoundsRemaining - 3),
        lastFireTimestamp: timeStr,
        fireMode: 'ARMED',
      },
    }));
  };

  const triggerDefrostCycle = () => {
    setCountermeasures((prev) => ({ ...prev, autoDefrostCycleRemainingSec: 30 }));
    setThermal((prev) => ({ ...prev, autoDefrostRunning: true }));
    addLogEvent({
      severity: 'WARNING',
      sensorSource: 'AGT3D_RADAR',
      title: 'Rapid Auto-Defrost Pulse Activated',
      details: 'PID heaters boosted to 100% for 30s — AGT3DRD5000X radome de-icing and XBOOM Ge dome defogging.',
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
    usrpUnits,
    setUsrpUnits,
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
    toggleXboomLrf,
    armNetLauncher,
    setRwsFireMode,
    authorizeRoe,
    fireRwsBurst,
    triggerDefrostCycle,
  };
}
