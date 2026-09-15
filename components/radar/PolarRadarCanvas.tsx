'use client';

import React, { useRef, useEffect, useState } from 'react';
import { TargetTrack } from '@/types/dashboard';
import { soundEngine } from '@/utils/soundSynthesizer';
import { Shield, Crosshair, ZoomIn, ZoomOut, AlertTriangle } from 'lucide-react';

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
  const [rangeScaleKm, setRangeScaleKm] = useState<number>(5.0); // 5km, 3km, 1.5km
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

      // Rotate sweep beam (60 deg/sec = 1 rev per 6 sec)
      sweepAngleRef.current = (sweepAngleRef.current + 55 * dt) % 360;

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) / 2 - 25;

      // Clear with dark tactical background
      ctx.fillStyle = '#070c18';
      ctx.fillRect(0, 0, width, height);

      // Draw faint polar grid rings
      const rings = [
        { dist: 500, label: '500m (Kinetic/Net)' },
        { dist: 1500, label: '1.5km (RF Jammer)' },
        { dist: 3000, label: '3.0km (PTZ Optical)' },
        { dist: 5000, label: '5.0km (Max RF Scan)' },
      ];

      const maxDistMeters = rangeScaleKm * 1000;

      // Grid circles
      rings.forEach((ring) => {
        if (ring.dist <= maxDistMeters) {
          const r = (ring.dist / maxDistMeters) * radius;
          ctx.beginPath();
          ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
          ctx.strokeStyle = ring.dist === 1500 ? 'rgba(245, 158, 11, 0.35)' : 'rgba(16, 185, 129, 0.18)';
          ctx.lineWidth = ring.dist === 1500 ? 1.5 : 1;
          ctx.setLineDash(ring.dist === 1500 ? [4, 4] : [2, 4]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Ring label
          ctx.fillStyle = ring.dist === 1500 ? 'rgba(245, 158, 11, 0.7)' : 'rgba(16, 185, 129, 0.5)';
          ctx.font = '10px monospace';
          ctx.fillText(ring.label, centerX + 6, centerY - r + 12);
        }
      });

      // Cardinal axis crosshairs (N, S, E, W, and 45 deg diagonals)
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.2)';
      ctx.lineWidth = 1;
      for (let angle = 0; angle < 360; angle += 45) {
        const rad = (angle - 90) * (Math.PI / 180);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + radius * Math.cos(rad), centerY + radius * Math.sin(rad));
        ctx.stroke();

        // Bearing text at outer edge
        const textRad = (angle - 90) * (Math.PI / 180);
        const tx = centerX + (radius + 14) * Math.cos(textRad);
        const ty = centerY + (radius + 14) * Math.sin(textRad);
        ctx.fillStyle = angle === 0 ? '#38bdf8' : 'rgba(148, 163, 184, 0.7)';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const labels: Record<number, string> = { 0: '000° N', 45: '045°', 90: '090° E', 135: '135°', 180: '180° S', 225: '225°', 270: '270° W', 315: '315°' };
        ctx.fillText(labels[angle] || `${angle}°`, tx, ty);
      }

      // Draw rotating radar sweep gradient
      const sweepRad = (sweepAngleRef.current - 90) * (Math.PI / 180);
      const sweepGradient = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, radius);
      sweepGradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
      sweepGradient.addColorStop(0.8, 'rgba(16, 185, 129, 0.15)');
      sweepGradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

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
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.9)';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.restore();

      // Station origin marker (Ladakh Sentry Post)
      ctx.beginPath();
      ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();
      ctx.strokeStyle = '#0284c7';
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
          ? '#ef4444'
          : isElevated
          ? '#f59e0b'
          : isFriendly
          ? '#10b981'
          : '#38bdf8';

        // Draw historic breadcrumb trail
        if (track.history && track.history.length > 1) {
          ctx.beginPath();
          track.history.forEach((pt, idx) => {
            const ptDistRatio = Math.sqrt(pt.x * pt.x + pt.y * pt.y) / maxDistMeters;
            const ptAngle = Math.atan2(pt.y, pt.x); // from center
            // convert to screen coords
            const hx = centerX + (pt.x / maxDistMeters) * radius;
            const hy = centerY - (pt.y / maxDistMeters) * radius;
            if (idx === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
          });
          ctx.strokeStyle = `${color}44`;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([2, 3]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Heading velocity vector line
        const vectorLen = Math.min(30, (track.groundSpeedKmh / 100) * 35);
        // Assuming heading towards center if hostile, else tangent
        const headingRad = trackRad + (isHostile ? Math.PI : Math.PI / 2);
        ctx.beginPath();
        ctx.moveTo(targetX, targetY);
        ctx.lineTo(targetX + vectorLen * Math.cos(headingRad), targetY + vectorLen * Math.sin(headingRad));
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Selected pulsating ring
        if (isSelected) {
          const pulseR = 14 + Math.sin(now * 0.008) * 4;
          ctx.beginPath();
          ctx.arc(targetX, targetY, pulseR, 0, Math.PI * 2);
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.stroke();

          // Reticle crosshair brackets
          const bSize = 8;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          // Top-left
          ctx.beginPath();
          ctx.moveTo(targetX - pulseR - bSize, targetY - pulseR);
          ctx.lineTo(targetX - pulseR, targetY - pulseR);
          ctx.lineTo(targetX - pulseR, targetY - pulseR - bSize);
          ctx.stroke();
          // Bottom-right
          ctx.beginPath();
          ctx.moveTo(targetX + pulseR + bSize, targetY + pulseR);
          ctx.lineTo(targetX + pulseR, targetY + pulseR);
          ctx.lineTo(targetX + pulseR, targetY + pulseR + bSize);
          ctx.stroke();
        }

        // Target glyph / blip
        ctx.save();
        ctx.shadowColor = color;
        ctx.shadowBlur = isHostile ? 12 : 6;
        ctx.fillStyle = color;

        if (isHostile) {
          // Diamond shape for hostile
          const sz = 7;
          ctx.beginPath();
          ctx.moveTo(targetX, targetY - sz);
          ctx.lineTo(targetX + sz, targetY);
          ctx.lineTo(targetX, targetY + sz);
          ctx.lineTo(targetX - sz, targetY);
          ctx.closePath();
          ctx.fill();
        } else if (isFriendly) {
          // Circle for friendly
          ctx.beginPath();
          ctx.arc(targetX, targetY, 5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Triangle for unidentified/anomaly
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
        ctx.fillStyle = 'rgba(11, 19, 34, 0.85)';
        ctx.strokeStyle = `${color}99`;
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

  // Click on canvas to select nearest track
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
    let minDistance = 35; // Click tolerance in px

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
    <div className="relative flex flex-col h-full bg-tactical-panel border border-tactical-panelBorder rounded-lg p-3 shadow-xl overflow-hidden">
      {/* Panel header & controls */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80 mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-xs font-bold text-emerald-400 tracking-wider">
            TACTICAL 360° POLAR RADAR
          </span>
          <span className="text-[10px] font-mono text-zinc-500">
            [FREQ: X-BAND / 9.4 GHz]
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Mode toggle */}
          <div className="flex rounded bg-zinc-900 border border-zinc-800 p-0.5 text-[10px] font-mono">
            <button
              onClick={() => setRadarMode('POLAR')}
              className={`px-2 py-0.5 rounded transition ${
                radarMode === 'POLAR'
                  ? 'bg-emerald-600/30 text-emerald-300 font-bold border border-emerald-500/50'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              POLAR
            </button>
            <button
              onClick={() => setRadarMode('TERRAIN')}
              className={`px-2 py-0.5 rounded transition ${
                radarMode === 'TERRAIN'
                  ? 'bg-amber-600/30 text-amber-300 font-bold border border-amber-500/50'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              TERRAIN LOS
            </button>
          </div>

          {/* Range Scale */}
          <div className="flex items-center space-x-1 bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5">
            <span className="text-[10px] font-mono text-zinc-400">RANGE:</span>
            {[1.5, 3.0, 5.0].map((scale) => (
              <button
                key={scale}
                onClick={() => setRangeScaleKm(scale)}
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  rangeScaleKm === scale
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {scale}km
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Canvas container */}
      <div className="relative flex-1 flex items-center justify-center min-h-[360px]">
        <canvas
          ref={canvasRef}
          width={640}
          height={640}
          onClick={handleCanvasClick}
          className="w-full max-w-[480px] aspect-square cursor-crosshair rounded-full border border-emerald-900/40 shadow-[0_0_25px_rgba(16,185,129,0.1)]"
        />

        {/* Legend Overlay at bottom */}
        <div className="absolute bottom-2 left-2 flex items-center space-x-3 bg-zinc-950/80 border border-zinc-800/80 rounded px-2.5 py-1 text-[9px] font-mono backdrop-blur">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-500 rotate-45" />
            <span className="text-red-400">Hostile Drone</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[6px] border-b-amber-500" />
            <span className="text-amber-400">RF Anomaly</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-emerald-400">Friendly</span>
          </div>
        </div>
      </div>
    </div>
  );
};
