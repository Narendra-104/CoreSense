'use client';

import React from 'react';
import { UsrpUnit } from '@/types/dashboard';
import { Radio, Cpu, CheckCircle2 } from 'lucide-react';

interface UsrpB210PanelProps {
  units: UsrpUnit[];
}

export const UsrpB210Panel: React.FC<UsrpB210PanelProps> = ({ units }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm flex flex-col space-y-2.5 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center space-x-2">
          <Radio className="w-4 h-4 text-sky-600" />
          <span className="text-xs font-bold text-slate-900 tracking-wide">
            NI ETTUS USRP B210 — SDR DETECTOR ARRAY
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
            2×2 MIMO • 70MHz–6GHz
          </span>
        </div>
      </div>

      {/* Grid of 3 USRP B210 Units */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {units.map((unit) => {
          return (
            <div
              key={unit.unitId}
              className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex flex-col justify-between space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <Cpu className="w-3.5 h-3.5 text-sky-600" />
                  <span className="text-[11px] font-bold text-slate-800">
                    B210 UNIT #{unit.unitId}
                  </span>
                </div>
                <span className="text-[9px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-bold flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>ONLINE</span>
                </span>
              </div>

              <div className="space-y-1 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Center Freq:</span>
                  <span className="font-bold text-slate-800">{unit.centerFreqGhz.toFixed(3)} GHz</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">RF Gain:</span>
                  <span className="text-sky-700 font-bold">{unit.gainDb} dB (Max 76)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">MIMO RX1/RX2:</span>
                  <span className="font-mono text-slate-700 font-semibold">
                    {unit.channelA_Dbm} / {unit.channelB_Dbm} dBm
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">AoA Bearing:</span>
                  <span className="text-amber-700 font-bold">{unit.aoaBearingDeg.toFixed(1)}°</span>
                </div>
              </div>

              <div className="pt-1 border-t border-slate-200/80 flex items-center justify-between text-[9px] text-slate-500">
                <span>TDOA: {unit.tdoaTimeDiffNs.toFixed(1)}ns</span>
                <span className="text-emerald-700 font-semibold flex items-center space-x-0.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>ARRAY CAL</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
