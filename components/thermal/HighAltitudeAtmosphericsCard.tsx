'use client';

import React from 'react';
import { AtmosphericTelemetry } from '@/types/dashboard';
import { Wind, Gauge, ThermometerSnowflake } from 'lucide-react';

interface HighAltitudeAtmosphericsCardProps {
  telemetry: AtmosphericTelemetry;
}

export const HighAltitudeAtmosphericsCard: React.FC<HighAltitudeAtmosphericsCardProps> = ({ telemetry }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm flex flex-col justify-between h-full font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center space-x-2">
          <ThermometerSnowflake className="w-4 h-4 text-sky-600" />
          <span className="text-xs font-bold text-slate-900 tracking-wide">
            HIGH-ALTITUDE ATMOSPHERICS
          </span>
        </div>
        <span className="text-[10px] text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full font-semibold">
          4,850m MSL
        </span>
      </div>

      {/* Atmospheric Primary Stats */}
      <div className="grid grid-cols-1 gap-2 my-2">
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-slate-500 text-[10px]">
            <ThermometerSnowflake className="w-4 h-4 text-sky-600" />
            <span className="font-medium">AMBIENT TEMP</span>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-slate-900">{telemetry.ambientTempC}°C</span>
            <span className="text-[9px] text-slate-400 block">Sub-zero Alpine</span>
          </div>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-slate-500 text-[10px]">
            <Gauge className="w-4 h-4 text-amber-600" />
            <span className="font-medium">BARO PRESSURE</span>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-slate-900">{telemetry.barometricPressureKpa} kPa</span>
            <span className="text-[9px] text-slate-400 block">53.5% Sea Level</span>
          </div>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-slate-500 text-[10px]">
            <Wind className="w-4 h-4 text-emerald-600" />
            <span className="font-medium">WIND VECTOR</span>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-slate-900">{telemetry.windSpeedKmh} km/h</span>
            <span className="text-[9px] text-slate-400 block">315° NW Gust</span>
          </div>
        </div>
      </div>

      <div className="text-[10px] text-slate-500 bg-slate-50 px-2 py-1.5 rounded border border-slate-200 text-center">
        Sensors: Ultrasonic Anemometer + PT100 RTD
      </div>
    </div>
  );
};
