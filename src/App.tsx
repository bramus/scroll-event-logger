/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Trash2, ArrowDown, ArrowRight, Activity } from 'lucide-react';

interface LogEntry {
  id: string;
  type: 'scroll' | 'scrollend';
  timestamp: string;
  details: string;
}

export default function App() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [metrics, setMetrics] = useState({
    scrollLeft: 0,
    scrollTop: 0,
    scrollRight: 0, // Calculated: scrollWidth - clientWidth - scrollLeft
    scrollBottom: 0, // Calculated: scrollHeight - clientHeight - scrollTop
  });

  // Helper to format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    });
  };

  const addLog = useCallback((type: 'scroll' | 'scrollend') => {
    setLogs((prev) => {
      const newLog: LogEntry = {
        id: crypto.randomUUID(),
        type,
        timestamp: formatTime(new Date()),
        details: type === 'scroll' ? 'Scrolling...' : 'Scroll operation completed',
      };
      // Keep last 50 logs to prevent performance issues
      return [...prev.slice(-49), newLog];
    });
  }, []);

  const updateMetrics = useCallback(() => {
    if (scrollerRef.current) {
      const { scrollLeft, scrollTop, scrollWidth, clientWidth, scrollHeight, clientHeight } = scrollerRef.current;
      setMetrics({
        scrollLeft: Math.round(scrollLeft),
        scrollTop: Math.round(scrollTop),
        scrollRight: Math.round(scrollWidth - clientWidth - scrollLeft),
        scrollBottom: Math.round(scrollHeight - clientHeight - scrollTop),
      });
    }
  }, []);

  useEffect(() => {
    const element = scrollerRef.current;
    if (!element) return;

    const handleScroll = () => {
      addLog('scroll');
      updateMetrics();
    };

    const handleScrollEnd = () => {
      addLog('scrollend');
      updateMetrics();
    };

    // We use addEventListener to support 'scrollend' which might not be fully typed in React's onScroll yet
    // or to ensure consistent behavior.
    element.addEventListener('scroll', handleScroll);
    element.addEventListener('scrollend', handleScrollEnd);

    // Initial metrics
    updateMetrics();

    return () => {
      element.removeEventListener('scroll', handleScroll);
      element.removeEventListener('scrollend', handleScrollEnd);
    };
  }, [addLog, updateMetrics]);

  // Auto-scroll logs to bottom
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="h-screen bg-neutral-50 flex flex-col overflow-hidden font-sans text-neutral-900">
      <header className="shrink-0 p-4 md:p-6 pb-0 flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Scroll Event Logger</h1>
        <p className="text-neutral-500">
          Scroll the pane on the left to see events and coordinates update in real-time.
        </p>
      </header>

      <main className="flex-1 min-h-0 p-4 md:p-6 grid grid-cols-1 grid-rows-2 lg:grid-cols-2 lg:grid-rows-1 gap-4 md:gap-6">
        {/* Left Pane: Scrollable Area */}
        <section className="flex flex-col gap-3 min-h-0 h-full">
          <div className="shrink-0 flex items-center justify-between">
            <h2 className="font-semibold text-neutral-700 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Scrollable Region
            </h2>
            <span className="text-xs text-neutral-400 font-mono">overflow: auto</span>
          </div>
          
          <div 
            ref={scrollerRef}
            className="flex-1 border border-neutral-200 rounded-xl bg-white shadow-sm overflow-auto relative"
          >
            {/* Large content to force scroll */}
            <div 
              className="w-[200%] h-[200%] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"
              style={{ minWidth: '800px', minHeight: '800px' }}
            >
              <div className="p-8 grid gap-8">
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg inline-block">
                  Top Left Content
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-50 border border-purple-100 p-4 rounded-lg">
                  Center Content
                </div>
                <div className="absolute bottom-8 right-8 bg-emerald-50 border border-emerald-100 p-4 rounded-lg">
                  Bottom Right Content
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Pane: Logs & Metrics */}
        <section className="flex flex-col gap-4 min-h-0 h-full">
          
          {/* Event Log */}
          <div className="flex-1 flex flex-col gap-3 min-h-0">
            <div className="shrink-0 flex items-center justify-between">
              <h2 className="font-semibold text-neutral-700">Event Log</h2>
              <button 
                onClick={() => setLogs([])}
                className="text-xs flex items-center gap-1 text-neutral-500 hover:text-red-600 transition-colors px-2 py-1 rounded hover:bg-neutral-100"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
            </div>
            
            <div className="flex-1 border border-neutral-200 rounded-xl bg-white shadow-sm overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-sm">
                {logs.length === 0 && (
                  <div className="h-full flex items-center justify-center text-neutral-400 italic">
                    No events yet. Start scrolling!
                  </div>
                )}
                {logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 animate-in fade-in slide-in-from-left-2 duration-200">
                    <span className="text-neutral-400 shrink-0 select-none">{log.timestamp}</span>
                    <span className={`font-medium ${log.type === 'scrollend' ? 'text-indigo-600' : 'text-amber-600'}`}>
                      {log.type}
                    </span>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="shrink-0 flex flex-col gap-3">
            <h2 className="font-semibold text-neutral-700">Live Metrics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-3 md:p-4 rounded-xl border border-neutral-200 shadow-sm flex flex-col gap-1">
                <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider flex items-center gap-1">
                  <ArrowRight className="w-3 h-3" /> Scroll Left
                </span>
                <span className="text-xl md:text-2xl font-mono font-semibold text-neutral-900">{metrics.scrollLeft}px</span>
              </div>
              
              <div className="bg-white p-3 md:p-4 rounded-xl border border-neutral-200 shadow-sm flex flex-col gap-1">
                <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider flex items-center gap-1">
                  <ArrowRight className="w-3 h-3 rotate-180" /> Scroll Right
                </span>
                <span className="text-xl md:text-2xl font-mono font-semibold text-neutral-900">{metrics.scrollRight}px</span>
              </div>

              <div className="bg-white p-3 md:p-4 rounded-xl border border-neutral-200 shadow-sm flex flex-col gap-1">
                <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider flex items-center gap-1">
                  <ArrowDown className="w-3 h-3" /> Scroll Top
                </span>
                <span className="text-xl md:text-2xl font-mono font-semibold text-neutral-900">{metrics.scrollTop}px</span>
              </div>

              <div className="bg-white p-3 md:p-4 rounded-xl border border-neutral-200 shadow-sm flex flex-col gap-1">
                <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider flex items-center gap-1">
                  <ArrowDown className="w-3 h-3 rotate-180" /> Scroll Bottom
                </span>
                <span className="text-xl md:text-2xl font-mono font-semibold text-neutral-900">{metrics.scrollBottom}px</span>
              </div>
            </div>
          </div>

        </section>
      </main>
    </div>
  );
}
