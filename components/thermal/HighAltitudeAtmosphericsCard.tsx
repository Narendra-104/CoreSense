'use client';

import React from 'react';
import { AtmosphericTelemetry } from '@/types/dashboard';
import { Heart, Wind, Gauge, Compass, Flame, Cpu, Navigation } from 'lucide-react';
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
    <div className="bg-[#111317] border border-[#232730] rounded-2xl p-3.5 text-white font-mono flex flex-col justify-between h-full shadow-lg">
      {/* Top Header: Station Identifier, Sensor Bus & Health Badge */}
      <div className="flex items-center justify-between pb-2 border-b border-[#232730]">
        <div>
          <div className="text-xs font-bold text-amber-400 tracking-wider">
            MET-4850M-LADAKH
          </div>
          <div className="text-[9px] text-slate-400 tracking-tight">
            I2C:0x76 • BME280 / ULTRASONIC
          </div>
        </div>

        {/* Pulse Heart Rate Health Badge */}
        <div className="flex flex-col items-end">
          <div className="flex items-center space-x-1">
            <div className="w-5 h-5 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center">
              <Heart className="w-3 h-3 text-amber-400 fill-amber-400 animate-pulse" />
            </div>
            <span className="text-[10px] font-bold text-amber-400">
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
            stroke="#eab308"
            strokeWidth="1.2"
            strokeOpacity="0.35"
          />
          {/* Subtle tick ends */}
          <line x1="32" y1="112" x2="37" y2="112" stroke="#eab308" strokeWidth="1.5" strokeOpacity="0.8" />
          <line x1="143" y1="112" x2="148" y2="112" stroke="#eab308" strokeWidth="1.5" strokeOpacity="0.8" />

          {/* Thick Background Track */}
          <path
            d="M 42.5 106 A 58 58 0 1 1 137.5 106"
            fill="none"
            stroke="#22252e"
            strokeWidth="12"
            strokeLinecap="round"
          />

          {/* Active Filled Arc */}
          <path
            d="M 42.5 106 A 58 58 0 1 1 137.5 106"
            fill="none"
            stroke="#eab308"
            strokeWidth="12"
            strokeLinecap="round"
            pathLength="100"
            strokeDasharray="100"
            strokeDashoffset={100 - pressureRatioPct}
            className="transition-all duration-500 ease-out"
          />

          {/* Central Texts */}
          <text x="90" y="52" fill="#94a3b8" fontSize="10" fontWeight="600" textAnchor="middle" letterSpacing="1">
            PRESSURE (P)
          </text>
          <text x="90" y="82" fill="#ffffff" fontSize="26" fontWeight="800" textAnchor="middle">
            {telemetry.barometricPressureKpa.toFixed(1)}<tspan fontSize="15" fill="#eab308"> kPa</tspan>
          </text>
        </svg>

        {/* Sub-Arc Status & Summary */}
        <div className="w-full flex justify-between px-2 -mt-2">
          <div>
            <span className="text-amber-400 font-bold text-xs block">
              4,850m MSL
            </span>
            <span className="text-[9px] text-slate-400 block">Station Alt</span>
          </div>
          <div className="text-right">
            <span className="text-amber-400 font-bold text-xs block">
              {atmoCalculated.airDensityKgM3} kg/m³
            </span>
            <span className="text-[9px] text-slate-400 block">Air Density (ρ)</span>
          </div>
        </div>
      </div>

      {/* Metric Tiles Grid */}
      <div className="space-y-1.5 mt-1">
        {/* Row 1: Ambient T | Wind Speed | Wind Dir (3 cols) */}
        <div className="grid grid-cols-3 gap-1.5 text-left">
          {/* Ambient Temp */}
          <div className="bg-[#181a20] border border-[#262934] rounded-xl p-2 relative">
            <span className="text-[9px] text-slate-400 block">Ambient (T)</span>
            <span className="text-xs font-bold text-amber-400 block mt-0.5">
              {telemetry.ambientTempC.toFixed(1)}°C
            </span>
            <div className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 rounded-full border border-amber-400/40 text-amber-400 text-[8px] flex items-center justify-center font-bold">
              °C
            </div>
          </div>

          {/* Wind Speed */}
          <div className="bg-[#181a20] border border-[#262934] rounded-xl p-2 relative">
            <span className="text-[9px] text-slate-400 block">Wind (V)</span>
            <span className="text-xs font-bold text-amber-400 block mt-0.5">
              {telemetry.windSpeedKmh} km/h
            </span>
            <div className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 rounded-full border border-amber-400/40 text-amber-400 text-[8px] flex items-center justify-center font-bold">
              V
            </div>
          </div>

          {/* Wind Dir */}
          <div className="bg-[#181a20] border border-[#262934] rounded-xl p-2 relative">
            <span className="text-[9px] text-slate-400 block">Direction</span>
            <span className="text-xs font-bold text-amber-400 block mt-0.5">
              {telemetry.windDirectionDeg}°
            </span>
            <div className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 rounded-full border border-amber-400/40 text-amber-400 text-[8px] flex items-center justify-center font-bold">
              θ
            </div>
          </div>
        </div>

        {/* Row 2: Headwind | Crosswind (2 cols) */}
        <div className="grid grid-cols-2 gap-1.5 text-left">
          <div className="bg-[#181a20] border border-[#262934] rounded-xl p-2 relative">
            <span className="text-[9px] text-slate-400 block">Headwind Vector</span>
            <span className="text-xs font-bold text-amber-400 block mt-0.5">
              {atmoCalculated.headwindKmh >= 0 ? `+${atmoCalculated.headwindKmh}` : atmoCalculated.headwindKmh} km/h
            </span>
            <Wind className="absolute bottom-2 right-2 w-3.5 h-3.5 text-amber-400/50" />
          </div>

          <div className="bg-[#181a20] border border-[#262934] rounded-xl p-2 relative">
            <span className="text-[9px] text-slate-400 block">Crosswind Vector</span>
            <span className="text-xs font-bold text-amber-400 block mt-0.5">
              {Math.abs(atmoCalculated.crosswindKmh)} km/h
            </span>
            <Compass className="absolute bottom-2 right-2 w-3.5 h-3.5 text-amber-400/50" />
          </div>
        </div>

        {/* Row 3: Pitot De-Ice | Baro Comp (2 cols) */}
        <div className="grid grid-cols-2 gap-1.5 text-left">
          <div className="bg-[#181a20] border border-[#262934] rounded-xl p-2 relative flex items-center justify-between">
            <div>
              <span className="text-[9px] text-slate-400 block">Pitot De-Ice</span>
              <div className="flex items-center space-x-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                <span className="text-xs font-bold text-amber-400">ON</span>
              </div>
            </div>
            <Flame className="w-3.5 h-3.5 text-amber-400/50" />
          </div>

          <div className="bg-[#181a20] border border-[#262934] rounded-xl p-2 relative flex items-center justify-between">
            <div>
              <span className="text-[9px] text-slate-400 block">Baro Comp</span>
              <div className="flex items-center space-x-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                <span className="text-xs font-bold text-amber-400">ON</span>
              </div>
            </div>
            <Cpu className="w-3.5 h-3.5 text-amber-400/50" />
          </div>
        </div>

        {/* Row 4: ISA Standard Offset (full width) */}
        <div className="bg-[#181a20] border border-[#262934] rounded-xl px-2.5 py-1.5 flex items-center justify-between text-[10px]">
          <div className="flex items-center space-x-1.5">
            <Gauge className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-300">ISA Offset:</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[9px] text-amber-400 font-bold bg-amber-950/60 border border-amber-800/40 px-1.5 py-0.5 rounded">
              ΔT: {atmoCalculated.isaTempOffsetC > 0 ? `+${atmoCalculated.isaTempOffsetC}` : atmoCalculated.isaTempOffsetC}°C
            </span>
            <span className="text-[9px] text-slate-400">
              ΔP: {atmoCalculated.isaPressureOffsetKpa} kPa
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
