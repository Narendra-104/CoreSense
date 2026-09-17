'use client';

import React from 'react';
import { AtmosphericTelemetry } from '@/types/dashboard';
import { Heart, Activity, AlertTriangle, ShieldCheck, RefreshCw, Zap } from 'lucide-react';
import { calculateAirDensityMetrics } from '@/utils/physicsEngine';

interface AirDensityEngineCardProps {
  telemetry: AtmosphericTelemetry;
}

export const AirDensityEngineCard: React.FC<AirDensityEngineCardProps> = ({ telemetry }) => {
  // Real-time calculation using exact Ideal Gas Law parameters
  const densityMetrics = calculateAirDensityMetrics({
    ambientTempC: telemetry.ambientTempC,
    barometricPressureKpa: telemetry.barometricPressureKpa,
  });

  // Percentage of sea-level density 1.225 kg/m3
  const densityPct = Math.min(100, Math.max(0, Math.round((densityMetrics.airDensityKgM3 / 1.225) * 100)));
  const isSafe = densityMetrics.bladeStallMarginRisk === 'LOW';

  return (
    <div className="bg-[#111317] border border-[#232730] rounded-2xl p-3.5 text-white font-mono flex flex-col justify-between h-full shadow-lg">
      {/* Top Header: Model, Formula & Health Badge */}
      <div className="flex items-center justify-between pb-2 border-b border-[#232730]">
        <div>
          <div className="text-xs font-bold text-amber-400 tracking-wider">
            AERO-DENSITY-26050
          </div>
          <div className="text-[9px] text-slate-400 tracking-tight">
            IDEAL GAS • ρ = P / (R·T)
          </div>
        </div>

        {/* Pulse Heart Rate Health Badge */}
        <div className="flex flex-col items-end">
          <div className="flex items-center space-x-1">
            <div className="w-5 h-5 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center">
              <Heart className="w-3 h-3 text-amber-400 fill-amber-400 animate-pulse" />
            </div>
            <span className="text-[10px] font-bold text-amber-400">
              {isSafe ? 'Perfect' : 'Caution'}
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
            strokeDashoffset={100 - densityPct}
            className="transition-all duration-500 ease-out"
          />

          {/* Central Texts */}
          <text x="90" y="52" fill="#94a3b8" fontSize="10" fontWeight="600" textAnchor="middle" letterSpacing="1">
            AIR DENSITY (ρ)
          </text>
          <text x="90" y="82" fill="#ffffff" fontSize="26" fontWeight="800" textAnchor="middle">
            {densityMetrics.airDensityKgM3}<tspan fontSize="13" fill="#eab308"> kg/m³</tspan>
          </text>
        </svg>

        {/* Sub-Arc Status & Summary */}
        <div className="w-full flex justify-between px-2 -mt-2">
          <div>
            <span className="text-amber-400 font-bold text-xs block">
              -{densityMetrics.densityDropPct}%
            </span>
            <span className="text-[9px] text-slate-400 block">Drop vs Sea Level</span>
          </div>
          <div className="text-right">
            <span className="text-amber-400 font-bold text-xs block">
              +{densityMetrics.rotorLiftDeficitPct}%
            </span>
            <span className="text-[9px] text-slate-400 block">Rotor Deficit RPM</span>
          </div>
        </div>
      </div>

      {/* Metric Tiles Grid */}
      <div className="space-y-1.5 mt-1">
        {/* Row 1: Lift Deficit | Throttle Mult | Gas Const (3 cols) */}
        <div className="grid grid-cols-3 gap-1.5 text-left">
          {/* Lift Deficit */}
          <div className="bg-[#181a20] border border-[#262934] rounded-xl p-2 relative">
            <span className="text-[9px] text-slate-400 block">Lift Deficit</span>
            <span className="text-xs font-bold text-amber-400 block mt-0.5">
              +{densityMetrics.rotorLiftDeficitPct}%
            </span>
            <div className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 rounded-full border border-amber-400/40 text-amber-400 text-[8px] flex items-center justify-center font-bold">
              %
            </div>
          </div>

          {/* Throttle Multiplier */}
          <div className="bg-[#181a20] border border-[#262934] rounded-xl p-2 relative">
            <span className="text-[9px] text-slate-400 block">Throttle</span>
            <span className="text-xs font-bold text-amber-400 block mt-0.5">
              {densityMetrics.throttleCurrentMultiplier}x
            </span>
            <div className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 rounded-full border border-amber-400/40 text-amber-400 text-[8px] flex items-center justify-center font-bold">
              ×
            </div>
          </div>

          {/* Gas Constant R */}
          <div className="bg-[#181a20] border border-[#262934] rounded-xl p-2 relative">
            <span className="text-[9px] text-slate-400 block">Gas Const</span>
            <span className="text-xs font-bold text-amber-400 block mt-0.5">
              287.1
            </span>
            <div className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 rounded-full border border-amber-400/40 text-amber-400 text-[8px] flex items-center justify-center font-bold">
              R
            </div>
          </div>
        </div>

        {/* Row 2: Blade Stall Margin | Motor Surge (2 cols) */}
        <div className="grid grid-cols-2 gap-1.5 text-left">
          <div className="bg-[#181a20] border border-[#262934] rounded-xl p-2 relative">
            <span className="text-[9px] text-slate-400 block">Blade Stall Margin</span>
            <span className="text-xs font-bold text-amber-400 block mt-0.5">
              3.2° Margin
            </span>
            <AlertTriangle className="absolute bottom-2 right-2 w-3.5 h-3.5 text-amber-400/50" />
          </div>

          <div className="bg-[#181a20] border border-[#262934] rounded-xl p-2 relative">
            <span className="text-[9px] text-slate-400 block">Motor Current Draw</span>
            <span className="text-xs font-bold text-amber-400 block mt-0.5">
              +{Math.round((densityMetrics.throttleCurrentMultiplier - 1) * 160)}% Surge
            </span>
            <Zap className="absolute bottom-2 right-2 w-3.5 h-3.5 text-amber-400/50" />
          </div>
        </div>

        {/* Row 3: Stall Limiter | RPM Compensation (2 cols) */}
        <div className="grid grid-cols-2 gap-1.5 text-left">
          <div className="bg-[#181a20] border border-[#262934] rounded-xl p-2 relative flex items-center justify-between">
            <div>
              <span className="text-[9px] text-slate-400 block">Stall Limiter</span>
              <div className="flex items-center space-x-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                <span className="text-xs font-bold text-amber-400">ARMED</span>
              </div>
            </div>
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400/50" />
          </div>

          <div className="bg-[#181a20] border border-[#262934] rounded-xl p-2 relative flex items-center justify-between">
            <div>
              <span className="text-[9px] text-slate-400 block">RPM Compensation</span>
              <div className="flex items-center space-x-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                <span className="text-xs font-bold text-amber-400">ACTIVE</span>
              </div>
            </div>
            <RefreshCw className="w-3.5 h-3.5 text-amber-400/50" />
          </div>
        </div>

        {/* Row 4: Stall Risk Level (full width) */}
        <div className="bg-[#181a20] border border-[#262934] rounded-xl px-2.5 py-1.5 flex items-center justify-between text-[10px]">
          <div className="flex items-center space-x-1.5">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-300">Stall Margin:</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[9px] text-amber-400 font-bold bg-amber-950/60 border border-amber-800/40 px-1.5 py-0.5 rounded">
              {densityMetrics.bladeStallMarginRisk} RISK
            </span>
            <span className="text-[9px] text-slate-400 truncate max-w-[120px]">
              {densityMetrics.stallMarginWarning}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
