'use client';

import React from 'react';
import { PidThermalTelemetry } from '@/types/dashboard';
import { Heart, Flame, Cpu, Radio, Camera, ShieldCheck, Sparkles } from 'lucide-react';

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
    <div className="bg-white border border-slate-200 rounded-2xl p-3.5 text-slate-900 font-mono flex flex-col justify-between h-full shadow-sm">
      {/* Top Header: Title, Bus ID & Health Badge */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
        <div>
          <div className="text-xs font-bold text-slate-900 tracking-wide flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>PID Thermal Management</span>
          </div>
          <div className="text-[9px] text-slate-500 tracking-tight mt-0.5">
            CLOSED-LOOP PWM • Kp: 4.2 / Ki: 0.15
          </div>
        </div>

        {/* Pulse Heart Rate Health Badge */}
        <div className="flex flex-col items-end">
          <div className="flex items-center space-x-1.5 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <Heart className="w-3 h-3 text-emerald-600 fill-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-800">
              PID Active
            </span>
          </div>
        </div>
      </div>

      {/* PID Status Readout Tiles */}
      <div className="grid grid-cols-3 gap-1.5 my-2">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-left relative">
          <span className="text-slate-500 text-[9px] block">Enclosure</span>
          <span className="text-xs font-bold text-amber-800 block mt-0.5">
            {telemetry.enclosureTempC}°C
          </span>
          <span className="text-[8px] text-slate-500 block">Set: {telemetry.setpointTempC}°C</span>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-left relative">
          <span className="text-slate-500 text-[9px] block">Error e(t)</span>
          <span className="text-xs font-bold text-sky-700 block mt-0.5">
            +{telemetry.errorTempC}°C
          </span>
          <span className="text-[8px] text-slate-500 block">Kd: 1.8</span>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-left relative">
          <span className="text-slate-500 text-[9px] block">PWM Duty</span>
          <span className="text-xs font-bold text-amber-700 block mt-0.5">
            {telemetry.pwmDutyCyclePct}%
          </span>
          <div className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 rounded-full border border-slate-300 text-slate-600 bg-white text-[8px] flex items-center justify-center font-bold">
            %
          </div>
        </div>
      </div>

      {/* PWM Duty Cycle Live Bar */}
      <div className="space-y-1 my-1">
        <div className="flex justify-between text-[10px]">
          <span className="text-slate-500 font-medium">Heater PWM Load:</span>
          <span className="text-amber-800 font-bold">{telemetry.pwmDutyCyclePct}% PWM</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300"
            style={{ width: `${telemetry.pwmDutyCyclePct}%` }}
          />
        </div>
      </div>

      {/* Multi-Zone Thermal Heatmap & Status */}
      <div className="space-y-1 my-1">
        <span className="text-slate-600 text-[9px] tracking-wider block font-bold">
          MULTI-ZONE TEMPERATURES
        </span>

        <div className="grid grid-cols-1 gap-1 text-[11px]">
          {/* Jetson Core */}
          <div className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
            <div className="flex items-center space-x-2">
              <Cpu className="w-3.5 h-3.5 text-sky-600" />
              <span className="text-slate-700 text-[10px]">{zones.jetsonSbcCore.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-emerald-700 font-bold text-xs">+{zones.jetsonSbcCore.currentTempC}°C</span>
              <span className="text-[8px] text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded font-bold border border-emerald-200">NOMINAL</span>
            </div>
          </div>

          {/* USRP B210 SDR RF Front-End */}
          <div className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
            <div className="flex items-center space-x-2">
              <Radio className="w-3.5 h-3.5 text-sky-600" />
              <span className="text-slate-700 text-[10px]">{zones.usrpB210Sdr.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-amber-700 font-bold text-xs">+{zones.usrpB210Sdr.currentTempC}°C</span>
              <span className="text-[8px] text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded font-bold border border-amber-200">{zones.usrpB210Sdr.heaterDutyPct}% PWM</span>
            </div>
          </div>

          {/* XBOOM A30TR1575 Gimbal Bearings */}
          <div className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
            <div className="flex items-center space-x-2">
              <Camera className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-slate-700 text-[10px]">{zones.xboomGimbalBearings.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-amber-700 font-bold text-xs">+{zones.xboomGimbalBearings.currentTempC}°C</span>
              <span className="text-[8px] text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded font-bold border border-amber-200">{zones.xboomGimbalBearings.heaterDutyPct}% HEAT</span>
            </div>
          </div>

          {/* XBOOM Germanium IR Dome */}
          <div className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span className="text-slate-700 text-[10px]">{zones.xboomGermaniumDome.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-purple-700 font-bold text-xs">+{zones.xboomGermaniumDome.currentTempC}°C</span>
              <span className="text-[8px] text-purple-800 bg-purple-100 px-1.5 py-0.5 rounded font-bold border border-purple-200">ANTI-ICE</span>
            </div>
          </div>

          {/* AGT3DRD5000X Radome */}
          <div className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-slate-700 text-[10px]">{zones.agt3dRadarRadome.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-emerald-700 font-bold text-xs">+{zones.agt3dRadarRadome.currentTempC}°C</span>
              <span className="text-[8px] text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded font-bold border border-emerald-200">{zones.agt3dRadarRadome.heaterDutyPct}% HEAT</span>
            </div>
          </div>
        </div>
      </div>

      {/* Auto-Defrost Pulse Trigger */}
      <button
        onClick={onTriggerDefrost}
        disabled={telemetry.autoDefrostRunning}
        className={`w-full py-2 px-3 rounded-xl text-[11px] font-bold border flex items-center justify-center space-x-2 transition mt-1.5 ${
          telemetry.autoDefrostRunning
            ? 'bg-amber-100 border-amber-300 text-amber-900 animate-pulse'
            : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
        }`}
      >
        <Flame className="w-4 h-4 text-amber-600" />
        <span>
          {telemetry.autoDefrostRunning ? 'RAPID DEFROST CYCLE RUNNING (100% PWM)' : 'TRIGGER AUTO-DEFROST CYCLE'}
        </span>
      </button>
    </div>
  );
};
