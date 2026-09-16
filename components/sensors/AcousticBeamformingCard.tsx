'use client';

import { Radar, Crosshair, ArrowRight } from 'lucide-react';

interface RfDirectionFindingCardProps {
  hasHostileSignal: boolean;
  confidence: number;
}

export function AcousticBeamformingCard({ hasHostileSignal, confidence }: RfDirectionFindingCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col h-full font-mono text-slate-900">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <Radar className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold tracking-wider text-slate-700">USRP B210 — RF DIRECTION FINDING</span>
        </div>
        <div className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700 tracking-widest">
          AoA/TDOA ACTIVE
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="flex-1 bg-slate-50 rounded-lg p-2.5 border border-slate-100">
          <div className="text-[10px] text-slate-400 mb-1">DF METHOD</div>
          <div className="text-xs font-medium text-slate-700">AoA + TDOA (4-ELEMENT ARRAY)</div>
        </div>
        <div className="flex-1 bg-slate-50 rounded-lg p-2.5 border border-slate-100">
          <div className="text-[10px] text-slate-400 mb-1">CORRELATION</div>
          <div className="flex items-center gap-2">
            <div className={`text-xs font-bold ${hasHostileSignal ? 'text-amber-600' : 'text-slate-400'}`}>
              DF CONF: {(confidence * 100).toFixed(0)}%
            </div>
            {hasHostileSignal && <Crosshair className="w-3 h-3 text-amber-500 animate-pulse" />}
          </div>
        </div>
      </div>

      <div className="relative bg-slate-900 rounded-lg h-32 mb-4 flex items-center justify-center overflow-hidden border border-slate-800">
        <div className="absolute top-2 left-2 text-[10px] text-slate-400 z-10">AoA BEARING</div>
        
        {/* Polar Grid */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30">
          <div className="w-24 h-24 rounded-full border border-slate-500" />
          <div className="absolute w-16 h-16 rounded-full border border-slate-600" />
          <div className="absolute w-8 h-8 rounded-full border border-slate-700" />
          <div className="absolute w-full h-px bg-slate-700" />
          <div className="absolute h-full w-px bg-slate-700" />
        </div>

        {/* Sweep / Beam Indicator */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-full h-full rounded-full border-t-2 ${hasHostileSignal ? 'border-amber-500' : 'border-emerald-500 opacity-50'} absolute animate-[spin_4s_linear_infinite]`} style={{ width: '120px', height: '120px' }}>
            <div className={`absolute top-0 left-1/2 w-0.5 h-1/2 origin-bottom ${hasHostileSignal ? 'bg-gradient-to-b from-amber-400 to-transparent' : 'bg-gradient-to-b from-emerald-400 to-transparent'}`} />
          </div>
          
          {hasHostileSignal && (
            <div className="absolute w-full h-full flex items-center justify-center" style={{ transform: 'rotate(42deg)' }}>
              <div className="w-0.5 h-16 bg-amber-500 origin-bottom absolute top-0 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
              <div className="w-2 h-2 rounded-full bg-amber-400 absolute top-0 animate-ping" />
            </div>
          )}
        </div>

        <div className={`absolute bottom-2 right-2 text-[10px] font-bold ${hasHostileSignal ? 'text-amber-400' : 'text-slate-500'}`}>
          {hasHostileSignal ? 'AoA: 042° ±2.1° (LOCKED)' : 'SWEEP 70 MHz–6 GHz'}
        </div>
      </div>

      <div className="flex-1 bg-slate-50 rounded-lg p-2.5 border border-slate-100 flex flex-col justify-between">
        <div className="text-[10px] text-slate-400 mb-2">SIGNAL CHARACTERIZATION</div>
        
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 w-24">AoA Bearing:</span>
            <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${hasHostileSignal ? 'bg-amber-500' : 'bg-slate-400'}`} style={{ width: '85%' }} />
            </div>
            <span className="text-[10px] font-medium text-slate-700 w-12 text-right">042.1°</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 w-24">TDOA Δt:</span>
            <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-slate-400" style={{ width: '65%' }} />
            </div>
            <span className="text-[10px] font-medium text-slate-700 w-12 text-right">14.2 ns</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 w-24">DF Confidence:</span>
            <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${hasHostileSignal ? 'bg-amber-500' : 'bg-slate-400'}`} style={{ width: '91%' }} />
            </div>
            <span className="text-[10px] font-medium text-slate-700 w-12 text-right">91%</span>
          </div>
        </div>

        <div className="text-[9px] text-slate-400 text-right mt-2 flex items-center justify-end gap-1 border-t border-slate-200 pt-1.5">
          <ArrowRight className="w-3 h-3" /> Baseline: 4-Element × 3m Calibrated Array
        </div>
      </div>
    </div>
  );
}
