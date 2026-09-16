'use client';

import React from 'react';
import { AtmosphericTelemetry } from '@/types/dashboard';
import { Activity, ArrowDownRight, AlertTriangle } from 'lucide-react';

interface AirDensityEngineCardProps {
  telemetry: AtmosphericTelemetry;
}

export const AirDensityEngineCard: React.FC<AirDensityEngineCardProps> = ({ telemetry }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm flex flex-col justify-between h-full font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-sky-600" />
          <span className="text-xs font-bold text-slate-900 tracking-wide">
            AIR DENSITY ENGINE
          </span>
        </div>
        <span className="text-[10px] text-sky-700 font-bold bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full">
          ρ = P / (R · T)
        </span>
      </div>

      {/* Density Readout */}
      <div className="bg-sky-50/70 p-3 rounded-lg border border-sky-200 my-2">
        <div className="flex items-baseline justify-between mb-2">
          <div>
            <span className="text-2xl font-bold text-slate-900">{telemetry.airDensityKgM3}</span>
            <span className="text-xs text-slate-500 ml-1">kg/m³</span>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-rose-600 flex items-center justify-end">
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" /> -37.9%
            </span>
            <span className="text-[9px] text-slate-500 block">(vs Sea-Level 1.225)</span>
          </div>
        </div>

        {/* Degradation Impact */}
        <div className="space-y-1.5 pt-2 border-t border-sky-200/80 text-[11px]">
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Rotor Lift Deficit:</span>
            <span className="text-amber-800 font-bold">+{telemetry.rotorLiftDeficitPct}% RPM</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Throttle Current Multiplier:</span>
            <span className="text-rose-700 font-bold">{telemetry.throttleCurrentMultiplier}x</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600 flex items-center space-x-1">
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              <span>Blade Stall Margin:</span>
            </span>
            <span className="text-amber-700 font-bold text-[10px] bg-amber-100/80 px-1.5 py-0.5 rounded">
              {telemetry.aerodynamicStallRisk} RISK
            </span>
          </div>
        </div>
      </div>

      <div className="text-[10px] text-slate-500 bg-slate-50 px-2 py-1.5 rounded border border-slate-200 text-center">
        High Altitude Lift Deficit Engine Active
      </div>
    </div>
  );
};
