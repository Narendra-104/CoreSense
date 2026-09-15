'use client';

import React from 'react';
import { TargetTrack } from '@/types/dashboard';
import { Mountain, EyeOff, Radio, Navigation, AlertTriangle } from 'lucide-react';

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
    <div className="relative flex flex-col h-full bg-tactical-panel border border-tactical-panelBorder rounded-lg p-3 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80 mb-2">
        <div className="flex items-center space-x-2">
          <Mountain className="w-4 h-4 text-amber-400" />
          <span className="font-mono text-xs font-bold text-amber-400 tracking-wider">
            TOPOGRAPHICAL ELEVATION & RADAR LOS MASKING
          </span>
          <span className="text-[10px] font-mono text-zinc-500">
            [LADAKH SECTOR / 4,850m MSL]
          </span>
        </div>

        <button
          onClick={onSwitchToPolar}
          className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-700/50 hover:bg-emerald-900/60 transition"
        >
          ← SWITCH TO 360° POLAR
        </button>
      </div>

      {/* Interactive Map Visualizer with SVG Terrain & LOS Masking */}
      <div className="relative flex-1 flex items-center justify-center min-h-[360px] bg-[#060a14] rounded-lg border border-zinc-800 overflow-hidden">
        <svg
          viewBox="0 0 600 600"
          className="w-full h-full max-w-[500px] aspect-square select-none"
        >
          <defs>
            {/* Mountain Elevation Gradient */}
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

            {/* Radar Shadow Mask Gradient */}
            <linearGradient id="losShadowNorth" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0.05" />
            </linearGradient>

            {/* Radar LOS Cone Pattern */}
            <pattern id="radarGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(16, 185, 129, 0.07)" strokeWidth="1" />
            </pattern>
          </defs>

          {/* Grid background */}
          <rect width="600" height="600" fill="url(#radarGrid)" />

          {/* Elevation Shading for Mountain Ridges */}
          <ellipse cx="300" cy="180" rx="190" ry="110" fill="url(#mountainPeakNorth)" />
          <ellipse cx="440" cy="380" rx="140" ry="100" fill="url(#mountainPeakEast)" />
          <ellipse cx="150" cy="420" rx="120" ry="90" fill="url(#mountainPeakNorth)" opacity="0.6" />

          {/* Topographical Contour Lines (Elevation Rings) */}
          <g stroke="rgba(245, 158, 11, 0.35)" strokeWidth="1" fill="none" strokeDasharray="3 3">
            {/* North Ridge: Khardung Peak 5,359m */}
            <path d="M 160 210 Q 300 130 440 210 Q 380 270 240 260 Z" />
            <path d="M 200 195 Q 300 145 400 195 Q 350 240 260 235 Z" stroke="rgba(245, 158, 11, 0.5)" />
            <path d="M 250 185 Q 300 160 350 185 Q 330 215 280 210 Z" stroke="rgba(245, 158, 11, 0.7)" />

            {/* East Ridge: Chang La Spur 5,200m */}
            <path d="M 360 350 Q 480 300 540 400 Q 460 480 380 430 Z" />
            <path d="M 390 365 Q 470 330 510 400 Q 450 450 400 415 Z" stroke="rgba(245, 158, 11, 0.5)" />

            {/* Southwest Ridge */}
            <path d="M 70 410 Q 180 360 230 450 Q 170 510 90 470 Z" />
          </g>

          {/* Elevation Labels */}
          <text x="300" y="175" fill="#f59e0b" fontSize="9" fontFamily="monospace" textAnchor="middle">
            ▲ KHARDUNG RIDGE [5,359m MSL]
          </text>
          <text x="450" y="380" fill="#f59e0b" fontSize="9" fontFamily="monospace" textAnchor="middle">
            ▲ EAST SPUR [5,180m MSL]
          </text>
          <text x="150" y="430" fill="#f59e0b" fontSize="9" fontFamily="monospace" textAnchor="middle">
            ▲ VALLEY PASS [4,620m MSL]
          </text>

          {/* Radar Line of Sight (LOS) Shadow / Blind Zones */}
          {/* Shadow Behind North Ridge */}
          <polygon
            points="240,200 100,50 500,50 360,200"
            fill="url(#losShadowNorth)"
            stroke="rgba(239, 68, 68, 0.4)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <text x="300" y="90" fill="#ef4444" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
            ⚠ RADAR BLIND SECTOR (TERRAIN MASKING)
          </text>
          <text x="300" y="105" fill="#fca5a5" fontSize="8" fontFamily="monospace" textAnchor="middle">
            RF Shadow behind North Ridge: Low-altitude drones masked from direct 9.4 GHz LOS
          </text>

          {/* Station Base Marker (Ladakh Sentry Post 4,850m MSL) */}
          <circle cx="300" cy="300" r="8" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
          <circle cx="300" cy="300" r="18" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" />
          <text x="300" y="328" fill="#38bdf8" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
            PS 26050 SENTRY HQ [4,850m]
          </text>

          {/* LoRa Mesh Forward Relay Sentry Nodes */}
          <g>
            {/* North Relay */}
            <circle cx="280" cy="190" r="4" fill="#10b981" stroke="#ffffff" strokeWidth="1" />
            <text x="280" y="180" fill="#10b981" fontSize="8" fontFamily="monospace" textAnchor="middle">
              LoRa Relay N-01
            </text>

            {/* East Sentry */}
            <circle cx="430" cy="370" r="4" fill="#10b981" stroke="#ffffff" strokeWidth="1" />
            <text x="430" y="360" fill="#10b981" fontSize="8" fontFamily="monospace" textAnchor="middle">
              LoRa Relay E-02
            </text>

            {/* Connecting Mesh lines */}
            <line x1="300" y1="300" x2="280" y2="190" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="300" y1="300" x2="430" y2="370" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="1" strokeDasharray="2 2" />
          </g>

          {/* Target Tracks Overlay on Topo Map */}
          {tracks.map((track) => {
            const rad = (track.azimuthDeg - 90) * (Math.PI / 180);
            const distRatio = track.rangeMeters / 5000;
            const radiusPx = 250;
            const tx = 300 + distRatio * radiusPx * Math.cos(rad);
            const ty = 300 + distRatio * radiusPx * Math.sin(rad);

            const isSelected = track.id === selectedTrackId;
            const isHostile = track.threatLevel === 'HOSTILE' || track.threatLevel === 'CRITICAL';
            const isElevated = track.threatLevel === 'ELEVATED';
            const color = isHostile ? '#ef4444' : isElevated ? '#f59e0b' : '#10b981';

            return (
              <g
                key={track.id}
                onClick={() => onSelectTrack(track.id)}
                className="cursor-pointer group"
              >
                {/* Selection pulse */}
                {isSelected && (
                  <circle cx={tx} cy={ty} r="16" fill="none" stroke={color} strokeWidth="2" className="animate-ping" />
                )}

                {/* Target icon */}
                <circle cx={tx} cy={ty} r="6" fill={color} stroke="#ffffff" strokeWidth="1.5" />

                {/* Target callsign & altitude tag */}
                <rect
                  x={tx + 10}
                  y={ty - 16}
                  width="130"
                  height="26"
                  fill="#0b1322"
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

        {/* Topo Map Info Badge */}
        <div className="absolute top-2 left-2 bg-zinc-950/85 border border-zinc-800 rounded p-2 text-[9px] font-mono max-w-[220px] backdrop-blur">
          <div className="text-amber-300 font-bold mb-1 flex items-center space-x-1">
            <Mountain className="w-3 h-3" />
            <span>TERRAIN IMPACT MODEL</span>
          </div>
          <p className="text-zinc-400 leading-tight">
            High mountain ridges create severe RF multipath & radar shadow zones. LoRaWAN 868MHz forward sentries relay micro-Doppler cueing across masked valley corridors.
          </p>
        </div>
      </div>
    </div>
  );
};
