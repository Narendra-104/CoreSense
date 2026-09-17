'use client';

import React from 'react';
import { CountermeasureState } from '@/types/dashboard';
import { soundEngine } from '@/utils/soundSynthesizer';
import {
  Zap,
  Radio,
  Camera,
} from 'lucide-react';

interface CountermeasureConsoleProps {
  state: CountermeasureState;
  onToggleGnss: () => void;
  onToggleC2: () => void;
  onToggleVideo: () => void;
  onSetPower: (watts: number) => void;
  onToggleGimbal: () => void;
  onTriggerDefrost: () => void;
  onLogAction: (title: string, details: string, severity: 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS') => void;
}

export const CountermeasureConsole: React.FC<CountermeasureConsoleProps> = ({
  state,
  onToggleGnss,
  onToggleC2,
  onToggleVideo,
  onSetPower,
  onToggleGimbal,
  onLogAction,
}) => {
  const isAnyJammingActive = state.gnssJammingActive || state.c2LinkJammingActive || state.videoDownlinkJammingActive;

  const handleToggleGnss = () => {
    onToggleGnss();
    if (!state.gnssJammingActive) {
      soundEngine?.playJammerPulse();
      onLogAction('GNSS L1/L2 Jammer Engaged', 'GPS denial active on 1575.42 MHz & 1227.60 MHz', 'ALERT');
    }
  };

  const handleToggleC2 = () => {
    onToggleC2();
    if (!state.c2LinkJammingActive) {
      soundEngine?.playJammerPulse();
      onLogAction('2.4 GHz C2 Jammer Engaged', 'Directional smart jamming targeting drone control link', 'ALERT');
    }
  };

  const handleToggleVideo = () => {
    onToggleVideo();
    if (!state.videoDownlinkJammingActive) {
      soundEngine?.playJammerPulse();
      onLogAction('5.8 GHz Video Downlink Jammer Engaged', 'Video transmission link severed', 'ALERT');
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm flex flex-col space-y-3 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-rose-500 animate-pulse" />
          <span className="text-xs font-bold text-rose-600 tracking-wider">
            INTERLOCKED COUNTERMEASURE ENGAGEMENT CONSOLE
          </span>
        </div>
        <span
          className={`text-[10px] px-2 py-0.5 rounded border font-bold ${
            isAnyJammingActive
              ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
              : 'bg-slate-50 text-slate-500 border-slate-200'
          }`}
        >
          {isAnyJammingActive ? '⚡ MITIGATION EMITTING' : 'ARMED / STANDBY'}
        </span>
      </div>

      {/* Grid of Mitigation Actuators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Section 1: Directional Smart RF Jamming */}
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-2">
          <div className="flex flex-col mb-1">
            <span className="text-[10px] font-bold text-sky-700 flex items-center space-x-1.5 mb-0.5">
              <Radio className="w-3.5 h-3.5 text-sky-600" />
              <span>FLYSPARK GUARDIAN-S08 — DIRECTIONAL RF JAMMER</span>
            </span>
            <span className="text-[8px] text-slate-500">
              410 MHz – 5.9 GHz, 180W EIRP MAX
            </span>
          </div>

          {/* Multi-Band Toggle Buttons */}
          <div className="space-y-1.5">
            {/* GNSS L1/L2 */}
            <button
              onClick={handleToggleGnss}
              className={`w-full py-1.5 px-2 rounded text-[10px] flex items-center justify-between border transition ${
                state.gnssJammingActive
                  ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold animate-pulse'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>GNSS L1 / L2 SPOOF &amp; DENIAL</span>
              <span className={state.gnssJammingActive ? 'text-rose-600' : 'text-slate-400'}>
                {state.gnssJammingActive ? 'ACTIVE' : 'OFF'}
              </span>
            </button>

            {/* 2.4 GHz C2 */}
            <button
              onClick={handleToggleC2}
              className={`w-full py-1.5 px-2 rounded text-[10px] flex items-center justify-between border transition ${
                state.c2LinkJammingActive
                  ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold animate-pulse'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>2.4 GHz ISM C2 CONTROL BREAK</span>
              <span className={state.c2LinkJammingActive ? 'text-rose-600' : 'text-slate-400'}>
                {state.c2LinkJammingActive ? 'ACTIVE' : 'OFF'}
              </span>
            </button>

            {/* 5.8 GHz Video */}
            <button
              onClick={handleToggleVideo}
              className={`w-full py-1.5 px-2 rounded text-[10px] flex items-center justify-between border transition ${
                state.videoDownlinkJammingActive
                  ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold animate-pulse'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>5.8 GHz HD VIDEO DOWNLINK BREAK</span>
              <span className={state.videoDownlinkJammingActive ? 'text-rose-600' : 'text-slate-400'}>
                {state.videoDownlinkJammingActive ? 'ACTIVE' : 'OFF'}
              </span>
            </button>
          </div>

          {/* EIRP Power Slider */}
          <div className="pt-1 border-t border-slate-200">
            <div className="flex justify-between text-[9px] text-slate-500 mb-1">
              <span>RF EMISSION POWER (EIRP):</span>
              <span className="text-amber-600 font-bold">{state.jammingPowerEirpWatts} W EIRP (GUARDIAN-S08)</span>
            </div>
            <input
              type="range"
              min="10"
              max="180"
              step="5"
              value={state.jammingPowerEirpWatts}
              onChange={(e) => onSetPower(Number(e.target.value))}
              className="w-full accent-amber-500 h-1.5 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Section 2: XBOOM A30TR1575 PTZ SLEW-TO-CUE */}
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-violet-700 flex items-center space-x-1.5 mb-1">
              <Camera className="w-3.5 h-3.5 text-violet-600" />
              <span>XBOOM A30TR1575 SLEW-TO-CUE</span>
            </span>
            <span className="text-[8px] text-slate-500 block mb-2">
              30× EO + 5× IR tracking AZ {state.opticalGimbalAzimuthDeg}° / EL +{state.opticalGimbalElevationDeg}°
            </span>
          </div>

          <button
            onClick={onToggleGimbal}
            className={`w-full py-2 px-3 rounded text-[10px] font-bold border transition ${
              state.opticalGimbalLocked
                ? 'bg-violet-50 border-violet-300 text-violet-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {state.opticalGimbalLocked ? 'LOCK ENGAGED' : 'ENGAGE SLEW'}
          </button>
        </div>
      </div>
    </div>
  );
};
