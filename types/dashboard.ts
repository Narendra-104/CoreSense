export type ThreatLevel = 'NOMINAL' | 'ELEVATED' | 'HOSTILE' | 'CRITICAL' | 'NEUTRALIZED';

export type TargetClassification = 
  | 'HOSTILE_DRONE' // DJI Matrice 300 RTK / Custom FPV High-Altitude payload
  | 'UNIDENTIFIED_RF' // Low confidence RF / Acoustic harmonic anomaly
  | 'FRIENDLY_UAV' // Whitelisted IAF/Border Patrol Transponder
  | 'AVIAN_CLUTTER'; // High-altitude migratory birds

export interface TargetTrack {
  id: string;
  callsign: string;
  classification: TargetClassification;
  threatLevel: ThreatLevel;
  rangeMeters: number; // 0 to 5000m
  azimuthDeg: number; // 0 to 360
  elevationDeg: number; // 0 to 90
  altitudeMslMeters: number; // e.g. 5120m MSL
  altitudeAglMeters: number; // e.g. 270m AGL
  groundSpeedKmh: number; // km/h
  climbRateMs: number; // m/s
  rfFrequencyGhz: number; // e.g. 2.437 or 5.785
  rfProtocol: 'DJI OcuSync 3.0' | 'Custom FHSS 915MHz' | 'CRSF / ExpressLRS' | 'Analog Video 5.8G' | 'STANAG 4586 (Friendly)';
  rfSignalDbm: number;
  acousticHarmonicHz: number; // Rotor harmonic e.g. 210 Hz
  acousticConfidence: number; // 0 - 100%
  opticalConfidence: number; // YOLO-v8 detection confidence %
  fusionConfidence: number; // Combined Sensor Fusion confidence %
  losBlocked: boolean; // Radar Line-of-sight blocked by mountain ridge
  isTargetLocked: boolean;
  isMitigated: boolean;
  firstDetectedAt: string;
  history: Array<{ x: number; y: number; timestamp: number }>;
}

export interface AtmosphericTelemetry {
  ambientTempC: number; // e.g. -24.8 C
  barometricPressureKpa: number; // e.g. 54.2 kPa
  altitudeMsl: number; // 4850m
  airDensityKgM3: number; // ~0.76 kg/m3 (38% thinner than sea level 1.225)
  densityAltitudeRatio: number; // 0.62 (air density relative to sea level)
  rotorLiftDeficitPct: number; // +27% higher RPM needed for hover
  throttleCurrentMultiplier: number; // 1.45x
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
  enclosureTempC: number; // +14.2 C
  setpointTempC: number; // +15.0 C
  errorTempC: number;
  kp: number;
  ki: number;
  kd: number;
  pwmDutyCyclePct: number; // 62%
  zones: {
    jetsonSbcCore: ThermalZone;
    rfFrontEndSdr: ThermalZone;
    ptzGimbalBearings: ThermalZone;
    opticalGermaniumDome: ThermalZone;
    rfRadomeDeIcer: ThermalZone;
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
  packVoltage: number; // 51.2V
  packCurrentA: number; // -6.4A
  stateOfChargePct: number; // 84%
  stateOfHealthPct: number; // 98%
  internalCoreTempC: number; // +18.5 C
  ambientSoakTempC: number; // -24.8 C
  preheatedCapacityAh: number; // 94.2 Ah
  coldSoakRawCapacityAh: number; // 42.0 Ah (58% drop without thermal management)
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

export interface CountermeasureState {
  gnssJammingActive: boolean;
  c2LinkJammingActive: boolean;
  videoDownlinkJammingActive: boolean;
  jammingPowerEirpWatts: number;
  jammingAzimuthDeg: number;
  opticalGimbalLocked: boolean;
  opticalGimbalAzimuthDeg: number;
  opticalGimbalElevationDeg: number;
  netLauncherArmed: boolean;
  netLauncherSafetyPinPulled: boolean;
  autoDefrostCycleRemainingSec: number;
}

export interface IncursionLogEvent {
  id: string;
  timestamp: string;
  timeOffsetSec: number;
  severity: 'INFO' | 'WARNING' | 'ALERT' | 'ENGAGEMENT' | 'SUCCESS';
  sensorSource: 'SDR_SCANNER' | 'ACOUSTIC_ARRAY' | 'LWIR_OPTICS' | 'RADAR_FUSION' | 'COUNTERMEASURE';
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
