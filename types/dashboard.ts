export type ThreatLevel = 'NOMINAL' | 'ELEVATED' | 'HOSTILE' | 'CRITICAL' | 'NEUTRALIZED';

export type TargetClassification =
  | 'HOSTILE_DRONE'      // DJI Matrice / Custom FPV / MALE/HALE UAV
  | 'UNIDENTIFIED_RF'   // Low-confidence RF / DF anomaly
  | 'FRIENDLY_UAV'      // Whitelisted IAF/Border Patrol Transponder
  | 'AVIAN_CLUTTER';    // High-altitude migratory birds

export interface TargetTrack {
  id: string;
  callsign: string;
  classification: TargetClassification;
  threatLevel: ThreatLevel;
  rangeMeters: number;          // 0 to 5000m (AGT3DRD5000X max range)
  azimuthDeg: number;           // 0 to 360° (360° coverage)
  elevationDeg: number;         // 0 to 90°
  altitudeMslMeters: number;
  altitudeAglMeters: number;
  groundSpeedKmh: number;
  climbRateMs: number;
  rfFrequencyGhz: number;
  rfProtocol:
    | 'DJI OcuSync 3.0'
    | 'DJI Lightbridge 2.4G'
    | 'Custom FHSS 915MHz'
    | 'CRSF / ExpressLRS'
    | 'Analog Video 5.8G'
    | 'LoRa 433MHz'
    | 'STANAG 4586 (Friendly)';
  rfSignalDbm: number;
  aoaBearingDeg: number;        // AoA bearing computed from USRP B210 array (degrees)
  tdoaTimeDiffNs: number;       // TDOA time-difference of arrival (nanoseconds)
  dfConfidencePct: number;      // Direction-finding confidence 0–100%
  kuBandReflectivity: number;   // AGT3DRD5000X Ku-band RCS (dBsm)
  radarCrossSection: number;    // RCS in m² (for AGT3DRD5000X classification)
  opticalConfidence: number;    // XBOOM A30TR1575 YOLO AI tracking confidence %
  xboomLrfRangeM: number;       // XBOOM LRF measured range (meters, max 10,000m)
  fusionConfidence: number;     // Combined sensor fusion confidence %
  losBlocked: boolean;
  isTargetLocked: boolean;
  isMitigated: boolean;
  firstDetectedAt: string;
  history: Array<{ x: number; y: number; timestamp: number }>;
}

export interface AtmosphericTelemetry {
  ambientTempC: number;
  barometricPressureKpa: number;
  altitudeMsl: number;
  airDensityKgM3: number;
  densityAltitudeRatio: number;
  rotorLiftDeficitPct: number;
  throttleCurrentMultiplier: number;
  aerodynamicStallRisk: 'LOW' | 'MODERATE' | 'HIGH';
  windSpeedKmh: number;
  windDirectionDeg: number;
  relativeHumidityPct: number;
}

export interface ThermalZone {
  name: string;
  currentTempC: number;
  targetTempC: number;
  minTempC: number;
  maxTempC: number;
  status: 'NOMINAL' | 'HEATING' | 'COOLING' | 'OVERHEAT' | 'COLD_WARNING';
  heaterDutyPct: number;
}

export interface PidThermalTelemetry {
  enclosureTempC: number;
  setpointTempC: number;
  errorTempC: number;
  kp: number;
  ki: number;
  kd: number;
  pwmDutyCyclePct: number;
  zones: {
    jetsonSbcCore: ThermalZone;        // Jetson Orin NX (GPU inference server)
    usrpB210Sdr: ThermalZone;          // NI Ettus USRP B210 RF front-end
    xboomGimbalBearings: ThermalZone;  // XBOOM A30TR1575 gimbal harmonic drive
    xboomGermaniumDome: ThermalZone;   // XBOOM A30TR1575 Germanium IR dome
    agt3dRadarRadome: ThermalZone;     // FlySpark AGT3DRD5000X Ku-band radome de-icer
  };
  antiIcingStripActive: boolean;
  autoDefrostRunning: boolean;
}

export interface BatteryCell {
  cellId: number;
  voltage: number;
  temperatureC: number;
  impedanceMohm: number;
}

export interface LifePo4Telemetry {
  packVoltage: number;
  packCurrentA: number;
  stateOfChargePct: number;
  stateOfHealthPct: number;
  internalCoreTempC: number;
  ambientSoakTempC: number;
  preheatedCapacityAh: number;
  coldSoakRawCapacityAh: number;
  internalHeatingPadsActive: boolean;
  solarMpptWatts: number;
  backupFuelCellOnline: boolean;
  cells: BatteryCell[];
}

export interface NetworkHealth {
  satcomLatencyMs: number;
  satcomSnrDb: number;
  satcomStatus: 'ACTIVE' | 'DEGRADED' | 'DISCONNECTED';
  loraMeshNodes: Array<{ id: string; name: string; rssi: number; batteryPct: number; online: boolean }>;
  sqliteBufferQueueLength: number;
  sqliteWriteIops: number;
  defconLevel: 1 | 2 | 3 | 4 | 5;
  readinessState: 'OPTIMAL' | 'DEGRADED' | 'ENGAGING';
}

// NI Ettus USRP B210 per-unit status
export interface UsrpUnit {
  unitId: number;             // 1, 2, 3
  online: boolean;
  centerFreqGhz: number;      // Current tuned center frequency
  gainDb: number;             // RF gain (0–76 dB for B210)
  signalLevelDbm: number;     // Current peak signal level
  aoaBearingDeg: number;      // Computed AoA bearing from this unit's MIMO channels
  tdoaTimeDiffNs: number;     // TDOA time-diff for this unit pair
  channelA_Dbm: number;       // Channel A (RX1) power
  channelB_Dbm: number;       // Channel B (RX2) power (2×2 MIMO)
  lockState: 'SCANNING' | 'DETECTING' | 'LOCKED' | 'OFFLINE';
}

// RWS (Remote Weapon Station) — 35–40mm airburst hard-kill
export type RwsFireMode = 'SAFE' | 'ARMED' | 'WEAPONS_FREE';
export type RwsAmmoType = '35MM_AHEAD' | '40MM_AIRBURST';

export interface RwsState {
  fireMode: RwsFireMode;
  azimuthDeg: number;            // Current barrel azimuth
  elevationDeg: number;          // Current barrel elevation
  fcrLockActive: boolean;        // Fire-control radar / EO lock on target
  fcrLockTargetId: string | null;
  ammoType: RwsAmmoType;
  ammoRoundsRemaining: number;   // e.g. 24 rounds
  airbustProximityFuseM: number; // Programmable proximity fuse radius (0–5m)
  barrelTempC: number;
  hydraulicPressureBar: number;
  roeAuthorized: boolean;        // Rules of Engagement — human authorization flag
  lastFireTimestamp: string | null;
  effectiveRangeM: { min: number; max: number }; // { min: 3000, max: 4000 }
}

// Guardian-S08 + full countermeasures state
export interface CountermeasureState {
  // FlySpark Guardian-S08 jammer (410 MHz – 5.9 GHz, max 180W EIRP)
  gnssJammingActive: boolean;
  c2LinkJammingActive: boolean;
  videoDownlinkJammingActive: boolean;
  jammingPowerEirpWatts: number;   // 10 – 180 W (Guardian-S08 max)
  jammingAzimuthDeg: number;
  guardianS08Online: boolean;
  // XBOOM A30TR1575 gimbal slew-to-cue
  opticalGimbalLocked: boolean;
  opticalGimbalAzimuthDeg: number;
  opticalGimbalElevationDeg: number;
  xboomAiTrackActive: boolean;
  xboomLrfRangingActive: boolean;
  // RWS Hard-kill
  rws: RwsState;
  // Thermal
  autoDefrostCycleRemainingSec: number;
}

export interface IncursionLogEvent {
  id: string;
  timestamp: string;
  timeOffsetSec: number;
  severity: 'INFO' | 'WARNING' | 'ALERT' | 'ENGAGEMENT' | 'SUCCESS';
  sensorSource: 'USRP_B210' | 'AGT3D_RADAR' | 'XBOOM_OPTICS' | 'RADAR_FUSION' | 'GUARDIAN_S08' | 'RWS_HARDKILL';
  title: string;
  details: string;
  targetId?: string;
}

export type DemoPhase = 0 | 1 | 2 | 3 | 4;

export interface DemoScenarioState {
  isRunning: boolean;
  currentPhase: DemoPhase;
  elapsedSeconds: number;
  playbackSpeed: 1 | 2 | 5;
  phaseDescription: string;
}
