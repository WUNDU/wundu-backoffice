import React, { useState, useEffect } from 'react';
import { Server, RefreshCw, Trash2, Activity } from 'lucide-react';
import { AdminLayout } from '~/components/dashboard/AdminLayout';
import { systemService } from '~/services/admin/system.service';
import type { AdminSystemHealth, AdminSystemInfo } from '~/types/admin';

const SystemPage: React.FC = () => {
  const [health, setHealth] = useState<AdminSystemHealth | null>(null);
  const [info, setInfo] = useState<AdminSystemInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([systemService.getHealth(), systemService.getInfo()])
      .then(([h, i]) => { setHealth(h); setInfo(i); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleClearCache = async () => {
    if (!confirm('Limpar cache do sistema?')) return;
    setClearing(true);
    try { await systemService.clearCache(); alert('Cache limpo com sucesso.'); } catch (e) { console.error(e); }
    finally { setClearing(false); }
  };

  const statusColor = (s: string) => s === 'UP' ? 'text-green-600' : 'text-red-500';

  return (
    <AdminLayout>
      <div className="px-6 py-5 space-y-5">
        <div className="flex justify-between items-center">
          <h1 className="text-[22px] font-semibold tracking-tight text-gray-900 flex items-center gap-2">
            <Server size={22} className="text-[#003cc3]" /> Sistema
          </h1>
          <div className="flex gap-3">
            <button onClick={load} className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm text-gray-700 hover:bg-gray-50">
              <RefreshCw size={14} /> Actualizar
            </button>
            <button onClick={handleClearCache} disabled={clearing} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 disabled:opacity-50">
              <Trash2 size={14} /> {clearing ? 'A limpar...' : 'Limpar Cache'}
            </button>
          </div>
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
                  {health.components && Object.entries(health.components).map(([k, v]: [string, any]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-sm text-gray-600">{k}</span>
                      <span className={`text-sm font-semibold ${statusColor(v.status)}`}>{v.status}</span>
                    </div>
                  ))}
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
                    <span className="text-sm text-gray-600">Ambiente</span>
                    <span className="text-sm font-medium text-gray-900">{info.environment || '—'}</span>
                  </div>
                  {info.build && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Build</span>
                        <span className="text-sm font-medium text-gray-900">{info.build.version || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Data Build</span>
                        <span className="text-sm font-medium text-gray-900">{info.build.time ? new Date(info.build.time).toLocaleString('pt-BR') : '—'}</span>
                      </div>
                    </>
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
