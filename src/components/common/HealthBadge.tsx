import React, { useState, useEffect } from 'react';
import { checkHealth, HealthResponse } from '../../services/api.ts';
import { Activity, RefreshCw, CheckCircle2, AlertTriangle, Server, Cpu, Database, Code } from 'lucide-react';

export const HealthBadge: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [showJson, setShowJson] = useState<boolean>(false);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    const start = performance.now();
    try {
      const data = await checkHealth();
      const end = performance.now();
      setLatency(Math.round(end - start));
      setHealth(data);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to backend health API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-stone-900 text-base">Backend Health Monitor</h3>
            <p className="text-xs text-stone-500">Live Express REST API diagnostics at <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded font-mono">/api/health</code></p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowJson(!showJson)}
            className="px-3 py-1.5 text-xs font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors flex items-center space-x-1"
          >
            <Code className="w-3.5 h-3.5" />
            <span>{showJson ? 'Hide JSON' : 'Inspect Raw JSON'}</span>
          </button>

          <button
            onClick={fetchHealth}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg transition-colors flex items-center space-x-1 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Pinging...' : 'Test Endpoint Now'}</span>
          </button>
        </div>
      </div>

      {/* Main Status Grid */}
      <div className="mt-4">
        {error ? (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Health Check Request Failed</p>
              <p className="text-xs text-amber-700 mt-1">{error}</p>
              <p className="text-xs text-amber-600 mt-2">Ensure the Express server is running on the expected port.</p>
            </div>
          </div>
        ) : health ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Status */}
            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
              <div className="flex items-center space-x-1.5 text-emerald-800 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>API Status</span>
              </div>
              <p className="mt-2 text-lg font-bold text-emerald-950 uppercase tracking-tight">{health.status}</p>
              <p className="text-[11px] text-emerald-700 mt-0.5 font-mono">HTTP 200 OK</p>
            </div>

            {/* Latency */}
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
              <div className="flex items-center space-x-1.5 text-stone-700 text-xs font-semibold">
                <Activity className="w-4 h-4 text-stone-500" />
                <span>Round-Trip Latency</span>
              </div>
              <p className="mt-2 text-lg font-bold text-stone-900">{latency !== null ? `${latency} ms` : '—'}</p>
              <p className="text-[11px] text-stone-500 mt-0.5">Local Express response</p>
            </div>

            {/* Uptime */}
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
              <div className="flex items-center space-x-1.5 text-stone-700 text-xs font-semibold">
                <Server className="w-4 h-4 text-stone-500" />
                <span>Server Uptime</span>
              </div>
              <p className="mt-2 text-lg font-bold text-stone-900">{health.uptimeSeconds}s</p>
              <p className="text-[11px] text-stone-500 mt-0.5">Node {health.system.nodeVersion}</p>
            </div>

            {/* Memory */}
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
              <div className="flex items-center space-x-1.5 text-stone-700 text-xs font-semibold">
                <Cpu className="w-4 h-4 text-stone-500" />
                <span>Heap Memory</span>
              </div>
              <p className="mt-2 text-lg font-bold text-stone-900">{health.system.memory.heapUsedMB} MB</p>
              <p className="text-[11px] text-stone-500 mt-0.5">of {health.system.memory.heapTotalMB} MB total</p>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-stone-500">Checking server health...</div>
        )}

        {/* Integration Status Breakdown */}
        {health && (
          <div className="mt-4 pt-4 border-t border-stone-100 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-stone-50 border border-stone-150">
              <span className="text-stone-600 font-medium">Firebase Admin:</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800">
                {health.integrations.firebaseAdmin.initialized ? 'Active' : 'Phase 1 Ready'}
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-stone-50 border border-stone-150">
              <span className="text-stone-600 font-medium">Security & Headers:</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                Helmet + CORS + RateLimit
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-stone-50 border border-stone-150">
              <span className="text-stone-600 font-medium">Current Phase:</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                {health.phase}
              </span>
            </div>
          </div>
        )}

        {/* Raw JSON viewer */}
        {showJson && health && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-stone-600 mb-1">
              <span className="font-mono">JSON Payload response from GET /api/health</span>
              <button
                onClick={() => navigator.clipboard.writeText(JSON.stringify(health, null, 2))}
                className="text-emerald-700 hover:underline"
              >
                Copy to clipboard
              </button>
            </div>
            <pre className="p-4 bg-stone-900 text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto max-h-72">
              {JSON.stringify(health, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
