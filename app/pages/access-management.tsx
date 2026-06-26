// AccessManagementPage.tsx
import { Users, ShieldCheck, Trash2, Search, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { AdminLayout } from '~/components/dashboard/AdminLayout';
import { useUsersList, useAdminsList, useDeactivateUser, useRevokeAdmin } from '~/hooks/use-users-query';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '~/lib/query-keys';
import type { AdminUserSummary, AdminSummary } from '~/types/admin';


export default function AccessManagementPage() {
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const qc = useQueryClient();

  const { data: users = [], isLoading: usersLoading } = useUsersList();
  const { data: admins = [], isLoading: adminsLoading } = useAdminsList();
  const loading = usersLoading || adminsLoading;
  const deactivateUser = useDeactivateUser();
  const revokeAdmin = useRevokeAdmin();

  const filteredUsers = users.filter((u: AdminUserSummary) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAdmins = admins.filter((a: AdminSummary) =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeactivateUser = async (id: string) => {
    if (!window.confirm('Desativar este utilizador?')) return;
    await deactivateUser.mutateAsync(id);
  };

  const handleRevokeAdmin = async (id: string) => {
    if (!window.confirm('Revogar privilégios de admin?')) return;
    await revokeAdmin.mutateAsync(id);
  };

  return (
    <AdminLayout>
      <div className="px-6 py-5 space-y-5">
        <h1 className="text-[22px] font-semibold tracking-tight text-gray-900">Gerenciamento de Acesso</h1>
        <p className="text-[13px] text-gray-500">Controle baseado em papéis (RBAC) para gerenciar permissões de usuários e papéis.</p>

        <div className="flex border-b border-gray-200">
          <button
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'users' ? 'border-b-2 border-[#00216b] text-[#00216b]' : 'text-gray-600 hover:text-gray-800'}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={16} className="inline-block mr-2" /> Usuários
          </button>
          <button
            className={`ml-4 px-4 py-2 text-sm font-medium ${activeTab === 'admins' ? 'border-b-2 border-[#00216b] text-[#00216b]' : 'text-gray-600 hover:text-gray-800'}`}
            onClick={() => setActiveTab('admins')}
          >
            <ShieldCheck size={16} className="inline-block mr-2" /> Admins
          </button>
        </div>

        {/* Barra de pesquisa e botões de ação */}
        <div className="flex justify-between items-center">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              placeholder={`Pesquisar ${activeTab === 'users' ? 'usuários' : 'papéis'}...`}
              className="pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:border-[#003cc3] focus:ring-[#003cc3]/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search size={16} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <button className="flex items-center px-4 py-2 bg-[#00216b] text-white rounded-lg hover:bg-[#003cc3] transition-colors duration-200" onClick={() => qc.invalidateQueries({ queryKey: queryKeys.users.all })}>
            <RefreshCw size={16} className="mr-2" />
            <span>Atualizar</span>
          </button>
        </div>

        {activeTab === 'users' && (
          <div className="rounded-md border border-gray-200 bg-white p-6">
            <h2 className="text-[15px] font-semibold text-gray-900 mb-4">Lista de Utilizadores</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plano</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KYC</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">A carregar...</td></tr>
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.planType}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.kycStatus}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {user.isActive ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => handleDeactivateUser(user.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Nenhum utilizador encontrado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'admins' && (
          <div className="rounded-md border border-gray-200 bg-white p-6">
            <h2 className="text-[15px] font-semibold text-gray-900 mb-4">Lista de Administradores</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Último Login</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">A carregar...</td></tr>
                  ) : filteredAdmins.length > 0 ? (
                    filteredAdmins.map(admin => (
                      <tr key={admin.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{admin.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{admin.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${admin.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {admin.isActive ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {admin.lastLogin ? new Date(admin.lastLogin).toLocaleString('pt-BR') : '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => handleRevokeAdmin(admin.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Nenhum administrador encontrado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
