'use client';

import React, { useState } from 'react';
import { IncursionLogEvent } from '@/types/dashboard';
import { ListFilter, Search, Download, ShieldAlert, AlertTriangle, CheckCircle, Info, Zap } from 'lucide-react';

interface IncursionEventLogProps {
  events: IncursionLogEvent[];
}

export const IncursionEventLog: React.FC<IncursionEventLogProps> = ({ events }) => {
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'ALERT' | 'WARNING' | 'SUCCESS'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEvents = events.filter((e) => {
    if (filterSeverity !== 'ALL' && e.severity !== filterSeverity) return false;
    if (searchTerm.trim()) {
      const match = `${e.title} ${e.details} ${e.sensorSource} ${e.targetId || ''}`.toLowerCase();
      if (!match.includes(searchTerm.toLowerCase())) return false;
    }
    return true;
  });

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(events, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `CUAS_MISSION_LOG_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="bg-tactical-panel border border-tactical-panelBorder rounded-lg p-3 shadow-lg flex flex-col space-y-2 font-mono">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-2">
        <div className="flex items-center space-x-2">
          <ListFilter className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-emerald-400 tracking-wider">
            LIVE INCURSION & TELEMETRY AUDIT LOG
          </span>
          <span className="text-[10px] text-zinc-500">[{events.length} EVENTS]</span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3 h-3 text-zinc-500 absolute left-2 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded pl-7 pr-2 py-0.5 text-[9px] text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 w-32"
            />
          </div>

          {/* Severity Filters */}
          <div className="flex rounded bg-zinc-900 border border-zinc-800 p-0.5 text-[9px]">
            {(['ALL', 'ALERT', 'WARNING', 'SUCCESS'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-1.5 py-0.5 rounded transition ${
                  filterSeverity === sev
                    ? 'bg-emerald-600/30 text-emerald-300 font-bold border border-emerald-500/50'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* Export button */}
          <button
            onClick={handleExportJson}
            title="Export mission logs"
            className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Events Table */}
      <div className="h-[170px] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-6 text-[10px] text-zinc-500">
            No events match current filter.
          </div>
        ) : (
          filteredEvents.map((evt) => {
            const isAlert = evt.severity === 'ALERT';
            const isWarning = evt.severity === 'WARNING';
            const isSuccess = evt.severity === 'SUCCESS';

            const sevBorder = isAlert
              ? 'border-l-red-500 bg-red-950/20'
              : isWarning
              ? 'border-l-amber-500 bg-amber-950/20'
              : isSuccess
              ? 'border-l-emerald-500 bg-emerald-950/20'
              : 'border-l-cyan-500 bg-zinc-900/40';

            return (
              <div
                key={evt.id}
                className={`p-1.5 rounded border border-zinc-800/80 border-l-4 text-[10px] flex items-start justify-between space-x-2 ${sevBorder}`}
              >
                <div className="flex items-start space-x-2">
                  {isAlert ? (
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                  ) : isWarning ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                  ) : isSuccess ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Info className="w-3.5 h-3.5 text-cyan-400 mt-0.5 flex-shrink-0" />
                  )}

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-zinc-200">{evt.title}</span>
                      {evt.targetId && (
                        <span className="text-[8px] bg-zinc-800 text-cyan-300 px-1 rounded">
                          {evt.targetId}
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] text-zinc-400 mt-0.5">{evt.details}</p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-[8px] text-zinc-500 block">{evt.timestamp}</span>
                  <span className="text-[7px] text-zinc-400 bg-zinc-950 px-1 py-0.5 rounded border border-zinc-800">
                    {evt.sensorSource}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
