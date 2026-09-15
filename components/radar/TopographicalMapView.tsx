'use client';

import React from 'react';
import { TargetTrack } from '@/types/dashboard';
import { Mountain } from 'lucide-react';

interface TopographicalMapViewProps {
  tracks: TargetTrack[];
  selectedTrackId: string | null;
  onSelectTrack: (id: string | null) => void;
  onSwitchToPolar: () => void;
}

export const TopographicalMapView: React.FC<TopographicalMapViewProps> = ({
  tracks,
  selectedTrackId,
  onSelectTrack,
  onSwitchToPolar,
}) => {
  return (
    <div className="relative flex flex-col h-full bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-2">
        <div className="flex items-center space-x-2">
          <Mountain className="w-4 h-4 text-amber-600" />
          <span className="font-mono text-xs font-bold text-slate-900 tracking-wider">
            TOPOGRAPHICAL ELEVATION & RADAR LOS MASKING
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            [LADAKH SECTOR / 4,850m MSL]
          </span>
        </div>

        <button
          onClick={onSwitchToPolar}
          className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition font-semibold"
        >
          ← SWITCH TO 360° POLAR
        </button>
      </div>

      {/* Interactive Map Visualizer */}
      <div className="relative flex-1 flex items-center justify-center min-h-[360px] bg-slate-900 rounded-xl p-2 overflow-hidden">
        <svg
          viewBox="0 0 600 600"
          className="w-full h-full max-w-[500px] aspect-square select-none"
        >
          <defs>
            <radialGradient id="mountainPeakNorth" cx="50%" cy="30%" r="50%">
              <stop offset="0%" stopColor="#78350f" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#451a03" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#0b1322" stopOpacity="0.0" />
            </radialGradient>
            <radialGradient id="mountainPeakEast" cx="75%" cy="65%" r="45%">
              <stop offset="0%" stopColor="#78350f" stopOpacity="0.75" />
              <stop offset="55%" stopColor="#451a03" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0b1322" stopOpacity="0.0" />
            </radialGradient>

            <linearGradient id="losShadowNorth" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0.05" />
            </linearGradient>

            <pattern id="radarGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(148, 163, 184, 0.12)" strokeWidth="1" />
            </pattern>
          </defs>

          <rect width="600" height="600" fill="url(#radarGrid)" />

          {/* Elevation Shading for Mountain Ridges */}
          <ellipse cx="300" cy="180" rx="190" ry="110" fill="url(#mountainPeakNorth)" />
          <ellipse cx="440" cy="380" rx="140" ry="100" fill="url(#mountainPeakEast)" />
          <ellipse cx="150" cy="420" rx="120" ry="90" fill="url(#mountainPeakNorth)" opacity="0.6" />

          {/* Topographical Contour Lines */}
          <g stroke="rgba(245, 158, 11, 0.45)" strokeWidth="1" fill="none" strokeDasharray="3 3">
            <path d="M 160 210 Q 300 130 440 210 Q 380 270 240 260 Z" />
            <path d="M 200 195 Q 300 145 400 195 Q 350 240 260 235 Z" stroke="rgba(245, 158, 11, 0.6)" />
            <path d="M 250 185 Q 300 160 350 185 Q 330 215 280 210 Z" stroke="rgba(245, 158, 11, 0.8)" />

            <path d="M 360 350 Q 480 300 540 400 Q 460 480 380 430 Z" />
            <path d="M 390 365 Q 470 330 510 400 Q 450 450 400 415 Z" stroke="rgba(245, 158, 11, 0.6)" />

            <path d="M 70 410 Q 180 360 230 450 Q 170 510 90 470 Z" />
          </g>

          {/* Elevation Labels */}
          <text x="300" y="175" fill="#fbbf24" fontSize="10" fontFamily="monospace" textAnchor="middle">
            ▲ KHARDUNG RIDGE [5,359m MSL]
          </text>
          <text x="450" y="380" fill="#fbbf24" fontSize="10" fontFamily="monospace" textAnchor="middle">
            ▲ EAST SPUR [5,180m MSL]
          </text>
          <text x="150" y="430" fill="#fbbf24" fontSize="10" fontFamily="monospace" textAnchor="middle">
            ▲ VALLEY PASS [4,620m MSL]
          </text>

          {/* Radar LOS Shadow */}
          <polygon
            points="240,200 100,50 500,50 360,200"
            fill="url(#losShadowNorth)"
            stroke="rgba(244, 63, 94, 0.5)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <text x="300" y="90" fill="#f43f5e" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
            ⚠ RADAR BLIND SECTOR (TERRAIN MASKING)
          </text>
          <text x="300" y="105" fill="#cbd5e1" fontSize="8" fontFamily="monospace" textAnchor="middle">
            RF Shadow behind North Ridge: Low-altitude drones masked from direct LOS
          </text>

          {/* Station Base Marker */}
          <circle cx="300" cy="300" r="8" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
          <circle cx="300" cy="300" r="18" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" />
          <text x="300" y="328" fill="#38bdf8" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
            CORESENSE SENTRY HQ [4,850m]
          </text>

          {/* LoRa Relay Nodes */}
          <g>
            <circle cx="280" cy="190" r="4" fill="#10b981" stroke="#ffffff" strokeWidth="1" />
            <text x="280" y="180" fill="#34d399" fontSize="8" fontFamily="monospace" textAnchor="middle">
              LoRa Relay N-01
            </text>

            <circle cx="430" cy="370" r="4" fill="#10b981" stroke="#ffffff" strokeWidth="1" />
            <text x="430" y="360" fill="#34d399" fontSize="8" fontFamily="monospace" textAnchor="middle">
              LoRa Relay E-02
            </text>

            <line x1="300" y1="300" x2="280" y2="190" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="300" y1="300" x2="430" y2="370" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="1" strokeDasharray="2 2" />
          </g>

          {/* Target Tracks Overlay */}
          {tracks.map((track) => {
            const rad = (track.azimuthDeg - 90) * (Math.PI / 180);
            const distRatio = track.rangeMeters / 5000;
            const radiusPx = 250;
            const tx = 300 + distRatio * radiusPx * Math.cos(rad);
            const ty = 300 + distRatio * radiusPx * Math.sin(rad);

            const isSelected = track.id === selectedTrackId;
            const isHostile = track.threatLevel === 'HOSTILE' || track.threatLevel === 'CRITICAL';
            const isElevated = track.threatLevel === 'ELEVATED';
            const color = isHostile ? '#f43f5e' : isElevated ? '#f59e0b' : '#10b981';

            return (
              <g
                key={track.id}
                onClick={() => onSelectTrack(track.id)}
                className="cursor-pointer group"
              >
                {isSelected && (
                  <circle cx={tx} cy={ty} r="16" fill="none" stroke={color} strokeWidth="2" className="animate-ping" />
                )}
                <circle cx={tx} cy={ty} r="6" fill={color} stroke="#ffffff" strokeWidth="1.5" />
                <rect
                  x={tx + 10}
                  y={ty - 16}
                  width="130"
                  height="26"
                  fill="#0f172a"
                  stroke={color}
                  strokeWidth="1"
                  rx="3"
                  opacity="0.95"
                />
                <text x={tx + 16} y={ty - 3} fill={color} fontSize="8" fontFamily="monospace" fontWeight="bold">
                  {track.callsign}
                </text>
                <text x={tx + 16} y={ty + 6} fill="#cbd5e1" fontSize="7" fontFamily="monospace">
                  MSL: {track.altitudeMslMeters}m | AGL: {track.altitudeAglMeters}m
                </text>
              </g>
            );
          })}
        </svg>

        {/* Info Badge */}
        <div className="absolute top-4 left-4 bg-slate-900/90 border border-slate-700 rounded-md p-2.5 text-[10px] font-mono text-slate-300 max-w-[220px] backdrop-blur shadow-sm">
          <div className="text-amber-400 font-bold mb-1 flex items-center space-x-1">
            <Mountain className="w-3 h-3" />
            <span>TERRAIN IMPACT MODEL</span>
          </div>
          <p className="text-slate-400 leading-tight">
            High mountain ridges create radar shadow zones. LoRaWAN 868MHz sentries relay micro-Doppler cueing across masked valley corridors.
          </p>
        </div>
      </div>
    </div>
  );
};
