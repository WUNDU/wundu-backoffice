import React, { useState, useEffect } from 'react';
import { Server, RefreshCw, Activity, Cpu } from 'lucide-react';
import { AdminLayout } from '~/components/dashboard/AdminLayout';
import { systemService } from '~/services/admin/system.service';
import type { SystemHealth, SystemInfo, SystemMetrics } from '~/types/admin';

const SystemPage: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [info, setInfo] = useState<SystemInfo | null>(null);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([systemService.getHealth(), systemService.getInfo(), systemService.getMetrics()])
      .then(([h, i, m]) => { setHealth(h); setInfo(i); setMetrics(m); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const statusColor = (s: string) => s === 'UP' ? 'text-green-600' : 'text-red-500';

  return (
    <AdminLayout>
      <div className="px-6 py-5 space-y-5">
        <div className="flex justify-between items-center">
          <h1 className="text-[22px] font-semibold tracking-tight text-gray-900 flex items-center gap-2">
            <Server size={22} className="text-[#003cc3]" /> Sistema
          </h1>
          <button onClick={load} className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm text-gray-700 hover:bg-gray-50">
            <RefreshCw size={14} /> Actualizar
          </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-8">A carregar...</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {health && (
              <div className="rounded-md border border-gray-200 bg-white p-6">
                <h2 className="text-[15px] font-semibold text-gray-900 mb-4 flex items-center gap-2"><Activity size={18} className="text-[#003cc3]" /> Saúde</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Estado</span>
                    <span className={`text-sm font-semibold ${statusColor(health.status)}`}>{health.status}</span>
                  </div>
                  {health.components && Object.entries(health.components).map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-sm text-gray-600">{k}</span>
                      <span className={`text-sm font-semibold ${statusColor(v.status)}`}>{v.status}</span>
                    </div>
                  ))}
                  {health.checkedAt && (
                    <div className="flex justify-between pt-1 border-t border-gray-100">
                      <span className="text-xs text-gray-400">Verificado em</span>
                      <span className="text-xs text-gray-500">{new Date(health.checkedAt).toLocaleString('pt-BR')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {info && (
              <div className="rounded-md border border-gray-200 bg-white p-6">
                <h2 className="text-[15px] font-semibold text-gray-900 mb-4 flex items-center gap-2"><Server size={18} className="text-[#003cc3]" /> Informação</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Versão</span>
                    <span className="text-sm font-medium text-gray-900">{info.version || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Uptime</span>
                    <span className="text-sm font-medium text-gray-900">{info.uptime || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Perfis</span>
                    <span className="text-sm font-medium text-gray-900">{info.profiles?.join(', ') || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Build Hash</span>
                    <span className="text-sm font-mono text-gray-700">{info.buildHash ? info.buildHash.slice(0, 8) : '—'}</span>
                  </div>
                  {info.jvm && (
                    <>
                      <div className="flex justify-between pt-1 border-t border-gray-100">
                        <span className="text-sm text-gray-600">JVM</span>
                        <span className="text-sm text-gray-700">{info.jvm.vendor} {info.jvm.version}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Heap</span>
                        <span className="text-sm text-gray-700">{info.jvm.heapUsedMb}MB / {info.jvm.heapMaxMb}MB</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {metrics && (
              <div className="rounded-md border border-gray-200 bg-white p-6 lg:col-span-2">
                <h2 className="text-[15px] font-semibold text-gray-900 mb-4 flex items-center gap-2"><Cpu size={18} className="text-[#003cc3]" /> Métricas de Runtime</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-xs text-gray-500 uppercase mb-1">CPU</p>
                    <p className="text-lg font-bold text-gray-900">{metrics.cpuUsagePercent.toFixed(1)}%</p>
                  </div>
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-xs text-gray-500 uppercase mb-1">Memória</p>
                    <p className="text-lg font-bold text-gray-900">{metrics.memory.usedMb}MB</p>
                    <p className="text-xs text-gray-400">de {metrics.memory.totalMb}MB</p>
                  </div>
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-xs text-gray-500 uppercase mb-1">Heap</p>
                    <p className="text-lg font-bold text-gray-900">{metrics.heap.usedMb}MB</p>
                    <p className="text-xs text-gray-400">máx {metrics.heap.maxMb}MB</p>
                  </div>
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-xs text-gray-500 uppercase mb-1">Threads</p>
                    <p className="text-lg font-bold text-gray-900">{metrics.threads.total}</p>
                    <p className="text-xs text-gray-400">{metrics.threads.daemon} daemon</p>
                  </div>
                  {metrics.connectionPool && (
                    <div className="bg-gray-50 rounded p-3 col-span-2 md:col-span-4">
                      <p className="text-xs text-gray-500 uppercase mb-2">Connection Pool</p>
                      <div className="flex gap-6 text-sm">
                        <span><span className="font-semibold text-gray-900">{metrics.connectionPool.active}</span> <span className="text-gray-500">activas</span></span>
                        <span><span className="font-semibold text-gray-900">{metrics.connectionPool.idle}</span> <span className="text-gray-500">inactivas</span></span>
                        <span><span className="font-semibold text-gray-900">{metrics.connectionPool.waiting}</span> <span className="text-gray-500">a aguardar</span></span>
                        <span><span className="font-semibold text-gray-900">{metrics.connectionPool.max}</span> <span className="text-gray-500">máx</span></span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default SystemPage;
