'use client';

import React, { useRef, useEffect } from 'react';
import { Radio } from 'lucide-react';

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
      sCtx.fillStyle = '#0f172a';
      sCtx.fillRect(0, 0, sw, sh);

      // Grid lines & dBm ticks
      sCtx.strokeStyle = 'rgba(51, 65, 85, 0.7)';
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
        let noise = Math.sin(i * 0.2 + t) * 3 + Math.random() * 4;
        let signalHeight = sh - 15 + noise;

        if (hasHostileSignal && Math.abs(i - 48) < 6) {
          const peak = (6 - Math.abs(i - 48)) * (isJammingActive ? 10 : 8);
          signalHeight -= peak;
        }

        if (isJammingActive && i >= 40 && i <= 60) {
          signalHeight -= (Math.random() * 25 + 35);
        }

        points.push(signalHeight);

        if (i === 0) sCtx.moveTo(x, signalHeight);
        else sCtx.lineTo(x, signalHeight);
      }

      sCtx.lineTo(sw, sh);
      sCtx.lineTo(0, sh);
      sCtx.closePath();

      const gradient = sCtx.createLinearGradient(0, 0, 0, sh);
      gradient.addColorStop(0, isJammingActive ? 'rgba(239, 68, 68, 0.5)' : hasHostileSignal ? 'rgba(245, 158, 11, 0.4)' : 'rgba(14, 165, 233, 0.35)');
      gradient.addColorStop(1, 'rgba(15, 23, 42, 0.0)');
      sCtx.fillStyle = gradient;
      sCtx.fill();

      // Stroke FFT curve
      sCtx.beginPath();
      points.forEach((py, i) => {
        const px = (i / (numPoints - 1)) * sw;
        if (i === 0) sCtx.moveTo(px, py);
        else sCtx.lineTo(px, py);
      });
      sCtx.strokeStyle = isJammingActive ? '#f43f5e' : hasHostileSignal ? '#f59e0b' : '#38bdf8';
      sCtx.lineWidth = 1.5;
      sCtx.stroke();

      // 2. Waterfall
      wCtx.drawImage(wCanvas, 0, 0, ww, wh - 1, 0, 1, ww, wh - 1);

      for (let i = 0; i < numPoints; i++) {
        const x = (i / (numPoints - 1)) * ww;
        const widthPx = Math.ceil(ww / numPoints);
        const signalVal = (sh - points[i]) / sh;

        let r = 15;
        let g = 23;
        let b = 42;

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
          b = Math.floor(signalVal * 200 + 40);
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
    <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm flex flex-col space-y-2.5 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center space-x-2">
          <Radio className="w-4 h-4 text-sky-600" />
          <span className="text-xs font-bold text-slate-900 tracking-wide">
            SDR RF SPECTRUM & WATERFALL
          </span>
        </div>

        {/* Band Filters */}
        <div className="flex rounded-md bg-slate-100 border border-slate-200 p-0.5 text-[10px]">
          {(['ALL', '2.4G', '5.8G', 'GNSS'] as const).map((b) => (
            <button
              key={b}
              onClick={() => setSelectedBand(b)}
              className={`px-2 py-0.5 rounded transition font-medium ${
                selectedBand === b
                  ? 'bg-sky-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Spectrum Analyzer Display */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium">
          <span>FFT POWER DENSITY [dBm]</span>
          <span className={isJammingActive ? 'text-rose-600 font-bold' : hasHostileSignal ? 'text-amber-700 font-bold' : 'text-emerald-700 font-bold'}>
            {isJammingActive ? '⚡ JAMMING EMISSION' : hasHostileSignal ? '⚠ FHSS BURST DETECTED' : 'QUIET SPECTRUM'}
          </span>
        </div>
        <canvas
          ref={spectrumCanvasRef}
          width={380}
          height={65}
          className="w-full h-[65px] rounded-lg border border-slate-700 bg-slate-900"
        />
      </div>

      {/* Waterfall Display */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium">
          <span>WATERFALL [400 MHz – 6.0 GHz]</span>
          <span>AD9361 SDR (200 MS/s)</span>
        </div>
        <canvas
          ref={waterfallCanvasRef}
          width={380}
          height={75}
          className="w-full h-[75px] rounded-lg border border-slate-700 bg-slate-900"
        />
      </div>

      {/* Active RF Signatures Bar */}
      <div className="grid grid-cols-3 gap-1.5 text-[10px] bg-slate-50 p-2 rounded-lg border border-slate-200">
        <div>
          <span className="text-slate-500 block text-[9px] font-medium">2.437 GHz (CH6)</span>
          <span className={hasHostileSignal ? 'text-amber-700 font-bold' : 'text-slate-600'}>
            {hasHostileSignal ? 'OcuSync C2' : 'Noise Floor'}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-[9px] font-medium">1575.42 MHz (L1)</span>
          <span className={isJammingActive ? 'text-rose-700 font-bold' : 'text-emerald-700 font-bold'}>
            {isJammingActive ? 'Denial Active' : 'GNSS Lock OK'}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-[9px] font-medium">5.745 GHz (ISM)</span>
          <span className="text-slate-600">HD Standby</span>
        </div>
      </div>
    </div>
  );
};
