'use client';

import React, { useState } from 'react';
import { IncursionLogEvent } from '@/types/dashboard';
import { ListFilter, Search, Download, ShieldAlert, AlertTriangle, CheckCircle, Info } from 'lucide-react';

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
    downloadAnchor.setAttribute('download', `CORESENSE_MISSION_LOG_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm flex flex-col space-y-2.5 font-mono">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div className="flex items-center space-x-2">
          <ListFilter className="w-4 h-4 text-slate-700" />
          <span className="text-xs font-bold text-slate-900 tracking-wide">
            INCURSION & TELEMETRY AUDIT LOG
          </span>
          <span className="text-[10px] text-slate-500 font-semibold">[{events.length} EVENTS]</span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-md pl-8 pr-2.5 py-1 text-[10px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white w-32"
            />
          </div>

          {/* Severity Filters */}
          <div className="flex rounded-md bg-slate-100 border border-slate-200 p-0.5 text-[10px]">
            {(['ALL', 'ALERT', 'WARNING', 'SUCCESS'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-2 py-0.5 rounded transition font-medium ${
                  filterSeverity === sev
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
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
            className="p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-slate-900 transition"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Events Table */}
      <div className="h-[170px] overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-6 text-[11px] text-slate-400">
            No events match current filter.
          </div>
        ) : (
          filteredEvents.map((evt) => {
            const isAlert = evt.severity === 'ALERT';
            const isWarning = evt.severity === 'WARNING';
            const isSuccess = evt.severity === 'SUCCESS';

            const sevBorder = isAlert
              ? 'border-l-rose-500 bg-rose-50/60 border-rose-200'
              : isWarning
              ? 'border-l-amber-500 bg-amber-50/60 border-amber-200'
              : isSuccess
              ? 'border-l-emerald-500 bg-emerald-50/60 border-emerald-200'
              : 'border-l-sky-500 bg-slate-50 border-slate-200';

            return (
              <div
                key={evt.id}
                className={`p-2 rounded-lg border border-l-4 text-[11px] flex items-start justify-between space-x-2 ${sevBorder}`}
              >
                <div className="flex items-start space-x-2">
                  {isAlert ? (
                    <ShieldAlert className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
                  ) : isWarning ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  ) : isSuccess ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Info className="w-4 h-4 text-sky-600 mt-0.5 flex-shrink-0" />
                  )}

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900">{evt.title}</span>
                      {evt.targetId && (
                        <span className="text-[9px] bg-slate-200 text-slate-800 px-1.5 py-0.2 rounded font-semibold">
                          {evt.targetId}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-600 mt-0.5">{evt.details}</p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-[9px] text-slate-500 block">{evt.timestamp}</span>
                  <span className="text-[8px] text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200 font-semibold">
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
