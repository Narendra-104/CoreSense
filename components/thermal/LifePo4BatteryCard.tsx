'use client';

import React from 'react';
import { LifePo4Telemetry } from '@/types/dashboard';
import { BatteryCharging, Zap, Sun } from 'lucide-react';

interface LifePo4BatteryCardProps {
  telemetry: LifePo4Telemetry;
}

export const LifePo4BatteryCard: React.FC<LifePo4BatteryCardProps> = ({ telemetry }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm flex flex-col space-y-3 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center space-x-2">
          <BatteryCharging className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-bold text-slate-900 tracking-wide">
            LiFePO4 COLD-DISCHARGE POWER
          </span>
        </div>
        <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
          48V 100Ah PACK
        </span>
      </div>

      {/* Main Battery Metrics */}
      <div className="grid grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px]">
        <div>
          <span className="text-slate-500 text-[9px] block font-medium">VOLTAGE</span>
          <span className="text-slate-900 font-bold">{telemetry.packVoltage} V</span>
        </div>
        <div>
          <span className="text-slate-500 text-[9px] block font-medium">CURRENT</span>
          <span className="text-amber-700 font-bold">{telemetry.packCurrentA} A</span>
        </div>
        <div>
          <span className="text-slate-500 text-[9px] block font-medium">SOC %</span>
          <span className="text-emerald-700 font-bold">{telemetry.stateOfChargePct}%</span>
        </div>
        <div>
          <span className="text-slate-500 text-[9px] block font-medium">CORE TEMP</span>
          <span className="text-sky-700 font-bold">+{telemetry.internalCoreTempC}°C</span>
        </div>
      </div>

      {/* Cold Discharge Capacity Buffer Visualizer */}
      <div className="bg-emerald-50/60 p-3 rounded-lg border border-emerald-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-emerald-900">COLD DISCHARGE CAPACITY BUFFER</span>
          <span className="text-[10px] text-slate-500">@ -24.8°C Cold Soak</span>
        </div>

        {/* Comparison Bars */}
        <div className="space-y-2 text-[10px]">
          {/* Pre-heated Core Capacity */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-800 font-semibold flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                <span>Pre-Heated Pack Reserve (Thermal Jacket):</span>
              </span>
              <span className="text-emerald-700 font-bold">{telemetry.preheatedCapacityAh} Ah (94.2%)</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600"
                style={{ width: `${(telemetry.preheatedCapacityAh / 100) * 100}%` }}
              />
            </div>
          </div>

          {/* Unheated Raw Capacity Drop */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-600 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                <span>Raw Unheated Cold-Soak Drop:</span>
              </span>
              <span className="text-rose-700 font-bold">{telemetry.coldSoakRawCapacityAh} Ah (42.0%)</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-500"
                style={{ width: `${(telemetry.coldSoakRawCapacityAh / 100) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <p className="text-[9px] text-slate-600 mt-2.5 leading-tight">
          ★ Internal cell heating pads preserve +52.2 Ah of usable capacity that would otherwise freeze out at -25°C.
        </p>
      </div>

      {/* Secondary Power Inputs */}
      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200">
          <div className="flex items-center space-x-2">
            <Sun className="w-4 h-4 text-amber-600" />
            <span className="text-slate-700 font-medium">Solar MPPT</span>
          </div>
          <span className="text-amber-800 font-bold">{telemetry.solarMpptWatts} W</span>
        </div>

        <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-sky-600" />
            <span className="text-slate-700 font-medium">Fuel Cell</span>
          </div>
          <span className="text-emerald-700 font-bold">STANDBY OK</span>
        </div>
      </div>
    </div>
  );
};
