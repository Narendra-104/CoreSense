'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Radio, Activity, Zap } from 'lucide-react';

interface RfSpectrumWaterfallProps {
  isJammingActive: boolean;
  selectedBand: '2.4G' | '5.8G' | 'GNSS' | 'ALL';
  setSelectedBand: (band: '2.4G' | '5.8G' | 'GNSS' | 'ALL') => void;
  hasHostileSignal: boolean;
}

export const RfSpectrumWaterfall: React.FC<RfSpectrumWaterfallProps> = ({
  isJammingActive,
  selectedBand,
  setSelectedBand,
  hasHostileSignal,
}) => {
  const spectrumCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const waterfallCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Spectrum & Waterfall Animation Loop
  useEffect(() => {
    const sCanvas = spectrumCanvasRef.current;
    const wCanvas = waterfallCanvasRef.current;
    if (!sCanvas || !wCanvas) return;

    const sCtx = sCanvas.getContext('2d');
    const wCtx = wCanvas.getContext('2d');
    if (!sCtx || !wCtx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      t += 0.05;

      const sw = sCanvas.width;
      const sh = sCanvas.height;
      const ww = wCanvas.width;
      const wh = wCanvas.height;

      // 1. Draw Spectrum FFT Line
      sCtx.fillStyle = '#060a14';
      sCtx.fillRect(0, 0, sw, sh);

      // Grid lines & dBm ticks
      sCtx.strokeStyle = 'rgba(30, 41, 59, 0.7)';
      sCtx.lineWidth = 1;
      for (let y = 10; y < sh; y += 18) {
        sCtx.beginPath();
        sCtx.moveTo(0, y);
        sCtx.lineTo(sw, y);
        sCtx.stroke();
      }

      // Frequency points
      const numPoints = 120;
      const points: number[] = [];

      sCtx.beginPath();
      for (let i = 0; i < numPoints; i++) {
        const x = (i / (numPoints - 1)) * sw;
        // Base noise floor around -95 dBm (sh - 15)
        let noise = Math.sin(i * 0.2 + t) * 3 + Math.random() * 4;
        let signalHeight = sh - 15 + noise;

        // Incursion peak at index 45 (~2.437 GHz)
        if (hasHostileSignal && Math.abs(i - 48) < 6) {
          const peak = (6 - Math.abs(i - 48)) * (isJammingActive ? 10 : 8);
          signalHeight -= peak;
        }

        // Active jamming broad carrier
        if (isJammingActive && i >= 40 && i <= 60) {
          signalHeight -= (Math.random() * 25 + 35);
        }

        points.push(signalHeight);

        if (i === 0) sCtx.moveTo(x, signalHeight);
        else sCtx.lineTo(x, signalHeight);
      }

      // Draw gradient under FFT line
      sCtx.lineTo(sw, sh);
      sCtx.lineTo(0, sh);
      sCtx.closePath();

      const gradient = sCtx.createLinearGradient(0, 0, 0, sh);
      gradient.addColorStop(0, isJammingActive ? 'rgba(239, 68, 68, 0.5)' : hasHostileSignal ? 'rgba(245, 158, 11, 0.4)' : 'rgba(16, 185, 129, 0.25)');
      gradient.addColorStop(1, 'rgba(6, 10, 20, 0.0)');
      sCtx.fillStyle = gradient;
      sCtx.fill();

      // Stroke FFT curve
      sCtx.beginPath();
      points.forEach((py, i) => {
        const px = (i / (numPoints - 1)) * sw;
        if (i === 0) sCtx.moveTo(px, py);
        else sCtx.lineTo(px, py);
      });
      sCtx.strokeStyle = isJammingActive ? '#ef4444' : hasHostileSignal ? '#f59e0b' : '#10b981';
      sCtx.lineWidth = 1.5;
      sCtx.stroke();

      // 2. Shift Waterfall Downwards
      // Copy current waterfall image down by 1px
      wCtx.drawImage(wCanvas, 0, 0, ww, wh - 1, 0, 1, ww, wh - 1);

      // Draw new top row
      for (let i = 0; i < numPoints; i++) {
        const x = (i / (numPoints - 1)) * ww;
        const widthPx = Math.ceil(ww / numPoints);
        const signalVal = (sh - points[i]) / sh; // 0 to 1

        let r = 10;
        let g = 20;
        let b = 40;

        if (isJammingActive && i >= 40 && i <= 60) {
          r = Math.floor(220 + Math.random() * 35);
          g = Math.floor(50 + Math.random() * 30);
          b = 50;
        } else if (signalVal > 0.4) {
          r = Math.floor(signalVal * 255);
          g = Math.floor((1 - signalVal) * 200 + 50);
          b = 40;
        } else {
          g = Math.floor(signalVal * 180 + 20);
          b = Math.floor(signalVal * 150 + 40);
        }

        wCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        wCtx.fillRect(x, 0, widthPx, 1);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isJammingActive, hasHostileSignal, selectedBand]);

  return (
    <div className="bg-tactical-panel border border-tactical-panelBorder rounded-lg p-3 shadow-lg flex flex-col space-y-2 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
        <div className="flex items-center space-x-2">
          <Radio className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-cyan-400 tracking-wider">
            SDR RF SPECTRUM & WATERFALL SCANNER
          </span>
        </div>

        {/* Band Filters */}
        <div className="flex rounded bg-zinc-900 border border-zinc-800 p-0.5 text-[9px]">
          {(['ALL', '2.4G', '5.8G', 'GNSS'] as const).map((b) => (
            <button
              key={b}
              onClick={() => setSelectedBand(b)}
              className={`px-1.5 py-0.5 rounded transition ${
                selectedBand === b
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Spectrum Analyzer Display */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-[9px] text-zinc-400">
          <span>REAL-TIME FFT POWER DENSITY [dBm]</span>
          <span className={isJammingActive ? 'text-red-400 font-bold' : hasHostileSignal ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
            {isJammingActive ? '⚡ JAMMING BURST ACTIVE' : hasHostileSignal ? '⚠ FHSS HOPPING BURST DETECTED' : 'QUIET SPECTRUM'}
          </span>
        </div>
        <canvas
          ref={spectrumCanvasRef}
          width={380}
          height={70}
          className="w-full h-[70px] rounded border border-zinc-800 bg-[#060a14]"
        />
      </div>

      {/* Waterfall Display */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-[9px] text-zinc-400">
          <span>TIME-FREQUENCY WATERFALL [400 MHz – 6.0 GHz]</span>
          <span>SDR: AD9361 (200 MS/s)</span>
        </div>
        <canvas
          ref={waterfallCanvasRef}
          width={380}
          height={80}
          className="w-full h-[80px] rounded border border-zinc-800 bg-[#060a14]"
        />
      </div>

      {/* Active RF Signatures Bar */}
      <div className="grid grid-cols-3 gap-1 text-[8px] bg-zinc-950/70 p-1.5 rounded border border-zinc-800">
        <div>
          <span className="text-zinc-500 block">2.437 GHz (CH6)</span>
          <span className={hasHostileSignal ? 'text-amber-400 font-bold' : 'text-zinc-400'}>
            {hasHostileSignal ? 'OcuSync C2 Peak' : 'Noise Floor'}
          </span>
        </div>
        <div>
          <span className="text-zinc-500 block">1575.42 MHz (L1)</span>
          <span className={isJammingActive ? 'text-red-400 font-bold' : 'text-emerald-400'}>
            {isJammingActive ? 'GPS Denial Active' : 'GNSS Lock OK'}
          </span>
        </div>
        <div>
          <span className="text-zinc-500 block">5.745 GHz (ISM)</span>
          <span className="text-zinc-400">HD Downlink Standby</span>
        </div>
      </div>
    </div>
  );
};
