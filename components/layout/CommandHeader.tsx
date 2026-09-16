'use client';

import React, { useState, useEffect } from 'react';
import { NetworkHealth, DemoScenarioState, DemoPhase } from '@/types/dashboard';
import { soundEngine } from '@/utils/soundSynthesizer';
import {
  Shield,
  Radio,
  Satellite,
  Database,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  MapPin,
  ChevronRight,
} from 'lucide-react';

interface CommandHeaderProps {
  network: NetworkHealth;
  demoState: DemoScenarioState;
  onStartDemo: () => void;
  onPauseDemo: () => void;
  onResumeDemo: () => void;
  onResetDemo: () => void;
  onJumpToPhase: (phase: DemoPhase) => void;
  onSetSpeed: (speed: 1 | 2 | 5) => void;
  onInjectTarget: (type: 'HOSTILE' | 'UNIDENTIFIED' | 'FRIENDLY') => void;
}

export const CommandHeader: React.FC<CommandHeaderProps> = ({
  network,
  demoState,
  onStartDemo,
  onPauseDemo,
  onResumeDemo,
  onResetDemo,
  onJumpToPhase,
  onSetSpeed,
  onInjectTarget,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [timeUtc, setTimeUtc] = useState('');
  const [timeIst, setTimeIst] = useState('');

  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      setTimeUtc(
        `${now.getUTCHours().toString().padStart(2, '0')}:${now.getUTCMinutes().toString().padStart(2, '0')}:${now.getUTCSeconds().toString().padStart(2, '0')} UTC`
      );

      const istTime = new Date(now.getTime() + 5.5 * 3600 * 1000);
      setTimeIst(
        `${istTime.getUTCHours().toString().padStart(2, '0')}:${istTime.getUTCMinutes().toString().padStart(2, '0')}:${istTime.getUTCSeconds().toString().padStart(2, '0')} IST`
      );
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundEngine?.setMuted(nextMuted);
    if (!nextMuted) {
      soundEngine?.playRadarBlip();
    }
  };

  const getDefconBadge = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-rose-600 text-white border-rose-600 animate-pulse';
      case 2:
        return 'bg-rose-100 text-rose-800 border-rose-300 font-bold animate-pulse';
      case 3:
        return 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
      case 4:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 p-3 shadow-sm font-mono text-xs">
      {/* Top Station Context Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-slate-100">
        {/* Unit & Grid Identifier */}
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-sky-50 border border-sky-200 text-sky-600 shadow-sm">
            <Shield className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-slate-900 tracking-wide">
                CoreSense
              </h1>
              <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-full font-semibold">
                HIGH-ALTITUDE ANTI-DRONE
              </span>
            </div>

            <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
              <span className="text-sky-700 font-semibold">HA-LADAKH-SECTOR-4</span>
              <span>•</span>
              <span className="flex items-center space-x-1 text-slate-500">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>34.1526° N, 77.5771° E (4,850m MSL)</span>
              </span>
            </div>

            {/* Hardware Status Strip */}
            <div className="flex items-center space-x-1.5 mt-1.5 flex-wrap gap-y-1">
              <span className="text-[9px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-bold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>AGT3DRD5000X</span>
              </span>
              <span className="text-[9px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-bold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>USRP B210 ×3</span>
              </span>
              <span className="text-[9px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-bold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>XBOOM A30TR1575</span>
              </span>
              <span className="text-[9px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-bold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>GUARDIAN-S08</span>
              </span>
              <span className="text-[9px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-bold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>RWS 35mm</span>
              </span>
            </div>
          </div>
        </div>

        {/* System Posture & Uplinks */}
        <div className="flex flex-wrap items-center gap-2">
          {/* DEFCON Badge */}
          <div className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
            <span className="text-[10px] text-slate-500 font-medium">POSTURE:</span>
            <span className={`px-2 py-0.5 rounded border text-[10px] ${getDefconBadge(network.defconLevel)}`}>
              DEFCON {network.defconLevel}
            </span>
          </div>

          {/* Readiness State */}
          <div className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
            <span className="text-[10px] text-slate-500 font-medium">STATUS:</span>
            <span
              className={`text-[10px] font-bold ${
                network.readinessState === 'ENGAGING'
                  ? 'text-rose-600 animate-pulse'
                  : network.readinessState === 'OPTIMAL'
                  ? 'text-emerald-600'
                  : 'text-amber-600'
              }`}
            >
              ● {network.readinessState}
            </span>
          </div>

          {/* SATCOM Telemetry */}
          <div className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 text-[10px]">
            <Satellite className="w-3.5 h-3.5 text-sky-600" />
            <span className="text-slate-500">SATCOM:</span>
            <span className="text-slate-800 font-bold">{network.satcomLatencyMs}ms</span>
          </div>

          {/* LoRa Mesh */}
          <div className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 text-[10px]">
            <Radio className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-slate-500">LoRa 868M:</span>
            <span className="text-emerald-700 font-bold">4 Nodes OK</span>
          </div>

          {/* SQLite Buffer */}
          <div className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 text-[10px]">
            <Database className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-slate-500">BUFFER:</span>
            <span className="text-slate-800 font-bold">0 UNSYNCED</span>
          </div>

          {/* Audio Sound Toggle */}
          <button
            onClick={handleToggleMute}
            className={`p-1.5 rounded-md border transition ${
              isMuted
                ? 'bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-600'
                : 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100'
            }`}
            title={isMuted ? 'Unmute tactical audio' : 'Mute tactical audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Clocks */}
          <div className="text-right text-[10px] pl-2 border-l border-slate-200">
            <div className="text-slate-900 font-bold">{timeUtc}</div>
            <div className="text-slate-500 text-[9px]">{timeIst}</div>
          </div>
        </div>
      </div>

      {/* Presentation Pitch & Scripted Incursion Engine Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {/* Main Demo Action Button */}
          {!demoState.isRunning && demoState.elapsedSeconds === 0 ? (
            <button
              onClick={onStartDemo}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-sm transition"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>RUN DEMO INCURSION</span>
            </button>
          ) : demoState.isRunning ? (
            <button
              onClick={onPauseDemo}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-amber-500 hover:bg-amber-400 text-white font-bold shadow-sm transition"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>PAUSE DEMO</span>
            </button>
          ) : (
            <button
              onClick={onResumeDemo}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-sm transition"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>RESUME DEMO</span>
            </button>
          )}

          {/* Reset button */}
          <button
            onClick={onResetDemo}
            className="p-1.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition"
            title="Reset Scenario to Baseline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Phase scrubber buttons */}
          <div className="flex rounded-md bg-slate-100 border border-slate-200 p-0.5 text-[10px]">
            {([0, 1, 2, 3, 4] as DemoPhase[]).map((phase) => (
              <button
                key={phase}
                onClick={() => onJumpToPhase(phase)}
                className={`px-2 py-1 rounded transition ${
                  demoState.currentPhase === phase
                    ? 'bg-rose-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                P{phase}
              </button>
            ))}
          </div>

          {/* Speed multiplier */}
          <div className="flex items-center space-x-1 bg-slate-100 border border-slate-200 rounded-md px-2 py-1 text-[10px]">
            <span className="text-slate-500 font-medium">SPEED:</span>
            {([1, 2, 5] as const).map((spd) => (
              <button
                key={spd}
                onClick={() => onSetSpeed(spd)}
                className={`px-1.5 py-0.5 rounded ${
                  demoState.playbackSpeed === spd
                    ? 'bg-sky-600 text-white font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Current Demo Scenario Phase Banner */}
        <div className="flex items-center space-x-2 text-[11px] bg-slate-50 px-3 py-1 rounded-md border border-slate-200 text-slate-700">
          <span className="text-amber-700 font-bold">TIMELINE: T+{demoState.elapsedSeconds}s</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 font-medium">{demoState.phaseDescription}</span>
        </div>

        {/* Manual Target Injector */}
        <div className="flex items-center space-x-1 text-[10px]">
          <span className="text-slate-500 font-medium">INJECT:</span>
          <button
            onClick={() => onInjectTarget('HOSTILE')}
            className="px-2 py-1 rounded-md bg-rose-50 border border-rose-200 text-rose-700 font-semibold hover:bg-rose-100 transition"
          >
            +Hostile
          </button>
          <button
            onClick={() => onInjectTarget('UNIDENTIFIED')}
            className="px-2 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-700 font-semibold hover:bg-amber-100 transition"
          >
            +Anomaly
          </button>
          <button
            onClick={() => onInjectTarget('FRIENDLY')}
            className="px-2 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold hover:bg-emerald-100 transition"
          >
            +Friendly
          </button>
        </div>
      </div>
    </header>
  );
};
