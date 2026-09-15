'use client';

import React from 'react';
import { AtmosphericTelemetry } from '@/types/dashboard';
import { Wind, Gauge, ThermometerSnowflake, Activity, AlertCircle, Compass } from 'lucide-react';

interface AtmosphericEngineCardProps {
  telemetry: AtmosphericTelemetry;
}

export const AtmosphericEngineCard: React.FC<AtmosphericEngineCardProps> = ({ telemetry }) => {
  return (
    <div className="bg-tactical-panel border border-tactical-panelBorder rounded-lg p-3 shadow-lg flex flex-col space-y-3 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
        <div className="flex items-center space-x-2">
          <ThermometerSnowflake className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-cyan-400 tracking-wider">
            HIGH-ALTITUDE ATMOSPHERIC & AERODYNAMICS
          </span>
        </div>
        <span className="text-[10px] text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
          4,850m MSL
        </span>
      </div>

      {/* Atmospheric Primary Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-zinc-950/70 p-2 rounded border border-zinc-800">
          <div className="flex items-center space-x-1 text-zinc-400 text-[9px] mb-1">
            <ThermometerSnowflake className="w-3 h-3 text-cyan-400" />
            <span>AMBIENT TEMP</span>
          </div>
          <span className="text-base font-bold text-cyan-300">{telemetry.ambientTempC}°C</span>
          <span className="text-[8px] text-zinc-500 block">Sub-zero Arctic</span>
        </div>

        <div className="bg-zinc-950/70 p-2 rounded border border-zinc-800">
          <div className="flex items-center space-x-1 text-zinc-400 text-[9px] mb-1">
            <Gauge className="w-3 h-3 text-amber-400" />
            <span>BARO PRESSURE</span>
          </div>
          <span className="text-base font-bold text-amber-300">{telemetry.barometricPressureKpa} kPa</span>
          <span className="text-[8px] text-zinc-500 block">53.5% of Sea Level</span>
        </div>

        <div className="bg-zinc-950/70 p-2 rounded border border-zinc-800">
          <div className="flex items-center space-x-1 text-zinc-400 text-[9px] mb-1">
            <Wind className="w-3 h-3 text-emerald-400" />
            <span>WIND & GUST</span>
          </div>
          <span className="text-base font-bold text-emerald-300">{telemetry.windSpeedKmh} km/h</span>
          <span className="text-[8px] text-zinc-500 block">315° NW Mountain Gust</span>
        </div>
      </div>

      {/* Real-time Density Altitude Calculation Engine */}
      <div className="bg-gradient-to-br from-cyan-950/30 to-zinc-950/70 p-2.5 rounded border border-cyan-800/40">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center space-x-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px] font-bold text-cyan-200">AIR DENSITY CALCULATION ENGINE</span>
          </div>
          <span className="text-[9px] text-cyan-400 font-bold">ρ = P / (R · T)</span>
        </div>

        <div className="flex items-baseline justify-between mb-2">
          <div>
            <span className="text-xl font-bold text-white">{telemetry.airDensityKgM3}</span>
            <span className="text-xs text-zinc-400 ml-1">kg/m³</span>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-red-400">-37.9% THINNER</span>
            <span className="text-[9px] text-zinc-400 block">(vs Sea-Level 1.225 kg/m³)</span>
          </div>
        </div>

        {/* Impact breakdown on hostile drone */}
        <div className="space-y-1.5 pt-1 border-t border-cyan-900/50 text-[10px]">
          <div className="flex justify-between items-center">
            <span className="text-zinc-300">Hostile Rotor Lift Deficit:</span>
            <span className="text-amber-400 font-bold">+{telemetry.rotorLiftDeficitPct}% RPM Required</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-300">Hostile Battery Throttle Drain:</span>
            <span className="text-red-400 font-bold">{telemetry.throttleCurrentMultiplier}x Nominal Current</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-300">Blade Stall Margin:</span>
            <span className="text-amber-400 font-bold">{telemetry.aerodynamicStallRisk} RISK</span>
          </div>
        </div>
      </div>
    </div>
  );
};
