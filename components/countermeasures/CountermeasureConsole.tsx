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
  onArmNetLauncher: (armed: boolean) => void;
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
  onArmNetLauncher,
  onTriggerDefrost,
  onLogAction,
}) => {
  const [showNetLauncherModal, setShowNetLauncherModal] = useState(false);
  const [netModalStep, setNetModalStep] = useState<1 | 2>(1);
  const [launchSuccessful, setLaunchSuccessful] = useState(false);

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

  const handleLaunchNet = () => {
    setLaunchSuccessful(true);
    soundEngine?.playNeutralizedChime();
    onLogAction(
      'Kinetic Net Launcher Discharged',
      'Pneumatic CO₂ canister fired calibrated kevlar capture net at target envelope (350m range).',
      'SUCCESS'
    );
    setTimeout(() => {
      setShowNetLauncherModal(false);
      setNetModalStep(1);
      setLaunchSuccessful(false);
      onArmNetLauncher(false);
    }, 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex flex-col space-y-3 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
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
        <div className="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-sky-700 flex items-center space-x-1.5">
              <Radio className="w-3.5 h-3.5 text-sky-600" />
              <span>DIRECTIONAL SMART RF JAMMING</span>
            </span>
            <span className="text-[9px] text-slate-500">Azimuth: 042°</span>
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
              <span className="text-amber-600 font-bold">{state.jammingPowerEirpWatts} W EIRP</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={state.jammingPowerEirpWatts}
              onChange={(e) => onSetPower(Number(e.target.value))}
              className="w-full accent-amber-500 h-1.5 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Section 2: Optical Gimbal & Kinetic Net Launcher */}
        <div className="space-y-2">
          {/* PTZ Gimbal Auto-Slew Lock */}
          <div className="bg-slate-50 p-2.5 rounded border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-violet-700 flex items-center space-x-1 mb-0.5">
                <Camera className="w-3.5 h-3.5 text-violet-600" />
                <span>PTZ GIMBAL SLEW-TO-CUE</span>
              </span>
              <span className="text-[8px] text-slate-400 block">
                Harmonic drive tracking Azimuth 042° / Elev +14.5°
              </span>
            </div>

            <button
              onClick={onToggleGimbal}
              className={`py-1.5 px-3 rounded text-[10px] font-bold border transition ${
                state.opticalGimbalLocked
                  ? 'bg-violet-50 border-violet-300 text-violet-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {state.opticalGimbalLocked ? 'LOCK ENGAGED' : 'ENGAGE SLEW'}
            </button>
          </div>

          {/* High-Altitude Kinetic Net Launcher (Calibrated Pneumatic) */}
          <div className="bg-slate-50 p-2.5 rounded border border-rose-200 flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-rose-600 flex items-center space-x-1.5">
                <Crosshair className="w-3.5 h-3.5 text-rose-500" />
                <span>PNEUMATIC NET LAUNCHER</span>
              </span>
              <span className="text-[8px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                50m - 500m CAPTURE
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onArmNetLauncher(!state.netLauncherArmed)}
                className={`flex-1 py-1.5 px-2 rounded text-[10px] font-bold border flex items-center justify-center space-x-1.5 transition ${
                  state.netLauncherArmed
                    ? 'bg-amber-50 border-amber-300 text-amber-700 animate-pulse'
                    : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700'
                }`}
              >
                {state.netLauncherArmed ? <Unlock className="w-3.5 h-3.5 text-amber-600" /> : <Lock className="w-3.5 h-3.5 text-slate-400" />}
                <span>{state.netLauncherArmed ? 'ARMED / HOT' : 'SAFETY LOCKED'}</span>
              </button>

              <button
                onClick={() => {
                  if (state.netLauncherArmed) {
                    setShowNetLauncherModal(true);
                  }
                }}
                disabled={!state.netLauncherArmed}
                className={`flex-1 py-1.5 px-2 rounded text-[10px] font-bold border transition ${
                  state.netLauncherArmed
                    ? 'bg-rose-600 hover:bg-rose-700 border-rose-500 text-white shadow-sm cursor-pointer'
                    : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                FIRE KINETIC NET
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Step Kinetic Net Confirmation Modal */}
      {showNetLauncherModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-2 border-rose-400 rounded-lg max-w-md w-full p-4 shadow-2xl space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center space-x-2 text-rose-600">
                <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse" />
                <span className="font-bold text-sm tracking-wider">KINETIC DISCHARGE INTERLOCK</span>
              </div>
              <button
                onClick={() => {
                  setShowNetLauncherModal(false);
                  setNetModalStep(1);
                }}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {launchSuccessful ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border-2 border-emerald-400 mx-auto flex items-center justify-center text-emerald-600">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-emerald-600 font-bold text-base">CAPTURE NET DEPLOYED</h4>
                <p className="text-slate-500 text-xs">
                  CO₂ pneumatic launch pressure: 220 bar. Kevlar shroud deployed at 350m range. Target entangled and neutralized.
                </p>
              </div>
            ) : netModalStep === 1 ? (
              <div className="space-y-3 text-xs">
                <p className="text-slate-600">
                  You are preparing to discharge the high-altitude pneumatic capture net at target <strong className="text-rose-600">TRK-H-809</strong>.
                </p>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target Distance:</span>
                    <span className="text-slate-800 font-bold">350 m (Optimal Envelope)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Air Density Compensation:</span>
                    <span className="text-amber-600 font-bold">+18% Nitrogen Charge applied</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Collateral Risk:</span>
                    <span className="text-emerald-600 font-bold">ZERO (Barren Mountain Pass)</span>
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    onClick={() => setShowNetLauncherModal(false)}
                    className="flex-1 py-2 rounded bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 text-xs"
                  >
                    ABORT
                  </button>
                  <button
                    onClick={() => setNetModalStep(2)}
                    className="flex-1 py-2 rounded bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs"
                  >
                    STEP 2: CONFIRM LOCK
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="bg-rose-50 p-3 rounded border border-rose-200 text-rose-700">
                  <span className="font-bold block text-sm mb-1">⚠ FINAL LAUNCH AUTHORIZATION</span>
                  Pressing DISCHARGE will fire the pyrotechnic pneumatic actuator immediately.
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    onClick={() => setNetModalStep(1)}
                    className="flex-1 py-2 rounded bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 text-xs"
                  >
                    BACK
                  </button>
                  <button
                    onClick={handleLaunchNet}
                    className="flex-1 py-2 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm"
                  >
                    ⚡ DISCHARGE NET NOW
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
