'use client';

import React from 'react';
import { PidThermalTelemetry } from '@/types/dashboard';
import { Flame, Cpu, Radio, Camera, ShieldCheck, Sparkles } from 'lucide-react';

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
    <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm flex flex-col space-y-3 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center space-x-2">
          <Flame className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-bold text-slate-900 tracking-wide">
            PID THERMAL MANAGEMENT
          </span>
        </div>
        <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
          PID ACTIVE
        </span>
      </div>

      {/* PID Status Readout */}
      <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
        <div>
          <span className="text-slate-500 text-[10px] block font-medium">ENCLOSURE</span>
          <span className="text-base font-bold text-amber-700">{telemetry.enclosureTempC}°C</span>
          <span className="text-[9px] text-slate-500 block">Set: {telemetry.setpointTempC}°C</span>
        </div>

        <div>
          <span className="text-slate-500 text-[10px] block font-medium">ERROR e(t)</span>
          <span className="text-base font-bold text-sky-700">+{telemetry.errorTempC}°C</span>
          <span className="text-[9px] text-slate-500 block">Kp: 4.2 | Ki: 0.15</span>
        </div>

        <div>
          <span className="text-slate-500 text-[10px] block font-medium">PWM DUTY</span>
          <span className="text-base font-bold text-amber-600">{telemetry.pwmDutyCyclePct}%</span>
          <span className="text-[9px] text-slate-500 block">Kd: 1.8 (Active)</span>
        </div>
      </div>

      {/* PWM Duty Cycle Live Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px]">
          <span className="text-slate-600 font-medium">Heater PWM Load:</span>
          <span className="text-amber-700 font-bold">{telemetry.pwmDutyCyclePct}% PWM</span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
            style={{ width: `${telemetry.pwmDutyCyclePct}%` }}
          />
        </div>
      </div>

      {/* Multi-Zone Thermal Heatmap & Status */}
      <div className="space-y-1.5">
        <span className="text-slate-600 text-[10px] tracking-wider block font-bold">
          MULTI-ZONE CRITICAL TEMPERATURES
        </span>

        <div className="grid grid-cols-1 gap-1 text-[11px]">
          {/* Jetson Core */}
          <div className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <div className="flex items-center space-x-2">
              <Cpu className="w-3.5 h-3.5 text-sky-600" />
              <span className="text-slate-800">{zones.jetsonSbcCore.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-emerald-700 font-bold">+{zones.jetsonSbcCore.currentTempC}°C</span>
              <span className="text-[9px] text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded font-bold">NOMINAL</span>
            </div>
          </div>

          {/* USRP B210 SDR RF Front-End */}
          <div className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <div className="flex items-center space-x-2">
              <Radio className="w-3.5 h-3.5 text-sky-600" />
              <span className="text-slate-800">{zones.usrpB210Sdr.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sky-700 font-bold">+{zones.usrpB210Sdr.currentTempC}°C</span>
              <span className="text-[9px] text-sky-800 bg-sky-100 px-1.5 py-0.5 rounded font-bold">{zones.usrpB210Sdr.heaterDutyPct}% PWM</span>
            </div>
          </div>

          {/* XBOOM A30TR1575 Gimbal Bearings */}
          <div className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <div className="flex items-center space-x-2">
              <Camera className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-slate-800">{zones.xboomGimbalBearings.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-amber-700 font-bold">+{zones.xboomGimbalBearings.currentTempC}°C</span>
              <span className="text-[9px] text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded font-bold">{zones.xboomGimbalBearings.heaterDutyPct}% HEATING</span>
            </div>
          </div>

          {/* XBOOM Germanium IR Dome */}
          <div className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span className="text-slate-800">{zones.xboomGermaniumDome.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-purple-700 font-bold">+{zones.xboomGermaniumDome.currentTempC}°C</span>
              <span className="text-[9px] text-purple-800 bg-purple-100 px-1.5 py-0.5 rounded font-bold">ANTI-ICE</span>
            </div>
          </div>

          {/* AGT3DRD5000X Ku-Band Radome De-Icer */}
          <div className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-slate-800">{zones.agt3dRadarRadome.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-emerald-700 font-bold">+{zones.agt3dRadarRadome.currentTempC}°C</span>
              <span className="text-[9px] text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded font-bold">{zones.agt3dRadarRadome.heaterDutyPct}% HEATING</span>
            </div>
          </div>
        </div>
      </div>

      {/* Auto-Defrost Pulse Trigger */}
      <button
        onClick={onTriggerDefrost}
        disabled={telemetry.autoDefrostRunning}
        className={`w-full py-2 px-3 rounded-lg text-[11px] font-bold border flex items-center justify-center space-x-2 transition ${
          telemetry.autoDefrostRunning
            ? 'bg-amber-100 border-amber-300 text-amber-900 animate-pulse'
            : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
        }`}
      >
        <Flame className="w-4 h-4 text-amber-600" />
        <span>
          {telemetry.autoDefrostRunning ? 'AUTO-DEFROST RUNNING (100% PWM)' : 'TRIGGER RAPID AUTO-DEFROST CYCLE'}
        </span>
      </button>
    </div>
  );
};
