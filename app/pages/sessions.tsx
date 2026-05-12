import React, { useState, useEffect } from 'react';
import { MonitorSmartphone, Search, Trash2, RefreshCw } from 'lucide-react';
import { AdminLayout } from '~/components/dashboard/AdminLayout';
import { sessionsService } from '~/services/admin/sessions.service';
import type { AdminSession, Page } from '~/types/admin';
import { Pagination } from '~/components/ui/Pagination';

const PAGE_SIZE = 20;

const SessionsPage: React.FC = () => {
  const [sessions, setSessions] = useState<Page<AdminSession> | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');
  const [page, setPage] = useState(0);
  const [revoking, setRevoking] = useState<string | null>(null);

  const load = (uid?: string, p = 0) => {
    setLoading(true);
    sessionsService.list({ userId: uid || undefined, page: p, size: PAGE_SIZE })
      .then(setSessions)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handlePageChange = (p: number) => { setPage(p); load(userId, p); };

  const handleRevoke = async (tokenId: string) => {
    if (!confirm('Revogar esta sessão?')) return;
    setRevoking(tokenId);
    try {
      await sessionsService.revoke(tokenId);
      setSessions(prev => prev ? { ...prev, content: prev.content.filter(s => s.tokenId !== tokenId) } : null);
    } catch (e) { console.error(e); }
    finally { setRevoking(null); }
  };

  return (
    <AdminLayout>
      <div className="px-6 py-5 space-y-5">
        <div className="flex justify-between items-center">
          <h1 className="text-[22px] font-semibold tracking-tight text-gray-900 flex items-center gap-2">
            <MonitorSmartphone size={22} className="text-[#003cc3]" /> Sessões Activas
          </h1>
          <button onClick={() => load(userId)} className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm text-gray-700 hover:bg-gray-50">
            <RefreshCw size={14} /> Actualizar
          </button>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Filtrar por User ID..."
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-[#003cc3] focus:ring-[#003cc3]/20"
              value={userId}
              onChange={e => setUserId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && load(userId)}
            />
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <button onClick={() => load(userId)} className="px-4 py-2 bg-[#00216b] text-white rounded-lg text-sm hover:bg-[#003cc3] transition-colors">
            Filtrar
          </button>
        </div>

        {sessions && (
          <p className="text-xs text-gray-500">{sessions.totalElements} sessão(ões) encontrada(s)</p>
        )}

        <div className="rounded-md border border-gray-200 bg-white p-6">
          {loading ? (
            <p className="text-center text-gray-500 py-8">A carregar...</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilizador</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User-Agent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Emitida</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expira</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ação</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sessions && sessions.content.length > 0 ? sessions.content.map(s => (
                  <tr key={s.tokenId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900">{s.userEmail}</p>
                      <p className="text-xs text-gray-400 font-mono">{s.userId}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{s.ipAddress}</td>
                    <td className="px-6 py-4 text-xs text-gray-500 max-w-[200px] truncate">{s.userAgent}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(s.issuedAt).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(s.expiresAt).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleRevoke(s.tokenId)}
                        disabled={revoking === s.tokenId}
                        className="text-red-500 hover:text-red-700 disabled:opacity-50"
                        title="Revogar sessão"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">Sem sessões.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        {sessions && (
          <Pagination
            page={page}
            totalPages={sessions.totalPages}
            totalElements={sessions.totalElements}
            pageSize={PAGE_SIZE}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default SessionsPage;
