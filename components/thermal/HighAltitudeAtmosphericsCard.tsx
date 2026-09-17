'use client';

import React from 'react';
import { AtmosphericTelemetry } from '@/types/dashboard';
import { Wind, Gauge, ThermometerSnowflake, Compass, Navigation } from 'lucide-react';
import { calculateAtmospherics, getRiskColorClass } from '@/utils/physicsEngine';

interface HighAltitudeAtmosphericsCardProps {
  telemetry: AtmosphericTelemetry;
}

export const HighAltitudeAtmosphericsCard: React.FC<HighAltitudeAtmosphericsCardProps> = ({ telemetry }) => {
  // Dynamically calculate atmospherics using the physics engine
  const atmoCalculated = calculateAtmospherics({
    ambientTempC: telemetry.ambientTempC,
    barometricPressureKpa: telemetry.barometricPressureKpa,
    windSpeedKmh: telemetry.windSpeedKmh,
    windDirectionDeg: telemetry.windDirectionDeg,
    altitudeMsl: telemetry.altitudeMsl ?? 4850,
    referenceHeadingDeg: 42, // Sentry boresight azimuth
  });

  const riskColors = getRiskColorClass(atmoCalculated.riskLevel);

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
        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${riskColors.badge}`}>
          4,850m MSL • {atmoCalculated.riskLevel}
        </span>
      </div>

      {/* Primary Measured Sensors */}
      <div className="grid grid-cols-2 gap-2 my-2 text-[11px]">
        {/* Ambient Temperature & ISA Offset */}
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-[10px] mb-1">
            <span className="font-medium flex items-center gap-1">
              <ThermometerSnowflake className="w-3.5 h-3.5 text-sky-600" /> AMBIENT (T)
            </span>
          </div>
          <span className="text-base font-bold text-slate-900">{telemetry.ambientTempC}°C</span>
          <div className="text-[9px] text-sky-700 font-semibold mt-0.5">
            ISA Offset: {atmoCalculated.isaTempOffsetC > 0 ? `+${atmoCalculated.isaTempOffsetC}` : atmoCalculated.isaTempOffsetC}°C
          </div>
        </div>

        {/* Barometric Pressure & ISA Delta */}
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-[10px] mb-1">
            <span className="font-medium flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-amber-600" /> PRESSURE (P)
            </span>
          </div>
          <span className="text-base font-bold text-slate-900">{telemetry.barometricPressureKpa} kPa</span>
          <div className="text-[9px] text-amber-700 font-semibold mt-0.5">
            ISA Offset: {atmoCalculated.isaPressureOffsetKpa > 0 ? `+${atmoCalculated.isaPressureOffsetKpa}` : atmoCalculated.isaPressureOffsetKpa} kPa
          </div>
        </div>
      </div>

      {/* Wind Vector Breakdown (Headwind / Crosswind) */}
      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1.5 my-1 text-[11px]">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-700 flex items-center gap-1">
            <Wind className="w-3.5 h-3.5 text-emerald-600" /> WIND VECTOR DECOMPOSITION
          </span>
          <span className="text-[9px] text-slate-500 font-semibold flex items-center gap-0.5">
            <Compass className="w-3 h-3 text-slate-400" /> {telemetry.windDirectionDeg}° @ {telemetry.windSpeedKmh} km/h
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-200/80">
          <div className="bg-white p-1.5 rounded border border-slate-200 text-center">
            <span className="text-[8px] text-slate-400 block font-medium">HEADWIND COMPONENT</span>
            <span className={`text-xs font-bold ${atmoCalculated.headwindKmh >= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
              {atmoCalculated.headwindKmh >= 0 ? `+${atmoCalculated.headwindKmh}` : atmoCalculated.headwindKmh} km/h
            </span>
            <span className="text-[8px] text-slate-500 block">
              {atmoCalculated.headwindKmh >= 0 ? 'Headwind' : 'Tailwind'}
            </span>
          </div>

          <div className="bg-white p-1.5 rounded border border-slate-200 text-center">
            <span className="text-[8px] text-slate-400 block font-medium">CROSSWIND COMPONENT</span>
            <span className={`text-xs font-bold ${Math.abs(atmoCalculated.crosswindKmh) > 30 ? 'text-rose-700' : 'text-slate-800'}`}>
              {Math.abs(atmoCalculated.crosswindKmh)} km/h
            </span>
            <span className="text-[8px] text-slate-500 block">
              {atmoCalculated.crosswindKmh >= 0 ? 'From Right (042°)' : 'From Left (042°)'}
            </span>
          </div>
        </div>
      </div>

      {/* Calculated Air Density Summary Footer */}
      <div className="text-[10px] text-slate-600 bg-sky-50/70 px-2.5 py-1.5 rounded-lg border border-sky-200 flex items-center justify-between">
        <span className="flex items-center gap-1 font-medium">
          <Navigation className="w-3 h-3 text-sky-600" /> Air Density (ρ):
        </span>
        <span className="font-bold text-sky-900">
          {atmoCalculated.airDensityKgM3} kg/m³ ({atmoCalculated.densityDropPct}% drop vs Sea Level)
        </span>
      </div>
    </div>
  );
};
