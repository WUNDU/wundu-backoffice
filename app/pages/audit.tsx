import React, { useState, useEffect } from 'react';
import { ClipboardList, Download, Search } from 'lucide-react';
import { AdminLayout } from '~/components/dashboard/AdminLayout';
import { auditService } from '~/services/admin/audit.service';
import type { AdminAuditLog } from '~/types/admin';

const AuditPage: React.FC = () => {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');

  const load = (params?: object) => {
    setLoading(true);
    auditService.list({ size: 100, ...params })
      .then(r => setLogs(r.content))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleFilter = () => {
    load({ action: action || undefined });
  };

  const handleExport = async () => {
    try {
      const blob = await auditService.export({ action: action || undefined });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'audit.csv'; a.click();
      URL.revokeObjectURL(url);
    } catch (e) { console.error(e); }
  };

  const filtered = logs.filter(l =>
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    (l.adminId || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.targetId || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="px-6 py-5 space-y-5">
        <div className="flex justify-between items-center">
          <h1 className="text-[22px] font-semibold tracking-tight text-gray-900 flex items-center gap-2">
            <ClipboardList size={22} className="text-[#003cc3]" /> Audit Log
          </h1>
          <button onClick={handleExport} className="flex items-center px-4 py-2 bg-[#00216b] text-white rounded-lg hover:bg-[#003cc3] transition-colors text-sm">
            <Download size={15} className="mr-2" /> Exportar CSV
          </button>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <input type="text" placeholder="Pesquisar..." className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-[#003cc3] focus:ring-[#003cc3]/20" value={search} onChange={e => setSearch(e.target.value)} />
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <input type="text" placeholder="Filtrar por acção..." className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-[#003cc3] focus:ring-[#003cc3]/20" value={action} onChange={e => setAction(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleFilter()} />
          <button onClick={handleFilter} className="px-4 py-2 bg-[#00216b] text-white rounded-lg text-sm hover:bg-[#003cc3] transition-colors">Filtrar</button>
        </div>

        <div className="rounded-md border border-gray-200 bg-white p-6">
          {loading ? (
            <p className="text-center text-gray-500 py-8">A carregar...</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acção</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alvo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.length > 0 ? filtered.map(l => (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{l.action}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{l.adminId || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{l.targetId || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{l.ipAddress || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(l.createdAt).toLocaleString('pt-BR')}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">Sem registos.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AuditPage;
