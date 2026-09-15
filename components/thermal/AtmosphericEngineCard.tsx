'use client';

import React from 'react';
import { AtmosphericTelemetry } from '@/types/dashboard';
import { Wind, Gauge, ThermometerSnowflake, Activity } from 'lucide-react';

interface AtmosphericEngineCardProps {
  telemetry: AtmosphericTelemetry;
}

export const AtmosphericEngineCard: React.FC<AtmosphericEngineCardProps> = ({ telemetry }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm flex flex-col space-y-3 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center space-x-2">
          <ThermometerSnowflake className="w-4 h-4 text-sky-600" />
          <span className="text-xs font-bold text-slate-900 tracking-wide">
            HIGH-ALTITUDE ATMOSPHERICS
          </span>
        </div>
        <span className="text-[10px] text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full font-semibold">
          4,850m MSL
        </span>
      </div>

      {/* Atmospheric Primary Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          <div className="flex items-center space-x-1 text-slate-500 text-[10px] mb-1">
            <ThermometerSnowflake className="w-3.5 h-3.5 text-sky-600" />
            <span className="font-medium">AMBIENT</span>
          </div>
          <span className="text-base font-bold text-slate-900">{telemetry.ambientTempC}°C</span>
          <span className="text-[9px] text-slate-500 block">Sub-zero Alpine</span>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          <div className="flex items-center space-x-1 text-slate-500 text-[10px] mb-1">
            <Gauge className="w-3.5 h-3.5 text-amber-600" />
            <span className="font-medium">PRESSURE</span>
          </div>
          <span className="text-base font-bold text-slate-900">{telemetry.barometricPressureKpa} kPa</span>
          <span className="text-[9px] text-slate-500 block">53.5% Sea Level</span>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          <div className="flex items-center space-x-1 text-slate-500 text-[10px] mb-1">
            <Wind className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-medium">WIND</span>
          </div>
          <span className="text-base font-bold text-slate-900">{telemetry.windSpeedKmh} km/h</span>
          <span className="text-[9px] text-slate-500 block">315° NW Gust</span>
        </div>
      </div>

      {/* Real-time Density Altitude Calculation Engine */}
      <div className="bg-sky-50/60 p-3 rounded-lg border border-sky-200">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center space-x-1.5">
            <Activity className="w-4 h-4 text-sky-600" />
            <span className="text-[11px] font-bold text-slate-900">AIR DENSITY ENGINE</span>
          </div>
          <span className="text-[10px] text-sky-700 font-bold">ρ = P / (R · T)</span>
        </div>

        <div className="flex items-baseline justify-between mb-2">
          <div>
            <span className="text-xl font-bold text-slate-900">{telemetry.airDensityKgM3}</span>
            <span className="text-xs text-slate-500 ml-1">kg/m³</span>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-rose-600">-37.9% THINNER</span>
            <span className="text-[9px] text-slate-500 block">(vs Sea-Level 1.225)</span>
          </div>
        </div>

        {/* Impact breakdown on hostile drone */}
        <div className="space-y-1.5 pt-1.5 border-t border-sky-200/80 text-[11px]">
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Hostile Rotor Lift Deficit:</span>
            <span className="text-amber-800 font-bold">+{telemetry.rotorLiftDeficitPct}% RPM</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Hostile Battery Throttle Drain:</span>
            <span className="text-rose-700 font-bold">{telemetry.throttleCurrentMultiplier}x Current</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Blade Stall Margin:</span>
            <span className="text-amber-700 font-bold">{telemetry.aerodynamicStallRisk} RISK</span>
          </div>
        </div>
      </div>
    </div>
  );
};
