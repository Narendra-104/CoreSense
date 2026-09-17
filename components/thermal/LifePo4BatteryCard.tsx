'use client';

import React from 'react';
import { LifePo4Telemetry } from '@/types/dashboard';
import { Heart, Activity, BatteryCharging, RefreshCw, Gauge, Flame } from 'lucide-react';
import { calculateLiFePo4Power } from '@/utils/physicsEngine';

interface LifePo4BatteryCardProps {
  telemetry: LifePo4Telemetry;
}

export const LifePo4BatteryCard: React.FC<LifePo4BatteryCardProps> = ({ telemetry }) => {
  // Dynamically calculate battery metrics, SoC, and cold-discharge capacity buffers
  const powerMetrics = calculateLiFePo4Power({
    batteryVoltageV: telemetry.packVoltage,
    packCurrentA: telemetry.packCurrentA,
    coreTempC: telemetry.internalCoreTempC,
    thermalJacketActive: telemetry.internalHeatingPadsActive,
    nominalCapacityAh: 100,
    ambientTempC: telemetry.ambientSoakTempC ?? -24.8,
  });

  const soc = Math.min(100, Math.max(0, powerMetrics.stateOfChargePct));
  const isHealthy = powerMetrics.riskLevel === 'LOW' || powerMetrics.riskLevel === 'MODERATE';

  return (
    <div className="bg-[#111317] border border-[#232730] rounded-2xl p-3.5 text-white font-mono flex flex-col justify-between h-full shadow-lg">
      {/* Top Header: Device Serial, Bus ID & Health Badge */}
      <div className="flex items-center justify-between pb-2 border-b border-[#232730]">
        <div>
          <div className="text-xs font-bold text-amber-400 tracking-wider">
            DL-1260-24J0010
          </div>
          <div className="text-[9px] text-slate-400 tracking-tight">
            A5:C2:37:19:20:CC • 16S LiFePO4
          </div>
        </div>

        {/* Pulse Heart Rate Health Badge */}
        <div className="flex flex-col items-end">
          <div className="flex items-center space-x-1">
            <div className="w-5 h-5 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center">
              <Heart className="w-3 h-3 text-amber-400 fill-amber-400 animate-pulse" />
            </div>
            <span className="text-[10px] font-bold text-amber-400">
              {isHealthy ? 'Perfect' : 'Caution'}
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
            strokeDashoffset={100 - soc}
            className="transition-all duration-500 ease-out"
          />

          {/* Central Texts */}
          <text x="90" y="52" fill="#94a3b8" fontSize="10" fontWeight="600" textAnchor="middle" letterSpacing="1">
            SOC
          </text>
          <text x="90" y="82" fill="#ffffff" fontSize="28" fontWeight="800" textAnchor="middle">
            {soc}<tspan fontSize="16" fill="#eab308">%</tspan>
          </text>
        </svg>

        {/* Sub-Arc Status & Capacity Summary */}
        <div className="w-full flex justify-between px-2 -mt-2">
          <div>
            <span className="text-amber-400 font-bold text-xs block">
              {telemetry.internalHeatingPadsActive ? 'Preheated' : 'Cold-Soak'}
            </span>
            <span className="text-[9px] text-slate-400 block">Status</span>
          </div>
          <div className="text-right">
            <span className="text-amber-400 font-bold text-xs block">
              {powerMetrics.usableAhReservePreheated.toFixed(2)}AH
            </span>
            <span className="text-[9px] text-slate-400 block">Capacity Remaining</span>
          </div>
        </div>
      </div>

      {/* Metric Tiles Grid */}
      <div className="space-y-1.5 mt-1">
        {/* Row 1: Voltage | Current | Power (3 cols) */}
        <div className="grid grid-cols-3 gap-1.5 text-left">
          {/* Voltage */}
          <div className="bg-[#181a20] border border-[#262934] rounded-xl p-2 relative">
            <span className="text-[9px] text-slate-400 block">Voltage</span>
            <span className="text-xs font-bold text-amber-400 block mt-0.5">
              {telemetry.packVoltage.toFixed(2)} V
            </span>
            <div className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 rounded-full border border-amber-400/40 text-amber-400 text-[8px] flex items-center justify-center font-bold">
              V
            </div>
          </div>

          {/* Current */}
          <div className="bg-[#181a20] border border-[#262934] rounded-xl p-2 relative">
            <span className="text-[9px] text-slate-400 block">Current</span>
            <span className="text-xs font-bold text-amber-400 block mt-0.5">
              {telemetry.packCurrentA.toFixed(1)} A
            </span>
            <div className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 rounded-full border border-amber-400/40 text-amber-400 text-[8px] flex items-center justify-center font-bold">
              A
            </div>
          </div>

          {/* Power */}
          <div className="bg-[#181a20] border border-[#262934] rounded-xl p-2 relative">
            <span className="text-[9px] text-slate-400 block">Power</span>
            <span className="text-xs font-bold text-amber-400 block mt-0.5">
              {Math.round(powerMetrics.powerWatts)} W
            </span>
            <div className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 rounded-full border border-amber-400/40 text-amber-400 text-[8px] flex items-center justify-center font-bold">
              W
            </div>
          </div>
        </div>

        {/* Row 2: Cells Voltage Delta | Core Temp (2 cols) */}
        <div className="grid grid-cols-2 gap-1.5 text-left">
          <div className="bg-[#181a20] border border-[#262934] rounded-xl p-2 relative">
            <span className="text-[9px] text-slate-400 block">Cells Voltage Delta</span>
            <span className="text-xs font-bold text-amber-400 block mt-0.5">
              0.012 V
            </span>
            <Gauge className="absolute bottom-2 right-2 w-3.5 h-3.5 text-amber-400/50" />
          </div>

          <div className="bg-[#181a20] border border-[#262934] rounded-xl p-2 relative">
            <span className="text-[9px] text-slate-400 block">Core Temp (T)</span>
            <span className="text-xs font-bold text-amber-400 block mt-0.5">
              +{telemetry.internalCoreTempC.toFixed(1)}°C
            </span>
            <RefreshCw className="absolute bottom-2 right-2 w-3.5 h-3.5 text-amber-400/50" />
          </div>
        </div>

        {/* Row 3: Charge Switch | Discharge Switch (2 cols) */}
        <div className="grid grid-cols-2 gap-1.5 text-left">
          <div className="bg-[#181a20] border border-[#262934] rounded-xl p-2 relative flex items-center justify-between">
            <div>
              <span className="text-[9px] text-slate-400 block">Thermal Jacket</span>
              <div className="flex items-center space-x-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                <span className="text-xs font-bold text-amber-400">ON</span>
              </div>
            </div>
            <Flame className="w-3.5 h-3.5 text-amber-400/50" />
          </div>

          <div className="bg-[#181a20] border border-[#262934] rounded-xl p-2 relative flex items-center justify-between">
            <div>
              <span className="text-[9px] text-slate-400 block">Discharge Switch</span>
              <div className="flex items-center space-x-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                <span className="text-xs font-bold text-amber-400">ON</span>
              </div>
            </div>
            <BatteryCharging className="w-3.5 h-3.5 text-amber-400/50" />
          </div>
        </div>

        {/* Row 4: Balance Status & Active Heating Gain (full width) */}
        <div className="bg-[#181a20] border border-[#262934] rounded-xl px-2.5 py-1.5 flex items-center justify-between text-[10px]">
          <div className="flex items-center space-x-1.5">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-300">Balance Status</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[9px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.5 rounded">
              +{powerMetrics.capacityBufferGainAh} Ah Buffer
            </span>
            <span className="text-amber-400 font-bold flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
              <span>ACTIVE</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
