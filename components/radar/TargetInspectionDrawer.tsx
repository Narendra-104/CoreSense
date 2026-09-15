'use client';

import React from 'react';
import { TargetTrack } from '@/types/dashboard';
import {
  Crosshair,
  Radio,
  Volume2,
  Camera,
  Activity,
  Zap,
  ShieldAlert,
  ArrowUpRight,
  Wifi,
  Disc,
  X,
} from 'lucide-react';

interface TargetInspectionDrawerProps {
  track: TargetTrack | null;
  onClose: () => void;
  onAutoSlewGimbal: () => void;
  onEngageJammer: () => void;
  isGimbalLocked: boolean;
  isJammingActive: boolean;
}

export const TargetInspectionDrawer: React.FC<TargetInspectionDrawerProps> = ({
  track,
  onClose,
  onAutoSlewGimbal,
  onEngageJammer,
  isGimbalLocked,
  isJammingActive,
}) => {
  if (!track) return null;

  const isHostile = track.threatLevel === 'HOSTILE' || track.threatLevel === 'CRITICAL';
  const isElevated = track.threatLevel === 'ELEVATED';
  const isNeutralized = track.threatLevel === 'NEUTRALIZED';
  const isFriendly = track.classification === 'FRIENDLY_UAV';

  const badgeColor = isNeutralized
    ? 'bg-slate-800 text-slate-300 border-slate-700'
    : isHostile
    ? 'bg-red-950 text-red-400 border-red-800 animate-pulse'
    : isElevated
    ? 'bg-amber-950 text-amber-400 border-amber-800'
    : isFriendly
    ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
    : 'bg-cyan-950 text-cyan-400 border-cyan-800';

  return (
    <div className="bg-tactical-panel border border-tactical-panelBorder rounded-lg p-3 shadow-2xl flex flex-col space-y-3 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
        <div className="flex items-center space-x-2">
          <Crosshair className={`w-4 h-4 ${isHostile ? 'text-red-400' : 'text-emerald-400'}`} />
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-white tracking-wider">{track.callsign}</span>
              <span className="text-[10px] text-zinc-500">[{track.id}]</span>
            </div>
            <span className="text-[9px] text-zinc-400">Detected: {track.firstDetectedAt}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${badgeColor}`}>
            {track.threatLevel}
          </span>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded hover:bg-zinc-800 transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Kinematics Grid */}
      <div className="grid grid-cols-4 gap-1.5 bg-zinc-950/70 p-2 rounded border border-zinc-800/80 text-[10px]">
        <div>
          <span className="text-zinc-500 block text-[9px]">RANGE</span>
          <span className="text-white font-bold">{track.rangeMeters.toLocaleString()} m</span>
        </div>
        <div>
          <span className="text-zinc-500 block text-[9px]">AZIMUTH / ELEV</span>
          <span className="text-cyan-400 font-bold">{track.azimuthDeg}° / {track.elevationDeg}°</span>
        </div>
        <div>
          <span className="text-zinc-500 block text-[9px]">ALT (MSL / AGL)</span>
          <span className="text-amber-400 font-bold">{track.altitudeMslMeters}m / {track.altitudeAglMeters}m</span>
        </div>
        <div>
          <span className="text-zinc-500 block text-[9px]">GROUND SPEED</span>
          <span className="text-emerald-400 font-bold">{track.groundSpeedKmh} km/h</span>
        </div>
      </div>

      {/* Multi-Sensor Breakdown */}
      <div className="space-y-2 text-[10px]">
        <span className="text-zinc-400 text-[9px] tracking-wider block font-bold">
          MULTI-SENSOR CORRELATION & SIGNATURE MATCH
        </span>

        {/* RF Signature */}
        <div className="flex items-center justify-between bg-zinc-900/60 px-2 py-1.5 rounded border border-zinc-800">
          <div className="flex items-center space-x-2">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <div>
              <span className="text-zinc-300 block text-[10px]">{track.rfProtocol}</span>
              <span className="text-zinc-500 text-[9px]">{track.rfFrequencyGhz} GHz | RSSI: {track.rfSignalDbm} dBm</span>
            </div>
          </div>
          <span className="text-cyan-300 font-bold">SDR MATCH</span>
        </div>

        {/* Acoustic Signature */}
        <div className="flex items-center justify-between bg-zinc-900/60 px-2 py-1.5 rounded border border-zinc-800">
          <div className="flex items-center space-x-2">
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            <div>
              <span className="text-zinc-300 block text-[10px]">Acoustic Rotor Harmonic</span>
              <span className="text-zinc-500 text-[9px]">Fundamental: {track.acousticHarmonicHz} Hz (4-Blade Quad)</span>
            </div>
          </div>
          <span className="text-amber-400 font-bold">{track.acousticConfidence}% CONF</span>
        </div>

        {/* Optical LWIR Signature */}
        <div className="flex items-center justify-between bg-zinc-900/60 px-2 py-1.5 rounded border border-zinc-800">
          <div className="flex items-center space-x-2">
            <Camera className="w-3.5 h-3.5 text-purple-400" />
            <div>
              <span className="text-zinc-300 block text-[10px]">Dual-Band PTZ YOLO-v8</span>
              <span className="text-zinc-500 text-[9px]">LWIR Microbolometer + Visible HD</span>
            </div>
          </div>
          <span className="text-purple-300 font-bold">{track.opticalConfidence}% CONF</span>
        </div>

        {/* Sensor Fusion Aggregate */}
        <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
          <div className="flex justify-between items-center mb-1">
            <span className="text-zinc-400 text-[9px]">OVERALL FUSION CONFIDENCE</span>
            <span className="text-white font-bold">{track.fusionConfidence}%</span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                track.fusionConfidence > 90 ? 'bg-red-500' : track.fusionConfidence > 60 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${track.fusionConfidence}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          onClick={onAutoSlewGimbal}
          className={`flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded text-[10px] font-bold border transition ${
            isGimbalLocked
              ? 'bg-purple-950/80 border-purple-600 text-purple-200'
              : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-purple-900/40 hover:border-purple-600'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>{isGimbalLocked ? 'GIMBAL LOCKED (042°)' : 'AUTO-SLEW GIMBAL'}</span>
        </button>

        <button
          onClick={onEngageJammer}
          className={`flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded text-[10px] font-bold border transition ${
            isJammingActive
              ? 'bg-red-900/80 border-red-500 text-white animate-pulse'
              : 'bg-red-950/50 border-red-800/80 text-red-300 hover:bg-red-900 hover:border-red-500'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>{isJammingActive ? 'JAMMING ACTIVE (85W)' : 'DEPLOY MITIGATION'}</span>
        </button>
      </div>
    </div>
  );
};
