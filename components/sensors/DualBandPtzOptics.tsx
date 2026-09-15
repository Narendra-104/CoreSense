'use client';

import React, { useState } from 'react';
import { Camera } from 'lucide-react';

interface DualBandPtzOpticsProps {
  isLocked: boolean;
  azimuthDeg: number;
  elevationDeg: number;
  hasHostileTarget: boolean;
  isMitigated: boolean;
}

export const DualBandPtzOptics: React.FC<DualBandPtzOpticsProps> = ({
  isLocked,
  azimuthDeg,
  elevationDeg,
  hasHostileTarget,
  isMitigated,
}) => {
  const [opticsMode, setOpticsMode] = useState<'LWIR' | 'VISIBLE' | 'SPLIT'>('LWIR');

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm flex flex-col space-y-2.5 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center space-x-2">
          <Camera className="w-4 h-4 text-purple-600" />
          <span className="text-xs font-bold text-slate-900 tracking-wide">
            DUAL-BAND PTZ OPTICS GIMBAL
          </span>
        </div>

        {/* Optics Mode Selector */}
        <div className="flex rounded-md bg-slate-100 border border-slate-200 p-0.5 text-[10px]">
          {(['LWIR', 'VISIBLE', 'SPLIT'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setOpticsMode(mode)}
              className={`px-2 py-0.5 rounded transition font-medium ${
                opticsMode === mode
                  ? 'bg-purple-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Simulated Live Viewport */}
      <div className="relative w-full h-[180px] bg-slate-950 rounded-lg border border-slate-800 overflow-hidden flex items-center justify-center">
        {opticsMode === 'LWIR' ? (
          <div className="absolute inset-0 bg-gradient-to-b from-[#140b2b] via-[#24103f] to-[#0d071a]">
            <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 400 200">
              <path d="M 0 160 Q 120 110 240 150 T 400 130 L 400 200 L 0 200 Z" fill="#3b0764" />
              <path d="M 0 175 Q 180 140 320 180 T 400 165 L 400 200 L 0 200 Z" fill="#581c87" />
            </svg>
          </div>
        ) : opticsMode === 'VISIBLE' ? (
          <div className="absolute inset-0 bg-gradient-to-b from-[#0c1829] via-[#0f233d] to-[#08101a]">
            <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 400 200">
              <path d="M 0 160 Q 120 110 240 150 T 400 130 L 400 200 L 0 200 Z" fill="#1e293b" />
            </svg>
          </div>
        ) : (
          <div className="absolute inset-0 grid grid-cols-2">
            <div className="bg-gradient-to-b from-[#140b2b] to-[#0d071a] border-r border-purple-500/30 flex items-start p-1.5">
              <span className="text-[9px] text-purple-300 bg-purple-950/80 px-1.5 py-0.5 rounded font-medium">LWIR 640x512</span>
            </div>
            <div className="bg-gradient-to-b from-[#0c1829] to-[#08101a] flex items-start p-1.5">
              <span className="text-[9px] text-sky-300 bg-sky-950/80 px-1.5 py-0.5 rounded font-medium">VISIBLE HD</span>
            </div>
          </div>
        )}

        {/* Scanlines Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40" />

        {/* Target Bounding Box & Drone Simulation */}
        {hasHostileTarget && (
          <div
            className={`absolute flex flex-col items-center transition-all duration-700 ${
              isLocked ? 'scale-100' : 'scale-90'
            }`}
            style={{
              top: '40%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="relative w-12 h-6 flex items-center justify-center mb-1">
              {opticsMode !== 'VISIBLE' && (
                <>
                  <div className="absolute -top-1 -left-1 w-3 h-3 rounded-full bg-orange-500 blur-[2px] animate-pulse" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-orange-500 blur-[2px] animate-pulse" />
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 rounded-full bg-orange-500 blur-[2px] animate-pulse" />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-orange-500 blur-[2px] animate-pulse" />
                </>
              )}
              <div className="w-8 h-2.5 bg-zinc-200 rounded-sm shadow-md" />
              <div className="absolute w-2 h-4 bg-zinc-300 rounded-sm" />
            </div>

            <div
              className={`w-28 h-20 border-2 rounded-md relative flex flex-col justify-between p-1.5 transition-colors ${
                isMitigated
                  ? 'border-slate-400 bg-slate-500/15'
                  : isLocked
                  ? 'border-rose-500 bg-rose-500/15 animate-pulse'
                  : 'border-amber-400 bg-amber-400/15'
              }`}
            >
              <div className="flex justify-between text-[9px] font-bold">
                <span className={isMitigated ? 'text-slate-300' : isLocked ? 'text-rose-400' : 'text-amber-400'}>
                  {isMitigated ? 'NEUTRALIZED' : 'YOLOv8: HOSTILE'}
                </span>
                <span className="text-white">{isMitigated ? '0 km/h' : '94%'}</span>
              </div>

              <div className="text-[8px] text-slate-300 flex justify-between font-medium">
                <span>RNG: 2,200m</span>
                <span>T-CORE: +48°C</span>
              </div>
            </div>
          </div>
        )}

        {/* Crosshair Reticle */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-20 h-20">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_6px_#38bdf8]" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-5 bg-sky-400/70" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1px] h-5 bg-sky-400/70" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[1px] w-5 bg-sky-400/70" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[1px] w-5 bg-sky-400/70" />
            <div className="absolute inset-2 rounded-full border border-sky-400/30 border-dashed" />
          </div>
        </div>

        {/* Live Gimbal Telemetry Overlay */}
        <div className="absolute bottom-2 left-2 flex items-center space-x-3 text-[10px] text-slate-300 bg-slate-900/80 px-2.5 py-1 rounded-md backdrop-blur">
          <span>AZ: <strong className="text-sky-400">{azimuthDeg.toFixed(1)}°</strong></span>
          <span>EL: <strong className="text-sky-400">+{elevationDeg.toFixed(1)}°</strong></span>
          <span>FOV: <strong className="text-white">4.2° NFOV</strong></span>
        </div>

        <div className="absolute top-2 right-2 text-[10px] text-slate-300 bg-slate-900/80 px-2.5 py-1 rounded-md backdrop-blur flex items-center space-x-1.5">
          <div className={`w-2 h-2 rounded-full ${isLocked ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'}`} />
          <span>{isLocked ? 'AUTOTRACK LOCKED' : 'SEARCH MODE'}</span>
        </div>
      </div>
    </div>
  );
};
