'use client';

import React from 'react';
import { TargetTrack } from '@/types/dashboard';
import {
  Crosshair,
  Radio,
  Volume2,
  Camera,
  Zap,
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
    ? 'bg-slate-100 text-slate-700 border-slate-300'
    : isHostile
    ? 'bg-rose-100 text-rose-800 border-rose-300 font-bold'
    : isElevated
    ? 'bg-amber-100 text-amber-800 border-amber-300 font-bold'
    : isFriendly
    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
    : 'bg-sky-100 text-sky-800 border-sky-300 font-bold';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm flex flex-col space-y-3 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center space-x-2">
          <Crosshair className={`w-4 h-4 ${isHostile ? 'text-rose-600' : 'text-emerald-600'}`} />
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-900 tracking-wide">{track.callsign}</span>
              <span className="text-[10px] text-slate-500">[{track.id}]</span>
            </div>
            <span className="text-[10px] text-slate-500">Detected: {track.firstDetectedAt}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`text-[10px] px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
            {track.threatLevel}
          </span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Kinematics Grid */}
      <div className="grid grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px]">
        <div>
          <span className="text-slate-500 block text-[9px] font-medium">RANGE</span>
          <span className="text-slate-900 font-bold">{track.rangeMeters.toLocaleString()} m</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[9px] font-medium">AZIMUTH / ELEV</span>
          <span className="text-sky-700 font-bold">{track.azimuthDeg}° / {track.elevationDeg}°</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[9px] font-medium">ALT (MSL / AGL)</span>
          <span className="text-amber-700 font-bold">{track.altitudeMslMeters}m / {track.altitudeAglMeters}m</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[9px] font-medium">GROUND SPEED</span>
          <span className="text-emerald-700 font-bold">{track.groundSpeedKmh} km/h</span>
        </div>
      </div>

      {/* Multi-Sensor Breakdown */}
      <div className="space-y-2 text-[11px]">
        <span className="text-slate-600 text-[10px] tracking-wider block font-bold">
          MULTI-SENSOR CORRELATION & SIGNATURE MATCH
        </span>

        {/* RF Signature */}
        <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
          <div className="flex items-center space-x-2.5">
            <Radio className="w-4 h-4 text-sky-600" />
            <div>
              <span className="text-slate-900 font-semibold block text-[11px]">{track.rfProtocol}</span>
              <span className="text-slate-500 text-[10px]">{track.rfFrequencyGhz} GHz | RSSI: {track.rfSignalDbm} dBm</span>
            </div>
          </div>
          <span className="text-sky-700 font-bold text-[10px] bg-sky-50 border border-sky-200 px-2 py-0.5 rounded">SDR MATCH</span>
        </div>

        {/* Acoustic Signature */}
        <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
          <div className="flex items-center space-x-2.5">
            <Volume2 className="w-4 h-4 text-amber-600" />
            <div>
              <span className="text-slate-900 font-semibold block text-[11px]">Acoustic Rotor Harmonic</span>
              <span className="text-slate-500 text-[10px]">Fundamental: {track.acousticHarmonicHz} Hz (4-Blade Quad)</span>
            </div>
          </div>
          <span className="text-amber-800 font-bold text-[10px] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">{track.acousticConfidence}% CONF</span>
        </div>

        {/* Optical LWIR Signature */}
        <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
          <div className="flex items-center space-x-2.5">
            <Camera className="w-4 h-4 text-purple-600" />
            <div>
              <span className="text-slate-900 font-semibold block text-[11px]">Dual-Band PTZ YOLO-v8</span>
              <span className="text-slate-500 text-[10px]">LWIR Microbolometer + Visible HD</span>
            </div>
          </div>
          <span className="text-purple-800 font-bold text-[10px] bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">{track.opticalConfidence}% CONF</span>
        </div>

        {/* Sensor Fusion Aggregate */}
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-slate-600 text-[10px] font-medium">OVERALL FUSION CONFIDENCE</span>
            <span className="text-slate-900 font-bold">{track.fusionConfidence}%</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                track.fusionConfidence > 90 ? 'bg-rose-500' : track.fusionConfidence > 60 ? 'bg-amber-500' : 'bg-emerald-500'
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
          className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg text-[11px] font-bold border transition ${
            isGimbalLocked
              ? 'bg-purple-600 border-purple-700 text-white'
              : 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>{isGimbalLocked ? 'GIMBAL LOCKED (042°)' : 'AUTO-SLEW GIMBAL'}</span>
        </button>

        <button
          onClick={onEngageJammer}
          className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg text-[11px] font-bold border transition ${
            isJammingActive
              ? 'bg-rose-600 border-rose-700 text-white animate-pulse'
              : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>{isJammingActive ? 'JAMMING ACTIVE (85W)' : 'DEPLOY MITIGATION'}</span>
        </button>
      </div>
    </div>
  );
};
