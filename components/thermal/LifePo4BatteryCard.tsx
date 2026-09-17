'use client';

import React from 'react';
import { LifePo4Telemetry } from '@/types/dashboard';
import { BatteryCharging, Zap, ShieldCheck, AlertCircle, ThermometerSnowflake } from 'lucide-react';
import { calculateLiFePo4Power, getRiskColorClass } from '@/utils/physicsEngine';

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

  const riskColors = getRiskColorClass(powerMetrics.riskLevel);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm flex flex-col justify-between h-full font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center space-x-2">
          <BatteryCharging className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-bold text-slate-900 tracking-wide">
            LiFePO4 COLD-DISCHARGE POWER
          </span>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${riskColors.badge}`}>
          16S 100Ah • {powerMetrics.riskLevel}
        </span>
      </div>

      {/* Main Electrical & Thermal Telemetry Grid */}
      <div className="grid grid-cols-4 gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-200 text-center my-1.5">
        <div className="bg-white p-1.5 rounded border border-slate-200">
          <span className="text-slate-400 text-[8px] block font-medium">VOLTAGE (V)</span>
          <span className="text-xs font-bold text-slate-900">{telemetry.packVoltage.toFixed(1)} V</span>
          <span className="text-[8px] text-slate-500 block">16S Pack</span>
        </div>
        <div className="bg-white p-1.5 rounded border border-slate-200">
          <span className="text-slate-400 text-[8px] block font-medium">CURRENT (A)</span>
          <span className="text-xs font-bold text-amber-700">{telemetry.packCurrentA.toFixed(1)} A</span>
          <span className="text-[8px] text-slate-500 block">{powerMetrics.cRate} C</span>
        </div>
        <div className="bg-white p-1.5 rounded border border-slate-200">
          <span className="text-slate-400 text-[8px] block font-medium">SOC (%)</span>
          <span className="text-xs font-bold text-emerald-700">{powerMetrics.stateOfChargePct}%</span>
          <span className="text-[8px] text-slate-500 block">OCV / IR</span>
        </div>
        <div className="bg-white p-1.5 rounded border border-slate-200">
          <span className="text-slate-400 text-[8px] block font-medium">CORE TEMP</span>
          <span className={`text-xs font-bold ${telemetry.internalCoreTempC >= 15 ? 'text-emerald-700' : 'text-sky-700'}`}>
            +{telemetry.internalCoreTempC.toFixed(1)}°C
          </span>
          <span className="text-[8px] text-slate-500 block">Heated</span>
        </div>
      </div>

      {/* Cold Discharge Capacity Buffer: Pre-Heated vs Cold Soak Drop */}
      <div className="bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-200 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-emerald-950 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> USABLE CAPACITY RETENTION
          </span>
          <span className="text-[9px] text-slate-500 font-medium">
            Ambient Soak: {telemetry.ambientSoakTempC}°C
          </span>
        </div>

        {/* Bar 1: Pre-Heated Active Thermal Jacket */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px]">
            <span className="text-slate-700 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
              <span>With Thermal Jacket (+18°C Pre-Heated):</span>
            </span>
            <span className="text-emerald-700 font-bold">
              {powerMetrics.usableAhReservePreheated} Ah Reserve
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 transition-all duration-300"
              style={{ width: `${(powerMetrics.usableAhReservePreheated / 100) * 100}%` }}
            />
          </div>
        </div>

        {/* Bar 2: Unheated Raw Cold-Soak Drop */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px]">
            <span className="text-slate-500 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
              <span>Raw Unheated Cold-Soak (-25°C Soak Drop):</span>
            </span>
            <span className="text-rose-700 font-bold">
              {powerMetrics.usableAhReserveColdSoak} Ah (-{powerMetrics.capacityLossRawPct}%)
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-500 transition-all duration-300"
              style={{ width: `${(powerMetrics.usableAhReserveColdSoak / 100) * 100}%` }}
            />
          </div>
        </div>

        {/* Thermal Buffer Advantage */}
        <div className="pt-1.5 border-t border-emerald-200/80 flex items-center justify-between text-[10px]">
          <span className="text-emerald-800 font-medium">
            Active Heating Gain:
          </span>
          <span className="font-bold text-emerald-900 bg-emerald-100/80 px-2 py-0.5 rounded">
            +{powerMetrics.capacityBufferGainAh} Ah (+124% Runtime Buffer)
          </span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-[9px] text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200 flex justify-between items-center mt-1.5">
        <span>Load: {powerMetrics.powerWatts} W</span>
        <span className="text-emerald-700 font-medium">
          Thermal Jacket: {telemetry.internalHeatingPadsActive ? 'ACTIVE (PID ON)' : 'STANDBY'}
        </span>
      </div>
    </div>
  );
};
