'use client';

import React from 'react';
import { Volume2 } from 'lucide-react';

interface AcousticBeamformingCardProps {
  hasHostileSound: boolean;
  confidence: number;
}

export const AcousticBeamformingCard: React.FC<AcousticBeamformingCardProps> = ({
  hasHostileSound,
  confidence,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm flex flex-col space-y-2.5 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center space-x-2">
          <Volume2 className="w-4 h-4 text-amber-600" />
          <span className="text-xs font-bold text-slate-900 tracking-wide">
            4-MIC ACOUSTIC ARRAY
          </span>
        </div>
        <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
          DSP ACTIVE
        </span>
      </div>

      {/* DSP & Filter Status */}
      <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px]">
        <div>
          <span className="text-slate-500 text-[9px] block font-medium">WIND-NOISE FILTER</span>
          <span className="text-emerald-700 font-bold">SPECTRAL SUBTRACTION (-22 dB)</span>
        </div>
        <div className="text-right">
          <span className="text-slate-500 text-[9px] block font-medium">CORRELATION</span>
          <span className={hasHostileSound ? 'text-amber-800 font-bold' : 'text-slate-600'}>
            {hasHostileSound ? `${confidence}% CONFIDENCE` : 'QUIET PASS'}
          </span>
        </div>
      </div>

      {/* Polar Beamforming Vector & Harmonic Spectrum */}
      <div className="grid grid-cols-2 gap-2">
        {/* Polar Vector Mini Dial */}
        <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-700 flex flex-col items-center justify-center relative">
          <span className="text-[9px] text-slate-400 absolute top-1.5 left-2 font-medium">BEAM AZIMUTH</span>
          <div className="relative w-16 h-16 rounded-full border border-slate-600 flex items-center justify-center my-1.5">
            <div className="absolute w-full h-[1px] bg-slate-700" />
            <div className="absolute h-full w-[1px] bg-slate-700" />
            <div
              className="absolute w-0.5 h-7 bg-amber-400 origin-bottom transform transition-all duration-700"
              style={{
                transform: hasHostileSound ? 'rotate(42deg) translateY(-50%)' : 'rotate(0deg) translateY(-50%)',
                boxShadow: hasHostileSound ? '0 0 6px #f59e0b' : 'none',
              }}
            />
            <div className="w-2 h-2 rounded-full bg-sky-400" />
          </div>
          <span className="text-[10px] text-amber-300 font-bold">
            {hasHostileSound ? 'AZ: 042° (LOCKED)' : 'SCANNING 360°'}
          </span>
        </div>

        {/* Harmonic Peak Profile */}
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex flex-col justify-between text-[10px]">
          <span className="text-slate-500 text-[9px] font-medium">ROTOR HARMONIC FFT</span>

          <div className="space-y-1.5">
            <div>
              <div className="flex justify-between items-center text-[10px] mb-0.5">
                <span className="text-slate-700 font-medium">f₀ (210 Hz):</span>
                <span className={hasHostileSound ? 'text-amber-800 font-bold' : 'text-slate-400'}>
                  {hasHostileSound ? '+24.5 dB SNR' : '-3.2 dB'}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${hasHostileSound ? 'bg-amber-500' : 'bg-slate-300'} transition-all`}
                  style={{ width: hasHostileSound ? '88%' : '15%' }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-[10px] mb-0.5">
                <span className="text-slate-700 font-medium">2f₀ (420 Hz):</span>
                <span className={hasHostileSound ? 'text-amber-800 font-bold' : 'text-slate-400'}>
                  {hasHostileSound ? '+18.1 dB SNR' : '-4.0 dB'}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${hasHostileSound ? 'bg-amber-500' : 'bg-slate-300'} transition-all`}
                  style={{ width: hasHostileSound ? '65%' : '10%' }}
                />
              </div>
            </div>
          </div>

          <span className="text-[9px] text-slate-500">Match: 4-Blade Quadrotor</span>
        </div>
      </div>
    </div>
  );
};
