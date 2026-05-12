// SecurityPage.tsx

import { Activity, AlertCircle, Calendar, CheckCircle, Search, ShieldAlert } from "lucide-react";
import { useState, useEffect } from "react";
import { AdminLayout } from "~/components/dashboard/AdminLayout";
import { securityService } from "~/services/admin/security.service";
import { sessionsService } from "~/services/admin/sessions.service";
import type { LoginAttempt, AdminSession } from "~/types/admin";


export default function SecurityPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [blocked, setBlocked] = useState<LoginAttempt[]>([]);
  const [attempts, setAttempts] = useState<LoginAttempt[]>([]);
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      securityService.getBlocked(),
      securityService.getLoginAttempts(),
      sessionsService.list({ size: 20 }),
    ])
      .then(([b, a, s]) => {
        setBlocked(b);
        setAttempts(a);
        setSessions(s.content);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleUnblock = async (key: string) => {
    try {
      await securityService.unblock(key);
      loadData();
    } catch (e) { console.error(e); }
  };

  const handleRevokeSession = async (tokenId: string) => {
    try {
      await sessionsService.revoke(tokenId);
      loadData();
    } catch (e) { console.error(e); }
  };

  const filteredAttempts = attempts.filter(a =>
    a.identifier.toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <AdminLayout>
      <div className="px-6 py-5 space-y-5">
        <h1 className="text-[22px] font-semibold tracking-tight text-gray-900">Painel de Segurança</h1>
        <p className="text-[13px] text-gray-500">Gerencie bloqueios, visualize tentativas de login e sessões activas.</p>

        {/* Bloqueados */}
        <div className="rounded-md border border-gray-200 bg-white p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[15px] font-semibold text-gray-900">Utilizadores/IPs Bloqueados</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Pesquisar..."
                className="pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-[#003cc3] focus:ring-[#003cc3]/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search size={16} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <p className="text-gray-500 text-center py-8">A carregar...</p>
            ) : blocked.length > 0 ? (
              blocked.map((item) => (
                <div key={item.key} className="flex items-center p-4 rounded-lg border bg-red-50 border-red-200">
                  <AlertCircle size={20} className="text-red-600 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-sm text-red-800">{item.identifier}</p>
                    <p className="text-xs text-red-600">Falhas: {item.failureCount} · TTL: {item.ttlSeconds}s</p>
                  </div>
                  <button
                    onClick={() => handleUnblock(item.key)}
                    className="ml-auto px-3 py-1 bg-[#00216b] text-white text-xs rounded-md hover:bg-[#003cc3] transition-colors"
                  >
                    Desbloquear
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">Nenhum bloqueio activo.</p>
            )}
          </div>
        </div>

        {/* Tentativas de Login */}
        <div className="rounded-md border border-gray-200 bg-white p-6">
          <h2 className="text-[15px] font-semibold text-gray-900 mb-4">Tentativas de Login</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Identificador</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Falhas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bloqueado</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">A carregar...</td></tr>
                ) : filteredAttempts.length > 0 ? (
                  filteredAttempts.map((a) => (
                    <tr key={a.key} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{a.identifier}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{a.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{a.failureCount}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${a.blocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                          {a.blocked ? 'Sim' : 'Não'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">Sem tentativas.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sessões Activas */}
        <div className="rounded-md border border-gray-200 bg-white p-6">
          <h2 className="text-[15px] font-semibold text-gray-900 mb-4">Sessões Activas</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilizador</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emitida Em</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expira Em</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">A carregar...</td></tr>
                ) : sessions.length > 0 ? (
                  sessions.map((s) => (
                    <tr key={s.tokenId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{s.userEmail}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{s.ipAddress}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(s.issuedAt).toLocaleString('pt-BR')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(s.expiresAt).toLocaleString('pt-BR')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleRevokeSession(s.tokenId)}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Revogar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">Sem sessões.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-md border border-gray-200 bg-white p-6">
          <h2 className="text-[15px] font-semibold text-gray-900 mb-4">Resumo</h2>
          <div className="space-y-3">
            <div className="flex items-center text-sm text-gray-700">
              <Activity size={16} className="text-[#003cc3] mr-2" />
              <span>Tentativas registadas: {attempts.length}</span>
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <ShieldAlert size={16} className="text-red-500 mr-2" />
              <span>Bloqueios activos: {blocked.length}</span>
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <Calendar size={16} className="text-[#00216b] mr-2" />
              <span>Sessões activas: {sessions.length}</span>
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <CheckCircle size={16} className="text-green-500 mr-2" />
              <span>Dados actualizados em: {new Date().toLocaleString('pt-BR')}</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
