'use client';

import React, { useState } from 'react';
import { CountermeasureState } from '@/types/dashboard';
import { soundEngine } from '@/utils/soundSynthesizer';
import {
  Zap,
  Radio,
  Camera,
  Crosshair,
  Lock,
  Unlock,
  AlertTriangle,
  Check,
  X,
} from 'lucide-react';

interface CountermeasureConsoleProps {
  state: CountermeasureState;
  onToggleGnss: () => void;
  onToggleC2: () => void;
  onToggleVideo: () => void;
  onSetPower: (watts: number) => void;
  onToggleGimbal: () => void;
  onArmNetLauncher: (armed: boolean) => void;  // repurpose: now arms RWS
  onTriggerDefrost: () => void;
  onSetRwsFireMode: (mode: 'SAFE' | 'ARMED' | 'WEAPONS_FREE') => void;
  onAuthorizeRoe: (auth: boolean) => void;
  onFireRwsBurst: () => void;
  onLogAction: (title: string, details: string, severity: 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS') => void;
}

export const CountermeasureConsole: React.FC<CountermeasureConsoleProps> = ({
  state,
  onToggleGnss,
  onToggleC2,
  onToggleVideo,
  onSetPower,
  onToggleGimbal,
  onArmNetLauncher,
  onTriggerDefrost,
  onSetRwsFireMode,
  onAuthorizeRoe,
  onFireRwsBurst,
  onLogAction,
}) => {
  const [showFireModal, setShowFireModal] = useState(false);
  const [fireModalStep, setFireModalStep] = useState<1 | 2>(1);
  const [fireSuccessful, setFireSuccessful] = useState(false);

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

  const handleFireRws = () => {
    setFireSuccessful(true);
    soundEngine?.playNeutralizedChime();
    onFireRwsBurst();
    onLogAction(
      '35mm AHEAD Burst Discharged',
      'RWS fired 3 rounds AHEAD ammunition at designated target.',
      'SUCCESS'
    );
    setTimeout(() => {
      setShowFireModal(false);
      setFireModalStep(1);
      setFireSuccessful(false);
      onSetRwsFireMode('SAFE');
    }, 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm flex flex-col space-y-3 font-mono">
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
            className={`w-full py-1.5 px-3 rounded text-[10px] font-bold border transition ${
              state.opticalGimbalLocked
                ? 'bg-violet-50 border-violet-300 text-violet-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {state.opticalGimbalLocked ? 'LOCK ENGAGED' : 'ENGAGE SLEW'}
          </button>
        </div>
      </div>

      {/* Section 3: 35MM RWS HARD-KILL ENGAGEMENT */}
      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-rose-600 flex items-center space-x-1.5">
            <Crosshair className="w-3.5 h-3.5 text-rose-500" />
            <span>35–40mm RWS — AHEAD-CLASS AIRBURST</span>
          </span>
          <span className="text-[8px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
            3,000 – 4,000m EFFECTIVE
          </span>
        </div>

        {/* Row 1: Fire mode selector */}
        <div className="flex space-x-2">
          <button
            onClick={() => onSetRwsFireMode('SAFE')}
            className={`flex-1 py-1.5 px-2 rounded text-[10px] font-bold border transition ${
              state.rws.fireMode === 'SAFE'
                ? 'bg-slate-200 border-slate-400 text-slate-800'
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            SAFE
          </button>
          <button
            onClick={() => onSetRwsFireMode('ARMED')}
            className={`flex-1 py-1.5 px-2 rounded text-[10px] font-bold border transition ${
              state.rws.fireMode === 'ARMED'
                ? 'bg-amber-100 border-amber-400 text-amber-800 animate-pulse'
                : 'bg-white border-slate-200 text-slate-500 hover:bg-amber-50'
            }`}
          >
            ARMED
          </button>
          <button
            onClick={() => {
              if (state.rws.roeAuthorized) onSetRwsFireMode('WEAPONS_FREE');
            }}
            disabled={!state.rws.roeAuthorized}
            className={`flex-1 py-1.5 px-2 rounded text-[10px] font-bold border transition ${
              state.rws.fireMode === 'WEAPONS_FREE'
                ? 'bg-rose-100 border-rose-400 text-rose-800 animate-pulse'
                : 'bg-white border-slate-200 text-slate-500 ' + (state.rws.roeAuthorized ? 'hover:bg-rose-50' : 'opacity-50 cursor-not-allowed')
            }`}
          >
            WEAPONS FREE
          </button>
        </div>

        {/* Row 2: Status strip */}
        <div className="flex justify-between items-center bg-white border border-slate-200 rounded p-1.5 text-[9px] text-slate-600">
          <span>Ammo: <span className="font-bold text-slate-800">35mm AHEAD × {state.rws.ammoRoundsRemaining} RD</span></span>
          <span>Barrel Temp: <span className="font-bold text-amber-700">{state.rws.barrelTempC}°C</span></span>
          <span>Hydraulic: <span className="font-bold text-sky-700">{state.rws.hydraulicPressureBar} bar</span></span>
          <span>FCR Lock: <span className={state.rws.fcrLockActive ? 'font-bold text-rose-600' : 'font-bold text-slate-400'}>{state.rws.fcrLockActive ? 'LOCKED' : 'SEARCHING'}</span></span>
        </div>

        {/* Row 3: Airburst proximity fuse slider */}
        <div className="flex items-center space-x-2 py-1">
          <span className="text-[9px] text-slate-500 whitespace-nowrap">Proximity Fuse: {state.rws.airbustProximityFuseM}m</span>
          <input
            type="range"
            min="0"
            max="5"
            step="0.5"
            value={state.rws.airbustProximityFuseM}
            readOnly
            className="w-full accent-amber-500 h-1.5 rounded cursor-not-allowed opacity-70"
          />
        </div>

        {/* Row 4: Two buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onAuthorizeRoe(!state.rws.roeAuthorized)}
            className={`flex-1 py-1.5 px-2 rounded text-[10px] font-bold border transition flex items-center justify-center space-x-1.5 ${
              state.rws.roeAuthorized
                ? 'bg-amber-50 border-amber-300 text-amber-700'
                : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700'
            }`}
          >
            {state.rws.roeAuthorized ? <Unlock className="w-3.5 h-3.5 text-amber-600" /> : <Lock className="w-3.5 h-3.5 text-slate-400" />}
            <span>ROE AUTHORIZED</span>
          </button>

          <button
            onClick={() => setShowFireModal(true)}
            disabled={state.rws.fireMode !== 'WEAPONS_FREE' || !state.rws.roeAuthorized}
            className={`flex-1 py-1.5 px-2 rounded text-[10px] font-bold border transition ${
              state.rws.fireMode === 'WEAPONS_FREE' && state.rws.roeAuthorized
                ? 'bg-rose-600 hover:bg-rose-700 border-rose-500 text-white shadow-[0_0_8px_rgba(225,29,72,0.6)] cursor-pointer'
                : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            FIRE BURST (×3 RD)
          </button>
        </div>
      </div>

      {/* Two-Step RWS Fire Confirmation Modal */}
      {showFireModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-2 border-rose-400 rounded-lg max-w-md w-full p-4 shadow-2xl space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center space-x-2 text-rose-600">
                <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse" />
                <span className="font-bold text-sm tracking-wider">35MM RWS ENGAGEMENT INTERLOCK</span>
              </div>
              <button
                onClick={() => {
                  setShowFireModal(false);
                  setFireModalStep(1);
                }}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {fireSuccessful ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border-2 border-emerald-400 mx-auto flex items-center justify-center text-emerald-600">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-emerald-600 font-bold text-base">35mm AHEAD BURST DISCHARGED</h4>
                <p className="text-slate-500 text-xs">
                  Target neutralized. Returning to SAFE condition.
                </p>
              </div>
            ) : fireModalStep === 1 ? (
              <div className="space-y-3 text-xs">
                <p className="text-slate-600">
                  You are preparing to discharge the 35mm RWS at target <strong className="text-rose-600">{state.rws.fcrLockTargetId || 'UNKNOWN'}</strong>.
                </p>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Effective Range:</span>
                    <span className="text-slate-800 font-bold">{state.rws.effectiveRangeM?.min} - {state.rws.effectiveRangeM?.max} m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Burst Radius:</span>
                    <span className="text-amber-600 font-bold">{state.rws.airbustProximityFuseM}m Prox Fuse</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ammo Count:</span>
                    <span className="text-emerald-600 font-bold">{state.rws.ammoRoundsRemaining} RD Remaining</span>
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    onClick={() => setShowFireModal(false)}
                    className="flex-1 py-2 rounded bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 text-xs"
                  >
                    ABORT
                  </button>
                  <button
                    onClick={() => setFireModalStep(2)}
                    className="flex-1 py-2 rounded bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs"
                  >
                    STEP 2: CONFIRM INTERLOCK
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="bg-rose-50 p-3 rounded border border-rose-200 text-rose-700">
                  <span className="font-bold block text-sm mb-1">⚠ CAUTION: FINAL ENGAGEMENT AUTHORIZATION</span>
                  Pressing DISCHARGE will fire a 3-round 35mm AHEAD burst immediately. Ensure downrange is clear of friendlies.
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    onClick={() => setFireModalStep(1)}
                    className="flex-1 py-2 rounded bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 text-xs"
                  >
                    BACK
                  </button>
                  <button
                    onClick={handleFireRws}
                    className="flex-1 py-2 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm"
                  >
                    ⚡ DISCHARGE 35mm BURST
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
