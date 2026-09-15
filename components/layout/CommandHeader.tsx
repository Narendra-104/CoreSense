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
  Clock,
  MapPin,
  AlertTriangle,
  Zap,
  FastForward,
  ChevronRight,
  Crosshair,
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

      // IST is UTC + 5:30
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
        return 'bg-red-600 text-white border-red-500 animate-pulse';
      case 2:
        return 'bg-red-950 text-red-400 border-red-700 animate-pulse';
      case 3:
        return 'bg-amber-950 text-amber-400 border-amber-700';
      case 4:
        return 'bg-emerald-950 text-emerald-400 border-emerald-800';
      default:
        return 'bg-zinc-900 text-zinc-400 border-zinc-700';
    }
  };

  return (
    <header className="bg-tactical-panel border-b border-tactical-panelBorder p-3 shadow-2xl font-mono text-xs">
      {/* Top Station Context Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-zinc-800/80">
        {/* Unit & Grid Identifier */}
        <div className="flex items-center space-x-3">
          <div className="p-1.5 rounded bg-emerald-950/80 border border-emerald-600 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
            <Shield className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm md:text-base font-bold text-white tracking-wider">
                CoreSense
              </h1>
              <span className="text-[10px] bg-zinc-900 text-cyan-300 border border-zinc-700 px-1.5 py-0.5 rounded font-bold">
                HIGH-ALTITUDE ANTI-DRONE
              </span>
            </div>

            <div className="flex items-center space-x-2 text-[10px] text-zinc-400">
              <span className="text-emerald-400 font-bold">HA-LADAKH-SECTOR-4</span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-zinc-500" />
                <span>34.1526° N, 77.5771° E (4,850m MSL)</span>
              </span>
            </div>
          </div>
        </div>

        {/* System Posture & Uplinks */}
        <div className="flex flex-wrap items-center gap-2">
          {/* DEFCON Badge */}
          <div className="flex items-center space-x-1.5 bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
            <span className="text-[9px] text-zinc-400">POSTURE:</span>
            <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getDefconBadge(network.defconLevel)}`}>
              DEFCON {network.defconLevel}
            </span>
          </div>

          {/* Readiness State */}
          <div className="flex items-center space-x-1.5 bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
            <span className="text-[9px] text-zinc-400">SYSTEM:</span>
            <span
              className={`text-[10px] font-bold ${
                network.readinessState === 'ENGAGING'
                  ? 'text-red-400 animate-pulse'
                  : network.readinessState === 'OPTIMAL'
                  ? 'text-emerald-400'
                  : 'text-amber-400'
              }`}
            >
              ● {network.readinessState}
            </span>
          </div>

          {/* SATCOM Telemetry */}
          <div className="flex items-center space-x-1.5 bg-zinc-950 px-2 py-1 rounded border border-zinc-800 text-[10px]">
            <Satellite className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-zinc-400">SATCOM:</span>
            <span className="text-cyan-300 font-bold">{network.satcomLatencyMs}ms ({network.satcomSnrDb}dB)</span>
          </div>

          {/* LoRa Mesh Telemetry */}
          <div className="flex items-center space-x-1.5 bg-zinc-950 px-2 py-1 rounded border border-zinc-800 text-[10px]">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-zinc-400">LoRa 868M:</span>
            <span className="text-emerald-300 font-bold">4 Nodes MESH OK</span>
          </div>

          {/* SQLite Buffer */}
          <div className="flex items-center space-x-1.5 bg-zinc-950 px-2 py-1 rounded border border-zinc-800 text-[10px]">
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-zinc-400">EDGE BUFFER:</span>
            <span className="text-amber-300 font-bold">0 UNSYNCED</span>
          </div>

          {/* Audio Sound Toggle */}
          <button
            onClick={handleToggleMute}
            className={`p-1.5 rounded border transition ${
              isMuted
                ? 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                : 'bg-emerald-950/70 border-emerald-700 text-emerald-400 hover:bg-emerald-900/80'
            }`}
            title={isMuted ? 'Unmute tactical audio' : 'Mute tactical audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-pulse" />}
          </button>

          {/* Clocks */}
          <div className="text-right text-[10px] text-zinc-400 pl-1 border-l border-zinc-800">
            <div className="text-white font-bold">{timeUtc}</div>
            <div className="text-zinc-500 text-[9px]">{timeIst}</div>
          </div>
        </div>
      </div>

      {/* Presentation Pitch & Scripted Incursion Engine Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Main Demo Action Button */}
          {!demoState.isRunning && demoState.elapsedSeconds === 0 ? (
            <button
              onClick={onStartDemo}
              className="flex items-center space-x-1.5 px-3 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-bold border border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-pulse transition"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>[DEMO MODE: SCRIPTED INCURSION]</span>
            </button>
          ) : demoState.isRunning ? (
            <button
              onClick={onPauseDemo}
              className="flex items-center space-x-1.5 px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 text-black font-bold border border-amber-400 transition"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>PAUSE DEMO</span>
            </button>
          ) : (
            <button
              onClick={onResumeDemo}
              className="flex items-center space-x-1.5 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold border border-emerald-400 transition"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>RESUME DEMO</span>
            </button>
          )}

          {/* Reset button */}
          <button
            onClick={onResetDemo}
            className="p-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            title="Reset Scenario to Baseline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Phase scrubber buttons */}
          <div className="flex rounded bg-zinc-950 border border-zinc-800 p-0.5 text-[9px]">
            {([0, 1, 2, 3, 4] as DemoPhase[]).map((phase) => (
              <button
                key={phase}
                onClick={() => onJumpToPhase(phase)}
                className={`px-2 py-0.5 rounded transition ${
                  demoState.currentPhase === phase
                    ? 'bg-red-600/30 text-red-300 font-bold border border-red-500/50'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                P{phase}
              </button>
            ))}
          </div>

          {/* Speed multiplier */}
          <div className="flex items-center space-x-1 bg-zinc-950 border border-zinc-800 rounded px-1.5 py-0.5 text-[9px]">
            <span className="text-zinc-500">SPEED:</span>
            {([1, 2, 5] as const).map((spd) => (
              <button
                key={spd}
                onClick={() => onSetSpeed(spd)}
                className={`px-1 py-0.5 rounded ${
                  demoState.playbackSpeed === spd
                    ? 'bg-cyan-500/30 text-cyan-300 font-bold border border-cyan-500/50'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Current Demo Scenario Phase Banner */}
        <div className="flex items-center space-x-2 text-[10px] bg-zinc-950/80 px-2.5 py-1 rounded border border-zinc-800 text-zinc-300">
          <span className="text-amber-400 font-bold">TIMELINE: T+{demoState.elapsedSeconds}s</span>
          <ChevronRight className="w-3 h-3 text-zinc-600" />
          <span className="text-zinc-200 font-medium">{demoState.phaseDescription}</span>
        </div>

        {/* Manual Target Injector for Presenters */}
        <div className="flex items-center space-x-1 text-[9px]">
          <span className="text-zinc-500">INJECT:</span>
          <button
            onClick={() => onInjectTarget('HOSTILE')}
            className="px-1.5 py-0.5 rounded bg-red-950/80 border border-red-800 text-red-300 hover:bg-red-900 transition"
          >
            +Hostile
          </button>
          <button
            onClick={() => onInjectTarget('UNIDENTIFIED')}
            className="px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-800 text-amber-300 hover:bg-amber-900 transition"
          >
            +Anomaly
          </button>
          <button
            onClick={() => onInjectTarget('FRIENDLY')}
            className="px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-300 hover:bg-emerald-900 transition"
          >
            +Friendly
          </button>
        </div>
      </div>
    </header>
  );
};
