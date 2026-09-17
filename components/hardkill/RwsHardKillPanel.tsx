'use client';

import React, { useState } from 'react';
import { RwsState, RwsFireMode } from '@/types/dashboard';
import { soundEngine } from '@/utils/soundSynthesizer';
import {
  Crosshair,
  Lock,
  Unlock,
  AlertTriangle,
  Check,
  X,
  ShieldAlert,
  Gauge,
  Thermometer,
} from 'lucide-react';

interface RwsHardKillPanelProps {
  state: RwsState;
  onSetRwsFireMode: (mode: RwsFireMode) => void;
  onAuthorizeRoe: (auth: boolean) => void;
  onFireRwsBurst: () => void;
  onLogAction: (title: string, details: string, severity: 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS') => void;
}

export const RwsHardKillPanel: React.FC<RwsHardKillPanelProps> = ({
  state,
  onSetRwsFireMode,
  onAuthorizeRoe,
  onFireRwsBurst,
  onLogAction,
}) => {
  const [showFireModal, setShowFireModal] = useState(false);
  const [fireModalStep, setFireModalStep] = useState<1 | 2>(1);
  const [fireSuccessful, setFireSuccessful] = useState(false);

  const handleFireRws = () => {
    setFireSuccessful(true);
    soundEngine?.playNeutralizedChime();
    onFireRwsBurst();
    onLogAction(
      '35mm AHEAD Burst Discharged',
      '35–40mm RWS fired 3 rounds calibrated airburst ammunition at designated target envelope.',
      'SUCCESS'
    );
    setTimeout(() => {
      setShowFireModal(false);
      setFireModalStep(1);
      setFireSuccessful(false);
      onSetRwsFireMode('SAFE');
    }, 2000);
  };

  const isWeaponsFree = state.fireMode === 'WEAPONS_FREE';
  const isArmed = state.fireMode === 'ARMED';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm flex flex-col space-y-3 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center space-x-2">
          <Crosshair className="w-4 h-4 text-rose-600 animate-pulse" />
          <span className="text-xs font-bold text-slate-900 tracking-wider">
            35–40mm RWS — AHEAD-CLASS AIRBURST HARD-KILL
          </span>
          <span className="text-[10px] text-slate-500 hidden sm:inline">
            [RANGE: 3,000 – 4,000m EFFECTIVE]
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${
              isWeaponsFree
                ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                : isArmed
                ? 'bg-amber-50 text-amber-700 border-amber-300 animate-pulse'
                : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}
          >
            {state.fireMode}
          </span>
        </div>
      </div>

      {/* Main Grid: Controls, Telemetry & Engagement Interlock */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left Column: Fire Mode Selection & Safety (4 cols) */}
        <div className="lg:col-span-4 bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-2 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-700 block mb-1.5">
              WEAPONS STATION FIRE MODE SELECTOR
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => onSetRwsFireMode('SAFE')}
                className={`py-2 px-2 rounded text-[10px] font-bold border transition ${
                  state.fireMode === 'SAFE'
                    ? 'bg-slate-200 border-slate-400 text-slate-900 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
              >
                SAFE
              </button>
              <button
                onClick={() => onSetRwsFireMode('ARMED')}
                className={`py-2 px-2 rounded text-[10px] font-bold border transition ${
                  isArmed
                    ? 'bg-amber-100 border-amber-400 text-amber-900 font-bold shadow-xs animate-pulse'
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-amber-50'
                }`}
              >
                ARMED
              </button>
              <button
                onClick={() => {
                  if (state.roeAuthorized) onSetRwsFireMode('WEAPONS_FREE');
                }}
                disabled={!state.roeAuthorized}
                className={`py-2 px-2 rounded text-[10px] font-bold border transition ${
                  isWeaponsFree
                    ? 'bg-rose-100 border-rose-400 text-rose-900 font-bold shadow-xs animate-pulse'
                    : 'bg-white border-slate-200 text-slate-400 ' +
                      (state.roeAuthorized ? 'hover:bg-rose-50 cursor-pointer' : 'opacity-50 cursor-not-allowed')
                }`}
                title={!state.roeAuthorized ? 'Requires ROE Authorization' : 'Release fire control interlock'}
              >
                WEAPONS FREE
              </button>
            </div>
          </div>

          {/* ROE Human Authorization */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <div className="text-[9px] text-slate-500">
              <span>RULES OF ENGAGEMENT:</span>
              <span className={`block font-bold ${state.roeAuthorized ? 'text-amber-700' : 'text-slate-600'}`}>
                {state.roeAuthorized ? 'ROE GRANTED' : 'SAFETY LOCKED'}
              </span>
            </div>
            <button
              onClick={() => onAuthorizeRoe(!state.roeAuthorized)}
              className={`py-1.5 px-3 rounded text-[10px] font-bold border flex items-center space-x-1.5 transition ${
                state.roeAuthorized
                  ? 'bg-amber-50 border-amber-300 text-amber-700 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {state.roeAuthorized ? (
                <Unlock className="w-3.5 h-3.5 text-amber-600" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>{state.roeAuthorized ? 'REVOKE ROE' : 'AUTHORIZE ROE'}</span>
            </button>
          </div>
        </div>

        {/* Center Column: Turret Gunnery Telemetry & Fuse Calibration (5 cols) */}
        <div className="lg:col-span-5 bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex flex-col justify-between space-y-2">
          {/* Status Metrics Strip */}
          <div className="grid grid-cols-4 gap-1.5 text-center">
            <div className="bg-white p-1.5 rounded border border-slate-200">
              <span className="text-[8px] text-slate-400 block font-medium">AMMO BAY</span>
              <span className="text-xs font-bold text-slate-900">{state.ammoRoundsRemaining} RD</span>
              <span className="text-[8px] text-slate-500 block">35mm AHEAD</span>
            </div>
            <div className="bg-white p-1.5 rounded border border-slate-200">
              <span className="text-[8px] text-slate-400 block font-medium">BARREL TEMP</span>
              <span className="text-xs font-bold text-amber-700">{state.barrelTempC}°C</span>
              <span className="text-[8px] text-slate-500 block">Nominal</span>
            </div>
            <div className="bg-white p-1.5 rounded border border-slate-200">
              <span className="text-[8px] text-slate-400 block font-medium">HYDRAULIC</span>
              <span className="text-xs font-bold text-sky-700">{state.hydraulicPressureBar} bar</span>
              <span className="text-[8px] text-slate-500 block">Operating</span>
            </div>
            <div className="bg-white p-1.5 rounded border border-slate-200">
              <span className="text-[8px] text-slate-400 block font-medium">FCR TRACK</span>
              <span className={`text-xs font-bold ${state.fcrLockActive ? 'text-rose-600' : 'text-slate-500'}`}>
                {state.fcrLockActive ? 'LOCKED' : 'TRACKING'}
              </span>
              <span className="text-[8px] text-slate-500 block">LOS Ready</span>
            </div>
          </div>

          {/* Proximity Fuse Slider & Ballistics */}
          <div className="bg-white p-2 rounded border border-slate-200 space-y-1">
            <div className="flex justify-between text-[9px] text-slate-600">
              <span>AIRBURST PROXIMITY FUSE RADIUS:</span>
              <span className="font-bold text-amber-700">{state.airbustProximityFuseM}m (Laser Cued)</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={state.airbustProximityFuseM}
              readOnly
              className="w-full accent-amber-500 h-1.5 rounded cursor-not-allowed opacity-70"
            />
            <div className="flex justify-between text-[8px] text-slate-400">
              <span>0.5m (Direct Impact)</span>
              <span>Turret Elevation: +{state.elevationDeg}°</span>
              <span>5.0m (Wide Shrapnel Cone)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Kinetic Discharge Actuator (3 cols) */}
        <div className="lg:col-span-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex flex-col justify-between space-y-2">
          <div>
            <span className="text-[10px] font-bold text-rose-700 block mb-1">
              KINETIC ENGAGEMENT TRIGGER
            </span>
            <span className="text-[9px] text-slate-500 block leading-tight">
              Pneumatic ammunition feed interlocked with FCR radar and human-in-the-loop ROE clearance.
            </span>
          </div>

          <button
            onClick={() => setShowFireModal(true)}
            disabled={!isWeaponsFree || !state.roeAuthorized}
            className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold border transition flex items-center justify-center space-x-2 ${
              isWeaponsFree && state.roeAuthorized
                ? 'bg-rose-600 hover:bg-rose-700 border-rose-500 text-white shadow-md cursor-pointer animate-pulse'
                : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Crosshair className="w-4 h-4" />
            <span>DISCHARGE 35mm BURST</span>
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
                  Target neutralized. Returning weapons station to SAFE condition.
                </p>
              </div>
            ) : fireModalStep === 1 ? (
              <div className="space-y-3 text-xs">
                <p className="text-slate-600">
                  You are preparing to discharge the 35mm RWS at target <strong className="text-rose-600">{state.fcrLockTargetId || 'INCURSION DRONE'}</strong>.
                </p>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Effective Range:</span>
                    <span className="text-slate-800 font-bold">{state.effectiveRangeM?.min} - {state.effectiveRangeM?.max} m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Burst Radius:</span>
                    <span className="text-amber-600 font-bold">{state.airbustProximityFuseM}m Prox Fuse</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ammo Remaining:</span>
                    <span className="text-emerald-600 font-bold">{state.ammoRoundsRemaining} RD Remaining</span>
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
                  Pressing DISCHARGE will fire a 3-round 35mm AHEAD airburst immediately. Ensure downrange pass is clear of friendly assets.
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
                    ⚡ DISCHARGE 35mm BURST NOW
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
