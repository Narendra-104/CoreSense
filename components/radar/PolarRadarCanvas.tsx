'use client';

import React, { useRef, useEffect, useState } from 'react';
import { TargetTrack } from '@/types/dashboard';
import { soundEngine } from '@/utils/soundSynthesizer';
import { Radio } from 'lucide-react';

interface PolarRadarCanvasProps {
  tracks: TargetTrack[];
  selectedTrackId: string | null;
  onSelectTrack: (id: string | null) => void;
  radarMode: 'POLAR' | 'TERRAIN';
  setRadarMode: (mode: 'POLAR' | 'TERRAIN') => void;
}

export const PolarRadarCanvas: React.FC<PolarRadarCanvasProps> = ({
  tracks,
  selectedTrackId,
  onSelectTrack,
  radarMode,
  setRadarMode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rangeScaleKm, setRangeScaleKm] = useState<number>(5.0);
  const sweepAngleRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  // Radar drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      // Rotate sweep beam (55 deg/sec)
      sweepAngleRef.current = (sweepAngleRef.current + 55 * dt) % 360;

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) / 2 - 25;

      // Dark tactical contrast background for polar screen
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // Polar grid rings
      const rings = [
        { dist: 500, label: '500m (Kinetic/Net)' },
        { dist: 1500, label: '1.5km (RF Jammer)' },
        { dist: 3000, label: '3.0km (PTZ Optical)' },
        { dist: 5000, label: '5.0km (Max RF Scan)' },
      ];

      const maxDistMeters = rangeScaleKm * 1000;

      rings.forEach((ring) => {
        if (ring.dist <= maxDistMeters) {
          const r = (ring.dist / maxDistMeters) * radius;
          ctx.beginPath();
          ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
          ctx.strokeStyle = ring.dist === 1500 ? 'rgba(245, 158, 11, 0.45)' : 'rgba(56, 189, 248, 0.25)';
          ctx.lineWidth = ring.dist === 1500 ? 1.5 : 1;
          ctx.setLineDash(ring.dist === 1500 ? [4, 4] : [2, 4]);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = ring.dist === 1500 ? 'rgba(251, 191, 36, 0.85)' : 'rgba(148, 163, 184, 0.7)';
          ctx.font = '10px monospace';
          ctx.fillText(ring.label, centerX + 6, centerY - r + 12);
        }
      });

      // Cardinal axis crosshairs
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
      ctx.lineWidth = 1;
      for (let angle = 0; angle < 360; angle += 45) {
        const rad = (angle - 90) * (Math.PI / 180);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + radius * Math.cos(rad), centerY + radius * Math.sin(rad));
        ctx.stroke();

        const tx = centerX + (radius + 14) * Math.cos(rad);
        const ty = centerY + (radius + 14) * Math.sin(rad);
        ctx.fillStyle = angle === 0 ? '#38bdf8' : 'rgba(148, 163, 184, 0.8)';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const labels: Record<number, string> = { 0: '000° N', 45: '045°', 90: '090° E', 135: '135°', 180: '180° S', 225: '225°', 270: '270° W', 315: '315°' };
        ctx.fillText(labels[angle] || `${angle}°`, tx, ty);
      }

      // Rotating radar sweep
      const sweepRad = (sweepAngleRef.current - 90) * (Math.PI / 180);
      const sweepGradient = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, radius);
      sweepGradient.addColorStop(0, 'rgba(14, 165, 233, 0.35)');
      sweepGradient.addColorStop(0.8, 'rgba(14, 165, 233, 0.15)');
      sweepGradient.addColorStop(1, 'rgba(14, 165, 233, 0.0)');

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, sweepRad - 0.45, sweepRad, false);
      ctx.closePath();
      ctx.fillStyle = sweepGradient;
      ctx.fill();

      // Leading beam line
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + radius * Math.cos(sweepRad), centerY + radius * Math.sin(sweepRad));
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.9)';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#0284c7';
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.restore();

      // Center Origin
      ctx.beginPath();
      ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#0284c7';
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw targets
      tracks.forEach((track) => {
        if (track.rangeMeters > maxDistMeters) return;

        const trackDistRatio = track.rangeMeters / maxDistMeters;
        const trackRad = (track.azimuthDeg - 90) * (Math.PI / 180);
        const targetX = centerX + trackDistRatio * radius * Math.cos(trackRad);
        const targetY = centerY + trackDistRatio * radius * Math.sin(trackRad);

        const isSelected = track.id === selectedTrackId;
        const isHostile = track.threatLevel === 'HOSTILE' || track.threatLevel === 'CRITICAL';
        const isElevated = track.threatLevel === 'ELEVATED';
        const isNeutralized = track.threatLevel === 'NEUTRALIZED';
        const isFriendly = track.classification === 'FRIENDLY_UAV';

        const color = isNeutralized
          ? '#94a3b8'
          : isHostile
          ? '#f43f5e'
          : isElevated
          ? '#f59e0b'
          : isFriendly
          ? '#10b981'
          : '#38bdf8';

        // Breadcrumb trail
        if (track.history && track.history.length > 1) {
          ctx.beginPath();
          track.history.forEach((pt, idx) => {
            const hx = centerX + (pt.x / maxDistMeters) * radius;
            const hy = centerY - (pt.y / maxDistMeters) * radius;
            if (idx === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
          });
          ctx.strokeStyle = `${color}55`;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([2, 3]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Heading velocity vector
        const vectorLen = Math.min(30, (track.groundSpeedKmh / 100) * 35);
        const headingRad = trackRad + (isHostile ? Math.PI : Math.PI / 2);
        ctx.beginPath();
        ctx.moveTo(targetX, targetY);
        ctx.lineTo(targetX + vectorLen * Math.cos(headingRad), targetY + vectorLen * Math.sin(headingRad));
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Pulsating selection ring
        if (isSelected) {
          const pulseR = 14 + Math.sin(now * 0.008) * 4;
          ctx.beginPath();
          ctx.arc(targetX, targetY, pulseR, 0, Math.PI * 2);
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Glyph
        ctx.save();
        ctx.shadowColor = color;
        ctx.shadowBlur = isHostile ? 10 : 5;
        ctx.fillStyle = color;

        if (isHostile) {
          const sz = 7;
          ctx.beginPath();
          ctx.moveTo(targetX, targetY - sz);
          ctx.lineTo(targetX + sz, targetY);
          ctx.lineTo(targetX, targetY + sz);
          ctx.lineTo(targetX - sz, targetY);
          ctx.closePath();
          ctx.fill();
        } else if (isFriendly) {
          ctx.beginPath();
          ctx.arc(targetX, targetY, 5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const sz = 6;
          ctx.beginPath();
          ctx.moveTo(targetX, targetY - sz);
          ctx.lineTo(targetX + sz, targetY + sz);
          ctx.lineTo(targetX - sz, targetY + sz);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();

        // Target Tag info box
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = `${color}aa`;
        ctx.lineWidth = 1;
        const tagText1 = `${track.callsign}`;
        const tagText2 = `Alt: ${track.altitudeMslMeters}m | ${track.groundSpeedKmh}km/h`;
        const tagWidth = Math.max(ctx.measureText(tagText1).width, ctx.measureText(tagText2).width) + 12;
        const tagHeight = 26;
        const tagX = targetX + 12;
        const tagY = targetY - 14;

        ctx.fillRect(tagX, tagY, tagWidth, tagHeight);
        ctx.strokeRect(tagX, tagY, tagWidth, tagHeight);

        ctx.fillStyle = color;
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(tagText1, tagX + 6, tagY + 11);

        ctx.fillStyle = '#cbd5e1';
        ctx.font = '8px monospace';
        ctx.fillText(tagText2, tagX + 6, tagY + 21);
      });

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [tracks, selectedTrackId, rangeScaleKm]);

  // Click on canvas
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const clickY = ((e.clientY - rect.top) / rect.height) * canvas.height;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 2 - 25;
    const maxDistMeters = rangeScaleKm * 1000;

    let closestTrack: TargetTrack | null = null;
    let minDistance = 35;

    tracks.forEach((track) => {
      const trackDistRatio = track.rangeMeters / maxDistMeters;
      const trackRad = (track.azimuthDeg - 90) * (Math.PI / 180);
      const targetX = centerX + trackDistRatio * radius * Math.cos(trackRad);
      const targetY = centerY + trackDistRatio * radius * Math.sin(trackRad);

      const d = Math.hypot(clickX - targetX, clickY - targetY);
      if (d < minDistance) {
        minDistance = d;
        closestTrack = track;
      }
    });

    if (closestTrack) {
      onSelectTrack((closestTrack as TargetTrack).id);
      soundEngine?.playRadarBlip();
    } else {
      onSelectTrack(null);
    }
  };

  return (
    <div className="relative flex flex-col h-full bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm overflow-hidden">
      {/* Panel header & controls */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-xs font-bold text-slate-900 tracking-wider">
            TACTICAL 360° POLAR RADAR
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            [FREQ: X-BAND / 9.4 GHz]
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Mode toggle */}
          <div className="flex rounded-md bg-slate-100 border border-slate-200 p-0.5 text-[10px] font-mono">
            <button
              onClick={() => setRadarMode('POLAR')}
              className={`px-2.5 py-1 rounded transition font-semibold ${
                radarMode === 'POLAR'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              POLAR
            </button>
            <button
              onClick={() => setRadarMode('TERRAIN')}
              className={`px-2.5 py-1 rounded transition font-semibold ${
                radarMode === 'TERRAIN'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              TERRAIN LOS
            </button>
          </div>

          {/* Range Scale */}
          <div className="flex items-center space-x-1 bg-slate-100 border border-slate-200 rounded-md px-2 py-1">
            <span className="text-[10px] font-mono text-slate-500 font-medium">RANGE:</span>
            {[1.5, 3.0, 5.0].map((scale) => (
              <button
                key={scale}
                onClick={() => setRangeScaleKm(scale)}
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-medium ${
                  rangeScaleKm === scale
                    ? 'bg-sky-600 text-white font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {scale}km
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Canvas container */}
      <div className="relative flex-1 flex items-center justify-center min-h-[360px] bg-slate-900 rounded-xl p-2">
        <canvas
          ref={canvasRef}
          width={640}
          height={640}
          onClick={handleCanvasClick}
          className="w-full max-w-[480px] aspect-square cursor-crosshair rounded-full border border-slate-700 shadow-md"
        />

        {/* Legend Overlay at bottom */}
        <div className="absolute bottom-4 left-4 flex items-center space-x-3 bg-slate-900/90 border border-slate-700 rounded-md px-3 py-1.5 text-[10px] font-mono text-slate-300 backdrop-blur">
          <div className="flex items-center space-x-1.5">
            <div className="w-2 h-2 bg-rose-500 rotate-45" />
            <span>Hostile</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[6px] border-b-amber-400" />
            <span>Anomaly</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Friendly</span>
          </div>
        </div>
      </div>
    </div>
  );
};
