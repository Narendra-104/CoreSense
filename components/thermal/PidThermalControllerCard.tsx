'use client';

import React from 'react';
import { PidThermalTelemetry } from '@/types/dashboard';
import { Flame, Cpu, Radio, Camera, ShieldCheck, Sparkles, AlertTriangle } from 'lucide-react';

interface PidThermalControllerCardProps {
  telemetry: PidThermalTelemetry;
  onTriggerDefrost: () => void;
}

export const PidThermalControllerCard: React.FC<PidThermalControllerCardProps> = ({
  telemetry,
  onTriggerDefrost,
}) => {
  const { zones } = telemetry;

  return (
    <div className="bg-tactical-panel border border-tactical-panelBorder rounded-lg p-3 shadow-lg flex flex-col space-y-3 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
        <div className="flex items-center space-x-2">
          <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
          <span className="text-xs font-bold text-amber-400 tracking-wider">
            ACTIVE THERMAL MANAGEMENT (PID CLOSED-LOOP)
          </span>
        </div>
        <span className="text-[10px] text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-2 py-0.5 rounded font-bold">
          PID ACTIVE
        </span>
      </div>

      {/* PID Status & Loop Readout */}
      <div className="grid grid-cols-3 gap-2 bg-zinc-950/70 p-2 rounded border border-zinc-800">
        <div>
          <span className="text-zinc-500 text-[9px] block">ENCLOSURE TEMP</span>
          <span className="text-base font-bold text-amber-300">{telemetry.enclosureTempC}°C</span>
          <span className="text-[8px] text-zinc-400 block">Set: {telemetry.setpointTempC}°C</span>
        </div>

        <div>
          <span className="text-zinc-500 text-[9px] block">PID ERROR e(t)</span>
          <span className="text-base font-bold text-cyan-300">+{telemetry.errorTempC}°C</span>
          <span className="text-[8px] text-zinc-400 block">Kp: 4.2 | Ki: 0.15</span>
        </div>

        <div>
          <span className="text-zinc-500 text-[9px] block">PWM HEATER DUTY</span>
          <span className="text-base font-bold text-amber-400">{telemetry.pwmDutyCyclePct}%</span>
          <span className="text-[8px] text-zinc-400 block">Kd: 1.8 (Active)</span>
        </div>
      </div>

      {/* PWM Duty Cycle Live Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[9px]">
          <span className="text-zinc-400">PWM Duty Cycle Load:</span>
          <span className="text-amber-400 font-bold">{telemetry.pwmDutyCyclePct}% PWM</span>
        </div>
        <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800">
          <div
            className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 transition-all duration-300"
            style={{ width: `${telemetry.pwmDutyCyclePct}%` }}
          />
        </div>
      </div>

      {/* Multi-Zone Thermal Heatmap & Status */}
      <div className="space-y-1.5">
        <span className="text-zinc-400 text-[9px] tracking-wider block font-bold">
          MULTI-ZONE CRITICAL SUBSYSTEM TEMPERATURES
        </span>

        <div className="grid grid-cols-1 gap-1 text-[10px]">
          {/* Jetson Core */}
          <div className="flex items-center justify-between bg-zinc-900/60 px-2 py-1 rounded border border-zinc-800">
            <div className="flex items-center space-x-2">
              <Cpu className="w-3 h-3 text-cyan-400" />
              <span className="text-zinc-300">{zones.jetsonSbcCore.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-emerald-400 font-bold">+{zones.jetsonSbcCore.currentTempC}°C</span>
              <span className="text-[8px] text-emerald-500 bg-emerald-950 px-1 rounded">NOMINAL</span>
            </div>
          </div>

          {/* SDR RF Front-End */}
          <div className="flex items-center justify-between bg-zinc-900/60 px-2 py-1 rounded border border-zinc-800">
            <div className="flex items-center space-x-2">
              <Radio className="w-3 h-3 text-cyan-400" />
              <span className="text-zinc-300">{zones.rfFrontEndSdr.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-cyan-400 font-bold">+{zones.rfFrontEndSdr.currentTempC}°C</span>
              <span className="text-[8px] text-cyan-500 bg-cyan-950 px-1 rounded">35% PWM</span>
            </div>
          </div>

          {/* Gimbal Bearings */}
          <div className="flex items-center justify-between bg-zinc-900/60 px-2 py-1 rounded border border-zinc-800">
            <div className="flex items-center space-x-2">
              <Camera className="w-3 h-3 text-amber-400" />
              <span className="text-zinc-300">{zones.ptzGimbalBearings.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-amber-400 font-bold">+{zones.ptzGimbalBearings.currentTempC}°C</span>
              <span className="text-[8px] text-amber-400 bg-amber-950 px-1 rounded">78% HEATING</span>
            </div>
          </div>

          {/* Germanium Dome */}
          <div className="flex items-center justify-between bg-zinc-900/60 px-2 py-1 rounded border border-zinc-800">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span className="text-zinc-300">{zones.opticalGermaniumDome.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-purple-300 font-bold">+{zones.opticalGermaniumDome.currentTempC}°C</span>
              <span className="text-[8px] text-purple-400 bg-purple-950 px-1 rounded">ANTI-ICE</span>
            </div>
          </div>

          {/* Radome Anti-Ice */}
          <div className="flex items-center justify-between bg-zinc-900/60 px-2 py-1 rounded border border-zinc-800">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span className="text-zinc-300">{zones.rfRadomeDeIcer.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-emerald-400 font-bold">+{zones.rfRadomeDeIcer.currentTempC}°C</span>
              <span className="text-[8px] text-emerald-400 bg-emerald-950 px-1 rounded">60% HEATING</span>
            </div>
          </div>
        </div>
      </div>

      {/* Auto-Defrost Pulse Trigger */}
      <button
        onClick={onTriggerDefrost}
        disabled={telemetry.autoDefrostRunning}
        className={`w-full py-1.5 px-3 rounded text-[10px] font-bold border flex items-center justify-center space-x-2 transition ${
          telemetry.autoDefrostRunning
            ? 'bg-amber-950/80 border-amber-600 text-amber-200 animate-pulse'
            : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-amber-950/40 hover:border-amber-600 hover:text-amber-200'
        }`}
      >
        <Flame className="w-3.5 h-3.5 text-amber-500" />
        <span>
          {telemetry.autoDefrostRunning ? 'AUTO-DEFROST CYCLE RUNNING (100% PWM)' : 'TRIGGER RAPID AUTO-DEFROST CYCLE'}
        </span>
      </button>
    </div>
  );
};
