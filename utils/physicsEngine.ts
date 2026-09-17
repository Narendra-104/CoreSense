/**
 * CoreSense Mission Control — Embedded Physics & Power Calculation Engine
 * Problem Statement: PS 26050 — High-Altitude Counter-UAS Defense Dashboard
 * 
 * Modular calculation functions for:
 * 1. High-Altitude Atmospherics Engine (ISA Offsets, Air Density, Wind Vector Decomposition)
 * 2. Air Density Engine (Ideal gas law, Rotor Lift Deficit, Throttle Multiplier, Blade Stall Risk)
 * 3. LiFePO4 Cold-Discharge Power Engine (OCV/IR SoC curve, Sub-Zero Capacity Retention, Thermal Jacket Buffer)
 */

export const GAS_CONSTANT_DRY_AIR = 287.058; // J/(kg·K)
export const SEA_LEVEL_AIR_DENSITY = 1.225;   // kg/m³ (ISA at 0m MSL, 15°C, 101.325 kPa)
export const SEA_LEVEL_PRESSURE_KPA = 101.325; // kPa
export const SEA_LEVEL_TEMP_C = 15.0;         // °C
export const SENTRY_DEFAULT_ALTITUDE_MSL = 4850; // Ladakh Sector MSL in meters

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface AtmosphericsInput {
  ambientTempC: number;        // T in °C
  barometricPressureKpa: number; // P in kPa
  windSpeedKmh: number;        // V in km/h
  windDirectionDeg: number;    // θ in degrees (0–360°)
  altitudeMsl?: number;        // MSL in meters (default 4,850m)
  referenceHeadingDeg?: number;// Sentry or Target orientation (default 042°)
}

export interface AtmosphericsOutput {
  airDensityKgM3: number;
  isaTempOffsetC: number;      // T - T_ISA at altitude
  isaPressureOffsetKpa: number;// P - P_ISA at altitude
  headwindKmh: number;         // Positive = Headwind, Negative = Tailwind
  crosswindKmh: number;        // Positive = Crosswind from Right, Negative = Left
  relativeWindAngleDeg: number;// Relative wind angle to boresight
  densityDropPct: number;      // % drop vs Sea Level (1.225 kg/m³)
  riskLevel: RiskLevel;
}

export interface AirDensityInput {
  ambientTempC: number;
  barometricPressureKpa: number;
}

export interface AirDensityOutput {
  airDensityKgM3: number;
  densityDropPct: number;
  densityRatio: number;        // sigma = rho / 1.225
  rotorLiftDeficitPct: number; // % RPM increase required to match sea-level hover thrust
  throttleCurrentMultiplier: number; // sqrt(1.225 / rho)
  bladeStallMarginRisk: RiskLevel;
  stallMarginWarning: string;
}

export interface LiFePo4Input {
  batteryVoltageV: number;     // 16S Pack Voltage (e.g. 44.0V - 58.4V)
  packCurrentA: number;        // Discharge Current (negative = discharge, positive = charge)
  coreTempC: number;           // Battery core temperature in °C
  thermalJacketActive: boolean;// Heated jacket state
  nominalCapacityAh?: number;  // Default 100 Ah pack
  ambientTempC?: number;       // Cold soak ambient temp (-24.8°C default)
}

export interface LiFePo4Output {
  stateOfChargePct: number;    // %
  usableAhReservePreheated: number; // Ah with thermal jacket (+18°C)
  usableAhReserveColdSoak: number;  // Ah unheated cold soak (-25°C)
  capacityLossRawPct: number;  // % drop without thermal management
  capacityBufferGainAh: number;// Ah saved by thermal jacket
  powerWatts: number;          // V * A
  cRate: number;               // Current / Nominal Capacity
  riskLevel: RiskLevel;
}

/**
 * 1. High-Altitude Atmospherics Engine
 * Computes ISA offset, dry air density, and decomposes wind vector into orthogonal components.
 */
export function calculateAtmospherics(input: AtmosphericsInput): AtmosphericsOutput {
  // Input boundary clamping and validation
  const tempC = Math.max(-60, Math.min(60, Number.isFinite(input.ambientTempC) ? input.ambientTempC : -24.8));
  const pressureKpa = Math.max(20, Math.min(110, Number.isFinite(input.barometricPressureKpa) ? input.barometricPressureKpa : 54.2));
  const windKmh = Math.max(0, Math.min(200, Number.isFinite(input.windSpeedKmh) ? input.windSpeedKmh : 42.0));
  const windDirDeg = (Number.isFinite(input.windDirectionDeg) ? input.windDirectionDeg : 315) % 360;
  const altitudeM = input.altitudeMsl ?? SENTRY_DEFAULT_ALTITUDE_MSL;
  const refHeadingDeg = (input.referenceHeadingDeg ?? 42) % 360;

  // International Standard Atmosphere (ISA) calculation at altitude
  // ISA lapse rate: -6.5 °C / 1000m up to 11,000m
  const isaTempC = SEA_LEVEL_TEMP_C - 0.0065 * altitudeM; // e.g. -16.53 °C at 4,850m
  const isaTempOffsetC = parseFloat((tempC - isaTempC).toFixed(1));

  // ISA barometric pressure at altitude: P = P0 * (1 - 2.25577e-5 * h)^5.25588
  const isaPressureKpa = SEA_LEVEL_PRESSURE_KPA * Math.pow(1 - 2.25577e-5 * altitudeM, 5.25588);
  const isaPressureOffsetKpa = parseFloat((pressureKpa - isaPressureKpa).toFixed(2));

  // Air Density via Ideal Gas Law: rho = (P * 1000) / (R * T_Kelvin)
  const tempK = tempC + 273.15;
  const airDensity = (pressureKpa * 1000) / (GAS_CONSTANT_DRY_AIR * tempK);
  const airDensityKgM3 = parseFloat(Math.max(0.2, Math.min(1.5, airDensity)).toFixed(3));

  const densityDropPct = parseFloat((((SEA_LEVEL_AIR_DENSITY - airDensityKgM3) / SEA_LEVEL_AIR_DENSITY) * 100).toFixed(1));

  // Wind Vector Decomposition
  // Relative wind angle alpha = wind direction - boresight heading
  const relativeAngleRad = ((windDirDeg - refHeadingDeg) * Math.PI) / 180;
  const headwindKmh = parseFloat((windKmh * Math.cos(relativeAngleRad)).toFixed(1));
  const crosswindKmh = parseFloat((windKmh * Math.sin(relativeAngleRad)).toFixed(1));
  const relativeWindAngleDeg = Math.round(((windDirDeg - refHeadingDeg + 360) % 360));

  // Risk Classification
  let riskLevel: RiskLevel = 'LOW';
  if (windKmh > 70 || Math.abs(crosswindKmh) > 50 || tempC < -35) {
    riskLevel = 'CRITICAL';
  } else if (windKmh > 50 || Math.abs(crosswindKmh) > 35 || tempC < -25) {
    riskLevel = 'HIGH';
  } else if (windKmh > 30 || Math.abs(crosswindKmh) > 20) {
    riskLevel = 'MODERATE';
  }

  return {
    airDensityKgM3,
    isaTempOffsetC,
    isaPressureOffsetKpa,
    headwindKmh,
    crosswindKmh,
    relativeWindAngleDeg,
    densityDropPct,
    riskLevel,
  };
}

/**
 * 2. Air Density Engine
 * Computes aerodynamic lift loss, throttle surge multiplier, and blade stall boundary.
 */
export function calculateAirDensityMetrics(input: AirDensityInput): AirDensityOutput {
  const tempC = Math.max(-60, Math.min(60, Number.isFinite(input.ambientTempC) ? input.ambientTempC : -24.8));
  const pressureKpa = Math.max(20, Math.min(110, Number.isFinite(input.barometricPressureKpa) ? input.barometricPressureKpa : 54.2));

  const tempK = tempC + 273.15;
  const rawRho = (pressureKpa * 1000) / (GAS_CONSTANT_DRY_AIR * tempK);
  const airDensityKgM3 = parseFloat(Math.max(0.3, Math.min(1.4, rawRho)).toFixed(3));

  // Density drop vs sea level (1.225 kg/m³)
  const densityDropPct = parseFloat((((SEA_LEVEL_AIR_DENSITY - airDensityKgM3) / SEA_LEVEL_AIR_DENSITY) * 100).toFixed(1));
  const densityRatio = parseFloat((airDensityKgM3 / SEA_LEVEL_AIR_DENSITY).toFixed(3));

  // Aerodynamic Thrust: T = C_T * rho * A * (Omega * R)^2
  // To match sea-level hover thrust (T_high = T_0):
  // Omega_high / Omega_0 = sqrt(rho_0 / rho)
  const throttleCurrentMultiplier = parseFloat(Math.sqrt(SEA_LEVEL_AIR_DENSITY / airDensityKgM3).toFixed(2));
  const rotorLiftDeficitPct = parseFloat(((throttleCurrentMultiplier - 1) * 100).toFixed(1));

  // Blade Stall Margin Evaluation
  let bladeStallMarginRisk: RiskLevel = 'LOW';
  let stallMarginWarning = 'Nominal rotor pitch margin.';

  if (airDensityKgM3 < 0.72) {
    bladeStallMarginRisk = 'HIGH';
    stallMarginWarning = 'Critical thin air: Hostile UAV entering blade stall during high AOA maneuvers.';
  } else if (airDensityKgM3 < 0.85) {
    bladeStallMarginRisk = 'MODERATE';
    stallMarginWarning = 'Moderate rotor deficit: +27% RPM required. Increased motor thermal load.';
  } else {
    bladeStallMarginRisk = 'LOW';
    stallMarginWarning = 'Sufficient aerodynamic margin for standard quadrotor flight envelope.';
  }

  return {
    airDensityKgM3,
    densityDropPct,
    densityRatio,
    rotorLiftDeficitPct,
    throttleCurrentMultiplier,
    bladeStallMarginRisk,
    stallMarginWarning,
  };
}

/**
 * 3. LiFePO4 Cold-Discharge Power Engine
 * OCV-based SoC determination with Arrhenius-adjusted internal resistance and temperature derating.
 */
export function calculateLiFePo4Power(input: LiFePo4Input): LiFePo4Output {
  const nominalCapAh = input.nominalCapacityAh ?? 100;
  const voltage = Math.max(36, Math.min(62, Number.isFinite(input.batteryVoltageV) ? input.batteryVoltageV : 51.2));
  const current = Number.isFinite(input.packCurrentA) ? input.packCurrentA : -6.4;
  const coreTempC = Number.isFinite(input.coreTempC) ? input.coreTempC : 18.5;
  const ambientColdSoakC = input.ambientTempC ?? -24.8;
  const hasThermalJacket = input.thermalJacketActive;

  // Temperature-dependent internal impedance compensation (R_int in Ohms)
  // At 20°C: ~0.008 Ohm (16S). At -25°C: ~0.045 Ohm (5.6x increase)
  const rIntOhms = 0.008 * Math.exp(0.04 * (20 - coreTempC));
  const ocvVoltage = voltage - current * rIntOhms;

  // 16S LiFePO4 Open Circuit Voltage (OCV) to SoC mapping curve
  const ocvTable: Array<[number, number]> = [
    [54.8, 100],
    [53.6, 95],
    [53.2, 90],
    [52.8, 80],
    [52.5, 70],
    [52.2, 60],
    [51.8, 50],
    [51.5, 40],
    [51.2, 25],
    [50.4, 15],
    [48.0, 5],
    [44.0, 0],
  ];

  let calculatedSoc = 50;
  if (ocvVoltage >= ocvTable[0][0]) {
    calculatedSoc = 100;
  } else if (ocvVoltage <= ocvTable[ocvTable.length - 1][0]) {
    calculatedSoc = 0;
  } else {
    for (let i = 0; i < ocvTable.length - 1; i++) {
      const [vHigh, socHigh] = ocvTable[i];
      const [vLow, socLow] = ocvTable[i + 1];
      if (ocvVoltage <= vHigh && ocvVoltage >= vLow) {
        const ratio = (ocvVoltage - vLow) / (vHigh - vLow);
        calculatedSoc = socLow + ratio * (socHigh - socLow);
        break;
      }
    }
  }

  const stateOfChargePct = parseFloat(Math.max(0, Math.min(100, calculatedSoc)).toFixed(1));

  // Usable capacity retention models at sub-zero vs heated jacket
  // LiFePO4 usable capacity derating factor:
  // At +20°C: ~95–98%
  // At 0°C: ~80%
  // At -10°C: ~68%
  // At -25°C: ~40–42% (electro-chemical freeze of electrolyte)
  const getCapacityFactor = (tC: number): number => {
    if (tC >= 20) return 0.98;
    if (tC >= 0) return 0.80 + (tC / 20) * 0.18;
    if (tC >= -20) return 0.50 + ((tC + 20) / 20) * 0.30;
    // Deep sub-zero (< -20°C)
    return Math.max(0.20, 0.42 + ((tC + 25) / 5) * 0.08);
  };

  // Pre-heated pack maintains core temp ~ +18°C via PID heater pads
  const preheatedTemp = hasThermalJacket ? Math.max(15, coreTempC) : coreTempC;
  const preheatedFactor = getCapacityFactor(preheatedTemp);
  const usableAhReservePreheated = parseFloat(((nominalCapAh * (stateOfChargePct / 100)) * preheatedFactor).toFixed(1));

  // Cold soak unheated pack drops down to ambient soak temp (-24.8°C)
  const coldSoakFactor = getCapacityFactor(ambientColdSoakC);
  const usableAhReserveColdSoak = parseFloat(((nominalCapAh * (stateOfChargePct / 100)) * coldSoakFactor).toFixed(1));

  const capacityLossRawPct = parseFloat(((1 - coldSoakFactor) * 100).toFixed(1));
  const capacityBufferGainAh = parseFloat(Math.max(0, usableAhReservePreheated - usableAhReserveColdSoak).toFixed(1));

  const powerWatts = Math.round(Math.abs(voltage * current));
  const cRate = parseFloat((Math.abs(current) / nominalCapAh).toFixed(2));

  let riskLevel: RiskLevel = 'LOW';
  if (stateOfChargePct < 15 || (coreTempC < 0 && !hasThermalJacket)) {
    riskLevel = 'CRITICAL';
  } else if (stateOfChargePct < 30 || coreTempC < 5) {
    riskLevel = 'HIGH';
  } else if (stateOfChargePct < 50 || coreTempC < 12) {
    riskLevel = 'MODERATE';
  }

  return {
    stateOfChargePct,
    usableAhReservePreheated,
    usableAhReserveColdSoak,
    capacityLossRawPct,
    capacityBufferGainAh,
    powerWatts,
    cRate,
    riskLevel,
  };
}

/**
 * Semantic Color Mapping Helper for Tailwind CSS
 */
export function getRiskColorClass(risk: RiskLevel): {
  text: string;
  bg: string;
  border: string;
  badge: string;
} {
  switch (risk) {
    case 'CRITICAL':
      return {
        text: 'text-rose-700 font-bold',
        bg: 'bg-rose-50',
        border: 'border-rose-300',
        badge: 'bg-rose-100 text-rose-800 border-rose-300 font-bold animate-pulse',
      };
    case 'HIGH':
      return {
        text: 'text-rose-600 font-bold',
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        badge: 'bg-rose-50 text-rose-700 border-rose-200 font-bold',
      };
    case 'MODERATE':
      return {
        text: 'text-amber-700 font-bold',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        badge: 'bg-amber-50 text-amber-800 border-amber-200 font-bold',
      };
    case 'LOW':
    default:
      return {
        text: 'text-emerald-700 font-bold',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        badge: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold',
      };
  }
}
