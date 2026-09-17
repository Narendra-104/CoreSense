'use client';

import React from 'react';
import { AtmosphericTelemetry } from '@/types/dashboard';
import { Activity, ArrowDownRight, AlertTriangle, Cpu, Gauge } from 'lucide-react';
import { calculateAirDensityMetrics, getRiskColorClass } from '@/utils/physicsEngine';

interface AirDensityEngineCardProps {
  telemetry: AtmosphericTelemetry;
}

export const AirDensityEngineCard: React.FC<AirDensityEngineCardProps> = ({ telemetry }) => {
  // Real-time calculation using exact Ideal Gas Law parameters
  const densityMetrics = calculateAirDensityMetrics({
    ambientTempC: telemetry.ambientTempC,
    barometricPressureKpa: telemetry.barometricPressureKpa,
  });

  const riskColors = getRiskColorClass(densityMetrics.bladeStallMarginRisk);

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
        <span className="text-[10px] text-sky-800 font-bold bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full">
          ρ = P / (R · T)
        </span>
      </div>

      {/* Density Readout Banner */}
      <div className="bg-sky-50/70 p-3 rounded-lg border border-sky-200 my-1.5">
        <div className="flex items-baseline justify-between mb-1.5">
          <div>
            <span className="text-2xl font-bold text-slate-900">{densityMetrics.airDensityKgM3}</span>
            <span className="text-xs text-slate-500 ml-1">kg/m³</span>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-rose-600 flex items-center justify-end">
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" /> -{densityMetrics.densityDropPct}%
            </span>
            <span className="text-[9px] text-slate-500 block">(vs Sea-Level 1.225)</span>
          </div>
        </div>

        {/* Dynamic Degradation Outputs */}
        <div className="space-y-2 pt-2 border-t border-sky-200/80 text-[11px]">
          {/* Rotor Lift Deficit */}
          <div className="flex justify-between items-center bg-white p-1.5 rounded border border-sky-100">
            <span className="text-slate-600 text-[10px] font-medium">Rotor Lift Deficit RPM:</span>
            <span className="text-amber-800 font-bold text-xs">
              +{densityMetrics.rotorLiftDeficitPct}% RPM
            </span>
          </div>

          {/* Throttle Current Multiplier sqrt(1.225 / rho) */}
          <div className="flex justify-between items-center bg-white p-1.5 rounded border border-sky-100">
            <div className="text-[10px]">
              <span className="text-slate-600 font-medium block">Throttle Multiplier:</span>
              <span className="text-[8px] text-slate-400">√(1.225 / ρ)</span>
            </div>
            <span className="text-rose-700 font-bold text-xs">
              {densityMetrics.throttleCurrentMultiplier}x Current
            </span>
          </div>

          {/* Blade Stall Margin Risk Level */}
          <div className="flex justify-between items-center bg-white p-1.5 rounded border border-sky-100">
            <div className="flex items-center space-x-1 text-[10px]">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-slate-700 font-medium">Blade Stall Margin:</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${riskColors.badge}`}>
              {densityMetrics.bladeStallMarginRisk} RISK
            </span>
          </div>
        </div>
      </div>

      {/* Physics Constant and Warning Note */}
      <div className="text-[9px] text-slate-500 bg-slate-50 px-2 py-1.5 rounded border border-slate-200 flex justify-between items-center">
        <span>R = 287.058 J/(kg·K)</span>
        <span className="text-amber-700 font-semibold truncate max-w-[200px]" title={densityMetrics.stallMarginWarning}>
          {densityMetrics.stallMarginWarning}
        </span>
      </div>
    </div>
  );
};
