'use client';

import React from 'react';
import { Volume2, ShieldCheck, Activity, Compass } from 'lucide-react';

interface AcousticBeamformingCardProps {
  hasHostileSound: boolean;
  confidence: number;
}

export const AcousticBeamformingCard: React.FC<AcousticBeamformingCardProps> = ({
  hasHostileSound,
  confidence,
}) => {
  return (
    <div className="bg-tactical-panel border border-tactical-panelBorder rounded-lg p-3 shadow-lg flex flex-col space-y-2 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
        <div className="flex items-center space-x-2">
          <Volume2 className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-amber-400 tracking-wider">
            4-MIC ACOUSTIC BEAMFORMING ARRAY
          </span>
        </div>
        <span className="text-[10px] text-emerald-300 bg-emerald-950/70 border border-emerald-800 px-2 py-0.5 rounded font-bold">
          DSP ACTIVE
        </span>
      </div>

      {/* DSP & Wind Noise Filter Status */}
      <div className="flex items-center justify-between bg-zinc-950/70 p-2 rounded border border-zinc-800 text-[10px]">
        <div>
          <span className="text-zinc-500 text-[9px] block">WIND-NOISE SUPPRESSION</span>
          <span className="text-emerald-400 font-bold">SPECTRAL SUBTRACTION (-22 dB)</span>
        </div>
        <div className="text-right">
          <span className="text-zinc-500 text-[9px] block">CORRELATION CONF</span>
          <span className={hasHostileSound ? 'text-amber-400 font-bold' : 'text-zinc-400'}>
            {hasHostileSound ? `${confidence}% CONFIDENCE` : 'QUIET PASS'}
          </span>
        </div>
      </div>

      {/* Polar Beamforming Vector & Harmonic Spectrum */}
      <div className="grid grid-cols-2 gap-2">
        {/* Polar Vector Mini Dial */}
        <div className="bg-[#060a14] p-2 rounded border border-zinc-800 flex flex-col items-center justify-center relative">
          <span className="text-[8px] text-zinc-400 absolute top-1 left-2">BEAM AZIMUTH</span>
          <div className="relative w-16 h-16 rounded-full border border-emerald-800/50 flex items-center justify-center my-1">
            <div className="absolute w-full h-[1px] bg-emerald-900/40" />
            <div className="absolute h-full w-[1px] bg-emerald-900/40" />
            {/* Vector Arrow */}
            <div
              className="absolute w-0.5 h-7 bg-amber-400 origin-bottom transform transition-all duration-700"
              style={{
                transform: hasHostileSound ? 'rotate(42deg) translateY(-50%)' : 'rotate(0deg) translateY(-50%)',
                boxShadow: hasHostileSound ? '0 0 6px #f59e0b' : 'none',
              }}
            />
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
          </div>
          <span className="text-[9px] text-amber-300 font-bold">
            {hasHostileSound ? 'AZ: 042° (LOCKED)' : 'SCANNING 360°'}
          </span>
        </div>

        {/* Harmonic Peak Profile */}
        <div className="bg-[#060a14] p-2 rounded border border-zinc-800 flex flex-col justify-between text-[9px]">
          <span className="text-zinc-400 text-[8px]">ROTOR HARMONIC FFT</span>

          <div className="space-y-1">
            <div className="flex justify-between items-center text-[8px]">
              <span className="text-zinc-300">f₀ (210 Hz):</span>
              <span className={hasHostileSound ? 'text-amber-400 font-bold' : 'text-zinc-500'}>
                {hasHostileSound ? '+24.5 dB SNR' : '-3.2 dB'}
              </span>
            </div>
            <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full ${hasHostileSound ? 'bg-amber-400' : 'bg-zinc-700'} transition-all`}
                style={{ width: hasHostileSound ? '88%' : '15%' }}
              />
            </div>

            <div className="flex justify-between items-center text-[8px]">
              <span className="text-zinc-300">2f₀ (420 Hz):</span>
              <span className={hasHostileSound ? 'text-amber-400 font-bold' : 'text-zinc-500'}>
                {hasHostileSound ? '+18.1 dB SNR' : '-4.0 dB'}
              </span>
            </div>
            <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full ${hasHostileSound ? 'bg-amber-400' : 'bg-zinc-700'} transition-all`}
                style={{ width: hasHostileSound ? '65%' : '10%' }}
              />
            </div>
          </div>

          <span className="text-[8px] text-zinc-500">Match: 4-Blade Quadrotor Motor</span>
        </div>
      </div>
    </div>
  );
};
