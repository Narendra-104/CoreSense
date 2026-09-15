'use client';

import React, { useState } from 'react';
import { Camera, Crosshair, Eye, Flame, Maximize2, ShieldAlert } from 'lucide-react';

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
    <div className="bg-tactical-panel border border-tactical-panelBorder rounded-lg p-3 shadow-lg flex flex-col space-y-2 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
        <div className="flex items-center space-x-2">
          <Camera className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-bold text-purple-400 tracking-wider">
            DUAL-BAND PTZ OPTICAL / LWIR GIMBAL
          </span>
        </div>

        {/* Optics Mode Selector */}
        <div className="flex rounded bg-zinc-900 border border-zinc-800 p-0.5 text-[9px]">
          {(['LWIR', 'VISIBLE', 'SPLIT'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setOpticsMode(mode)}
              className={`px-1.5 py-0.5 rounded transition ${
                opticsMode === mode
                  ? 'bg-purple-600/30 text-purple-300 font-bold border border-purple-500/50'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Simulated Live Viewport */}
      <div className="relative w-full h-[180px] bg-black rounded-lg border border-purple-900/40 overflow-hidden flex items-center justify-center">
        {/* Background Visual based on Optics Mode */}
        {opticsMode === 'LWIR' ? (
          // LWIR Thermal False-Color Palette (Dark purple / orange hot spot)
          <div className="absolute inset-0 bg-gradient-to-b from-[#140b2b] via-[#24103f] to-[#0d071a]">
            {/* Mountain Ridge Silhouettes */}
            <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 400 200">
              <path d="M 0 160 Q 120 110 240 150 T 400 130 L 400 200 L 0 200 Z" fill="#3b0764" />
              <path d="M 0 175 Q 180 140 320 180 T 400 165 L 400 200 L 0 200 Z" fill="#581c87" />
            </svg>
          </div>
        ) : opticsMode === 'VISIBLE' ? (
          // Cold Blue Day/Night Camera
          <div className="absolute inset-0 bg-gradient-to-b from-[#0c1829] via-[#0f233d] to-[#08101a]">
            <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 400 200">
              <path d="M 0 160 Q 120 110 240 150 T 400 130 L 400 200 L 0 200 Z" fill="#1e293b" />
            </svg>
          </div>
        ) : (
          // Split Mode
          <div className="absolute inset-0 grid grid-cols-2">
            <div className="bg-gradient-to-b from-[#140b2b] to-[#0d071a] border-r border-purple-500/30 flex items-start p-1">
              <span className="text-[8px] text-purple-300 bg-purple-950/80 px-1 rounded">LWIR 640x512</span>
            </div>
            <div className="bg-gradient-to-b from-[#0c1829] to-[#08101a] flex items-start p-1">
              <span className="text-[8px] text-cyan-300 bg-cyan-950/80 px-1 rounded">VISIBLE HD</span>
            </div>
          </div>
        )}

        {/* Scanlines / HUD Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] pointer-events-none opacity-50" />

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
            {/* Drone Glyph */}
            <div className="relative w-12 h-6 flex items-center justify-center mb-1">
              {/* Rotor heat blooms in LWIR */}
              {opticsMode !== 'VISIBLE' && (
                <>
                  <div className="absolute -top-1 -left-1 w-3 h-3 rounded-full bg-orange-500 blur-[2px] animate-pulse" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-orange-500 blur-[2px] animate-pulse" />
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 rounded-full bg-orange-500 blur-[2px] animate-pulse" />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-orange-500 blur-[2px] animate-pulse" />
                </>
              )}
              {/* Drone Body */}
              <div className="w-8 h-2.5 bg-zinc-200 rounded-sm shadow-md" />
              <div className="absolute w-2 h-4 bg-zinc-300 rounded-sm" />
            </div>

            {/* YOLO AI Bounding Box */}
            <div
              className={`w-28 h-20 border-2 rounded relative flex flex-col justify-between p-1 transition-colors ${
                isMitigated
                  ? 'border-zinc-400 bg-zinc-500/10'
                  : isLocked
                  ? 'border-red-500 bg-red-500/10 animate-pulse'
                  : 'border-amber-400 bg-amber-400/10'
              }`}
            >
              <div className="flex justify-between text-[8px] font-bold">
                <span className={isMitigated ? 'text-zinc-300' : isLocked ? 'text-red-400' : 'text-amber-400'}>
                  {isMitigated ? 'NEUTRALIZED' : 'YOLOv8: HOSTILE_UAV'}
                </span>
                <span className="text-white">{isMitigated ? '0 km/h' : '94%'}</span>
              </div>

              {/* Box Corner Brackets */}
              <div className="text-[7px] text-zinc-300 flex justify-between">
                <span>RNG: 2,200m</span>
                <span>T-CORE: +48°C</span>
              </div>
            </div>
          </div>
        )}

        {/* Center Gimbal Crosshair Reticle */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-20 h-20">
            {/* Center Dot */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
            {/* Reticle Arms */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-5 bg-cyan-400/70" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1px] h-5 bg-cyan-400/70" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[1px] w-5 bg-cyan-400/70" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[1px] w-5 bg-cyan-400/70" />
            {/* Reticle Circle */}
            <div className="absolute inset-2 rounded-full border border-cyan-400/30 border-dashed" />
          </div>
        </div>

        {/* Live Gimbal Telemetry Overlay */}
        <div className="absolute bottom-1.5 left-2 flex items-center space-x-3 text-[9px] text-zinc-300 bg-black/70 px-2 py-0.5 rounded backdrop-blur">
          <span>AZ: <strong className="text-cyan-400">{azimuthDeg.toFixed(1)}°</strong></span>
          <span>EL: <strong className="text-cyan-400">+{elevationDeg.toFixed(1)}°</strong></span>
          <span>FOV: <strong className="text-white">4.2° NFOV</strong></span>
        </div>

        <div className="absolute top-1.5 right-2 text-[9px] text-zinc-300 bg-black/70 px-2 py-0.5 rounded backdrop-blur flex items-center space-x-1">
          <div className={`w-1.5 h-1.5 rounded-full ${isLocked ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`} />
          <span>{isLocked ? 'AUTOTRACK LOCKED' : 'GIMBAL SEARCH'}</span>
        </div>
      </div>
    </div>
  );
};
