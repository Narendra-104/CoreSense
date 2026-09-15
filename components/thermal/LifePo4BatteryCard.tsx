'use client';

import React from 'react';
import { LifePo4Telemetry } from '@/types/dashboard';
import { BatteryCharging, Zap, Sun, Shield, Layers, Thermometer } from 'lucide-react';

interface LifePo4BatteryCardProps {
  telemetry: LifePo4Telemetry;
}

export const LifePo4BatteryCard: React.FC<LifePo4BatteryCardProps> = ({ telemetry }) => {
  return (
    <div className="bg-tactical-panel border border-tactical-panelBorder rounded-lg p-3 shadow-lg flex flex-col space-y-3 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
        <div className="flex items-center space-x-2">
          <BatteryCharging className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-emerald-400 tracking-wider">
            LiFePO4 POWER & COLD-DISCHARGE SUBSYSTEM
          </span>
        </div>
        <span className="text-[10px] text-emerald-300 bg-emerald-950/70 border border-emerald-800 px-2 py-0.5 rounded font-bold">
          48V 100Ah PACK
        </span>
      </div>

      {/* Main Battery Metrics */}
      <div className="grid grid-cols-4 gap-1.5 bg-zinc-950/70 p-2 rounded border border-zinc-800 text-[10px]">
        <div>
          <span className="text-zinc-500 text-[9px] block">VOLTAGE</span>
          <span className="text-white font-bold">{telemetry.packVoltage} V</span>
        </div>
        <div>
          <span className="text-zinc-500 text-[9px] block">CURRENT</span>
          <span className="text-amber-400 font-bold">{telemetry.packCurrentA} A</span>
        </div>
        <div>
          <span className="text-zinc-500 text-[9px] block">SOC %</span>
          <span className="text-emerald-400 font-bold">{telemetry.stateOfChargePct}%</span>
        </div>
        <div>
          <span className="text-zinc-500 text-[9px] block">CORE TEMP</span>
          <span className="text-cyan-400 font-bold">+{telemetry.internalCoreTempC}°C</span>
        </div>
      </div>

      {/* Cold Discharge Capacity Buffer Visualizer */}
      <div className="bg-gradient-to-br from-emerald-950/20 to-zinc-950/70 p-2.5 rounded border border-emerald-800/40">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-emerald-300">COLD DISCHARGE CAPACITY BUFFER</span>
          <span className="text-[9px] text-zinc-400">@ -24.8°C Cold Soak</span>
        </div>

        {/* Comparison Bars */}
        <div className="space-y-2 text-[9px]">
          {/* Pre-heated Core Capacity */}
          <div>
            <div className="flex justify-between mb-0.5">
              <span className="text-zinc-300 font-bold flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span>Pre-Heated Pack Reserve (Active Thermal Jacket):</span>
              </span>
              <span className="text-emerald-400 font-bold">{telemetry.preheatedCapacityAh} Ah (94.2%)</span>
            </div>
            <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800">
              <div
                className="h-full bg-emerald-500"
                style={{ width: `${(telemetry.preheatedCapacityAh / 100) * 100}%` }}
              />
            </div>
          </div>

          {/* Unheated Raw Capacity Drop */}
          <div>
            <div className="flex justify-between mb-0.5">
              <span className="text-zinc-400 flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-red-500/80 inline-block" />
                <span>Raw Unheated Cold-Soak Drop:</span>
              </span>
              <span className="text-red-400 font-bold">{telemetry.coldSoakRawCapacityAh} Ah (42.0%)</span>
            </div>
            <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800">
              <div
                className="h-full bg-red-500/70"
                style={{ width: `${(telemetry.coldSoakRawCapacityAh / 100) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <p className="text-[8px] text-zinc-400 mt-2 leading-tight">
          ★ Dedicated internal cell heating pads preserve +52.2 Ah of usable electrochemical capacity that would otherwise freeze out at -25°C.
        </p>
      </div>

      {/* Secondary Power Inputs (Solar MPPT & Fuel Cell) */}
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div className="flex items-center justify-between bg-zinc-900/60 p-1.5 rounded border border-zinc-800">
          <div className="flex items-center space-x-1.5">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-zinc-300">Solar MPPT</span>
          </div>
          <span className="text-amber-300 font-bold">{telemetry.solarMpptWatts} W</span>
        </div>

        <div className="flex items-center justify-between bg-zinc-900/60 p-1.5 rounded border border-zinc-800">
          <div className="flex items-center space-x-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-zinc-300">Fuel Cell</span>
          </div>
          <span className="text-emerald-400 font-bold">STANDBY OK</span>
        </div>
      </div>
    </div>
  );
};
