'use client';

import React from 'react';
import { AtmosphericTelemetry } from '@/types/dashboard';
import { Heart, Wind, Gauge, Compass, Flame, Cpu, ThermometerSnowflake } from 'lucide-react';
import { calculateAtmospherics } from '@/utils/physicsEngine';

interface HighAltitudeAtmosphericsCardProps {
  telemetry: AtmosphericTelemetry;
}

export const HighAltitudeAtmosphericsCard: React.FC<HighAltitudeAtmosphericsCardProps> = ({ telemetry }) => {
  // Dynamically calculate atmospherics using the physics engine
  const atmoCalculated = calculateAtmospherics({
    ambientTempC: telemetry.ambientTempC,
    barometricPressureKpa: telemetry.barometricPressureKpa,
    windSpeedKmh: telemetry.windSpeedKmh,
    windDirectionDeg: telemetry.windDirectionDeg,
    altitudeMsl: telemetry.altitudeMsl ?? 4850,
    referenceHeadingDeg: 42, // Sentry boresight azimuth
  });

  // Pressure ratio vs sea level 101.325 kPa
  const pressureRatioPct = Math.min(100, Math.max(0, Math.round((telemetry.barometricPressureKpa / 101.325) * 100)));
  const isOptimal = atmoCalculated.riskLevel === 'LOW' || atmoCalculated.riskLevel === 'MODERATE';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-3.5 text-slate-900 font-mono flex flex-col justify-between h-full shadow-sm">
      {/* Top Header: Title, Sensor Bus & Health Badge */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
        <div>
          <div className="text-xs font-bold text-slate-900 tracking-wide flex items-center gap-1.5">
            <ThermometerSnowflake className="w-4 h-4 text-sky-600" />
            <span>High-Altitude Atmospherics</span>
          </div>
          <div className="text-[9px] text-slate-500 tracking-tight mt-0.5">
            4,850m MSL • I2C:0x76 BME280
          </div>
        </div>

        {/* Pulse Heart Rate Health Badge */}
        <div className="flex flex-col items-end">
          <div className="flex items-center space-x-1.5 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full">
            <Heart className="w-3 h-3 text-sky-600 fill-sky-500 animate-pulse" />
            <span className="text-[10px] font-bold text-sky-800">
              {isOptimal ? 'Optimal' : 'Caution'}
            </span>
          </div>
        </div>
      </div>

      {/* Semi-Circular SVG Arc Gauge */}
      <div className="flex flex-col items-center justify-center my-1 relative">
        <svg className="w-48 h-32" viewBox="0 0 180 130">
          {/* Outer thin guide arc */}
          <path
            d="M 34.3 112 A 68 68 0 1 1 145.7 112"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="1.2"
          />
          {/* Subtle tick ends */}
          <line x1="32" y1="112" x2="37" y2="112" stroke="#cbd5e1" strokeWidth="1.5" />
          <line x1="143" y1="112" x2="148" y2="112" stroke="#cbd5e1" strokeWidth="1.5" />

          {/* Thick Background Track */}
          <path
            d="M 42.5 106 A 58 58 0 1 1 137.5 106"
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="12"
            strokeLinecap="round"
          />

          {/* Active Filled Arc */}
          <path
            d="M 42.5 106 A 58 58 0 1 1 137.5 106"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="12"
            strokeLinecap="round"
            pathLength="100"
            strokeDasharray="100"
            strokeDashoffset={100 - pressureRatioPct}
            className="transition-all duration-500 ease-out"
          />

          {/* Central Texts */}
          <text x="90" y="52" fill="#64748b" fontSize="10" fontWeight="600" textAnchor="middle" letterSpacing="1">
            PRESSURE (P)
          </text>
          <text x="90" y="82" fill="#0f172a" fontSize="26" fontWeight="800" textAnchor="middle">
            {telemetry.barometricPressureKpa.toFixed(1)}<tspan fontSize="15" fill="#d97706"> kPa</tspan>
          </text>
        </svg>

        {/* Sub-Arc Status & Summary */}
        <div className="w-full flex justify-between px-2 -mt-2">
          <div>
            <span className="text-amber-800 font-bold text-xs block">
              4,850m MSL
            </span>
            <span className="text-[9px] text-slate-500 block">Station Alt</span>
          </div>
          <div className="text-right">
            <span className="text-amber-800 font-bold text-xs block">
              {atmoCalculated.airDensityKgM3} kg/m³
            </span>
            <span className="text-[9px] text-slate-500 block">Air Density (ρ)</span>
          </div>
        </div>
      </div>

      {/* Metric Tiles Grid */}
      <div className="space-y-1.5 mt-1">
        {/* Row 1: Ambient T | Wind Speed | Wind Dir (3 cols) */}
        <div className="grid grid-cols-3 gap-1.5 text-left">
          {/* Ambient Temp */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 relative">
            <span className="text-[9px] text-slate-500 block">Ambient (T)</span>
            <span className="text-xs font-bold text-slate-900 block mt-0.5">
              {telemetry.ambientTempC.toFixed(1)}°C
            </span>
            <div className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 rounded-full border border-slate-300 text-slate-600 bg-white text-[8px] flex items-center justify-center font-bold">
              °C
            </div>
          </div>

          {/* Wind Speed */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 relative">
            <span className="text-[9px] text-slate-500 block">Wind (V)</span>
            <span className="text-xs font-bold text-amber-700 block mt-0.5">
              {telemetry.windSpeedKmh} km/h
            </span>
            <div className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 rounded-full border border-slate-300 text-slate-600 bg-white text-[8px] flex items-center justify-center font-bold">
              V
            </div>
          </div>

          {/* Wind Dir */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 relative">
            <span className="text-[9px] text-slate-500 block">Direction</span>
            <span className="text-xs font-bold text-slate-900 block mt-0.5">
              {telemetry.windDirectionDeg}°
            </span>
            <div className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 rounded-full border border-slate-300 text-slate-600 bg-white text-[8px] flex items-center justify-center font-bold">
              θ
            </div>
          </div>
        </div>

        {/* Row 2: Headwind | Crosswind (2 cols) */}
        <div className="grid grid-cols-2 gap-1.5 text-left">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 relative">
            <span className="text-[9px] text-slate-500 block">Headwind Vector</span>
            <span className="text-xs font-bold text-emerald-700 block mt-0.5">
              {atmoCalculated.headwindKmh >= 0 ? `+${atmoCalculated.headwindKmh}` : atmoCalculated.headwindKmh} km/h
            </span>
            <Wind className="absolute bottom-2 right-2 w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 relative">
            <span className="text-[9px] text-slate-500 block">Crosswind Vector</span>
            <span className="text-xs font-bold text-slate-900 block mt-0.5">
              {Math.abs(atmoCalculated.crosswindKmh)} km/h
            </span>
            <Compass className="absolute bottom-2 right-2 w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

        {/* Row 3: Pitot De-Ice | Baro Comp (2 cols) */}
        <div className="grid grid-cols-2 gap-1.5 text-left">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 relative flex items-center justify-between">
            <div>
              <span className="text-[9px] text-slate-500 block">Pitot De-Ice</span>
              <div className="flex items-center space-x-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                <span className="text-xs font-bold text-emerald-700">ON</span>
              </div>
            </div>
            <Flame className="w-3.5 h-3.5 text-amber-500" />
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 relative flex items-center justify-between">
            <div>
              <span className="text-[9px] text-slate-500 block">Baro Comp</span>
              <div className="flex items-center space-x-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                <span className="text-xs font-bold text-emerald-700">ON</span>
              </div>
            </div>
            <Cpu className="w-3.5 h-3.5 text-sky-600" />
          </div>
        </div>

        {/* Row 4: ISA Standard Offset (full width) */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 flex items-center justify-between text-[10px]">
          <div className="flex items-center space-x-1.5">
            <Gauge className="w-3.5 h-3.5 text-sky-600" />
            <span className="text-slate-700 font-medium">ISA Offset:</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[9px] text-amber-800 font-bold bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded">
              ΔT: {atmoCalculated.isaTempOffsetC > 0 ? `+${atmoCalculated.isaTempOffsetC}` : atmoCalculated.isaTempOffsetC}°C
            </span>
            <span className="text-[9px] text-slate-600 font-medium">
              ΔP: {atmoCalculated.isaPressureOffsetKpa} kPa
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
