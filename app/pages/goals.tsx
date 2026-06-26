import React, { useState } from 'react';
import { Target, Trash2 } from 'lucide-react';
import { AdminLayout } from '~/components/dashboard/AdminLayout';
import { useGoalsList, useGoalStats, useDeleteGoal } from '~/hooks/use-goals-query';
import { Pagination } from '~/components/ui/Pagination';

const GoalsPage: React.FC = () => {
  const [page, setPage] = useState(0);

  const { data: goalsPage, isLoading: loading } = useGoalsList(page);
  const { data: stats } = useGoalStats();
  const deleteGoal = useDeleteGoal();

  const goals = goalsPage?.content ?? [];
  const totalElements = goalsPage?.totalElements ?? 0;
  const totalPages = goalsPage?.totalPages ?? 0;

  const handlePageChange = (p: number) => { setPage(p); };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar meta?')) return;
    await deleteGoal.mutateAsync(id);
  };

  const statusLabel = (s: string) => ({ ACTIVE: 'Ativa', DONE: 'Concluída', ARCHIVED: 'Arquivada' }[s] || s);
  const statusColor = (s: string) => ({ ACTIVE: 'bg-blue-100 text-blue-800', DONE: 'bg-green-100 text-green-800', ARCHIVED: 'bg-gray-100 text-gray-600' }[s] || 'bg-gray-100 text-gray-600');

  return (
    <AdminLayout>
      <div className="px-6 py-5 space-y-5">
        <h1 className="text-[22px] font-semibold tracking-tight text-gray-900">Metas (Goals)</h1>

        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="rounded-md border border-gray-200 bg-white p-5">
              <p className="text-xs text-gray-500 uppercase mb-1">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="rounded-md border border-gray-200 bg-white p-5">
              <p className="text-xs text-gray-500 uppercase mb-1">Ativas</p>
              <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
            </div>
            <div className="rounded-md border border-gray-200 bg-white p-5">
              <p className="text-xs text-gray-500 uppercase mb-1">Concluídas</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
          </div>
        )}

        <div className="rounded-md border border-gray-200 bg-white p-6">
          {loading ? (
            <p className="text-center text-gray-500 py-8">A carregar...</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilizador</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progresso</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {goals.length > 0 ? goals.map(g => (
                  <tr key={g.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center gap-2">
                      <Target size={14} className="text-[#003cc3]" /> {g.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{g.userId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{g.targetAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'AOA' })}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-[#00216b] h-2 rounded-full" style={{ width: `${Math.min(100, (g.currentAmount / g.targetAmount) * 100)}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{Math.round((g.currentAmount / g.targetAmount) * 100)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor(g.status)}`}>{statusLabel(g.status)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button onClick={() => handleDelete(g.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">Sem metas.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        {totalPages > 0 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={20}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default GoalsPage;
