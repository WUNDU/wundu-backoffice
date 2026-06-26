import React from 'react';
import {
  Users,
  UserPlus,
  Bell,
  ShieldAlert,
  ChevronRight,
  Info,
  Activity,
  Inbox,
} from 'lucide-react';
import { Link } from '@remix-run/react';
import { AdminLayout } from '~/components/dashboard/AdminLayout';
import { Card } from '~/components/dashboard/Card';
import { ChartCard } from '~/components/dashboard/ChartCard';
import { TransactionItem } from '~/components/dashboard/TransactionItem';
import { useDashboardStats, useDashboardGrowth, useDashboardRecentTransactions } from '~/hooks/use-dashboard-query';
import { SkeletonCards, SkeletonRows, SkeletonChart } from '~/components/ui/Skeleton';
import { EmptyState } from '~/components/ui/EmptyState';

function parseJavaDate(d: unknown): Date {
  if (Array.isArray(d)) {
    const [y, mo, day, h = 0, min = 0, s = 0] = d as number[];
    return new Date(y, mo - 1, day, h, min, s);
  }
  return new Date(d as string);
}


export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: growthData = [], isLoading: growthLoading } = useDashboardGrowth();
  const { data: recentTransactions = [], isLoading: txLoading } = useDashboardRecentTransactions();
  const loading = statsLoading || growthLoading || txLoading;

  const chartGrowthData = growthData.map((p) => ({
    month: new Date(p.date).toLocaleString('pt-BR', { month: 'short' }),
    users: p.newUsers,
  }));

  const txChartData = recentTransactions.slice(0, 7).map((tx) => ({
    month: parseJavaDate(tx.transactionDate).toLocaleString('pt-BR', { month: 'short' }),
    receita: tx.type === 'INCOME' ? tx.amount : 0,
    despesa: tx.type === 'EXPENSE' ? tx.amount : 0,
  }));

  // Map AdminTransactionSummary → TransactionItem-compatible shape
  const mappedTransactions = recentTransactions.map((tx) => ({
    id: tx.id,
    description: tx.description,
    category: tx.categoryName,
    amount: tx.type === 'INCOME' ? tx.amount : -tx.amount,
    date: parseJavaDate(tx.transactionDate).toLocaleDateString('pt-BR'),
    type: (tx.type === 'INCOME' ? 'income' : 'expense') as 'income' | 'expense',
  }));

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-gray-200 px-6 py-4">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-gray-900">Painel Administrativo</h1>
          <p className="mt-0.5 text-[13px] text-gray-500">Visão geral do sistema e métricas principais</p>
        </div>
        <button className="h-8 flex items-center gap-1.5 px-3 bg-[#00216b] hover:bg-[#003cc3] text-white text-[12px] font-medium rounded-md transition-colors">
          <Bell size={13} />
          Visualizar Alertas
        </button>
      </div>

      <div className="px-6 py-5 space-y-5">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? <SkeletonCards count={4} /> : (() => {
            const total = stats?.totalUsers ?? 0;
            const pctTotalUsers = total > 0 ? Math.round(((stats?.newUsersLast30Days ?? 0) / total) * 100) : 0;
            const pctSessions = total > 0 ? Math.round(((stats?.activeSessions ?? 0) / total) * 100) : 0;
            return (
              <>
                <Card title="Total de Usuários" value={total} icon={Users} trend percentage={pctTotalUsers} color="primary" isCurrency={false} />
                <Card title="Novos Usuários (Mês)" value={stats?.newUsersLast30Days ?? 0} icon={UserPlus} color="success" isCurrency={false} />
                <Card title="Transações (Mês)" value={stats?.totalTransactions ?? 0} icon={Activity} color="secondary" isCurrency={false} />
                <Card title="Tickets de Suporte" value={stats?.activeSessions ?? 0} icon={Bell} trend percentage={pctSessions} color="danger" isCurrency={false} />
              </>
            );
          })()}
        </div>

        {/* Estatísticas de Usuários */}
        <div className="rounded-md border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-4 py-3">
            <h3 className="text-[13px] font-semibold text-gray-900">Estatísticas de Usuários Activos</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            {[
              { label: 'Diário (DAU)', val: stats?.activeUsers ?? 0 },
              { label: 'Semanal (WAU)', val: stats?.kycApprovedUsers ?? 0 },
              { label: 'Mensal (MAU)', val: stats?.verifiedUsers ?? 0 },
            ].map(({ label, val }) => {
              const total = stats?.totalUsers ?? 0;
              const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0.0';
              return (
                <div key={label} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-gray-500">{label}</span>
                    <span className="text-[11px] font-medium text-gray-400">{pct}%</span>
                  </div>
                  <p className="font-mono text-[20px] font-semibold tabular-nums text-gray-900">{val.toLocaleString()}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {loading ? (
            <>
              <SkeletonChart />
              <SkeletonChart />
            </>
          ) : (
            <>
              <ChartCard
                title="Crescimento de Usuários"
                chartData={chartGrowthData.length > 0 ? chartGrowthData : [{ month: '...', users: 0 }]}
                dataKey="users"
                color="#003cc3"
                isCurrencyChart={false}
              />
              <ChartCard
                title="Receitas vs Despesas"
                chartData={txChartData.length > 0 ? txChartData : [{ month: '...', receita: 0, despesa: 0 }]}
                dataKey={['receita', 'despesa']}
                color="#00216b"
                isCurrencyChart={true}
              />
            </>
          )}
        </div>

        {/* Transações + Alertas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-md border border-gray-200 bg-white lg:col-span-2">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <h3 className="text-[13px] font-semibold text-gray-900">Transações Recentes</h3>
              <Link to="/dashboard/transaction" className="flex items-center gap-0.5 text-[12px] text-[#003cc3] hover:text-[#00216b]">
                Ver todas <ChevronRight size={13} />
              </Link>
            </div>
            <div className="px-4 py-2">
              {loading ? (
                <SkeletonRows count={5} />
              ) : mappedTransactions.length > 0 ? (
                mappedTransactions.map(transaction => (
                  <TransactionItem key={transaction.id} transaction={transaction} />
                ))
              ) : (
                <EmptyState icon={Inbox} title="Sem transações recentes" />
              )}
            </div>
          </div>

          <div className="rounded-md border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <h3 className="text-[13px] font-semibold text-gray-900">Alertas de Segurança</h3>
              <Link to="/dashboard/security" className="flex items-center gap-0.5 text-[12px] text-[#003cc3] hover:text-[#00216b]">
                Ver todos <ChevronRight size={13} />
              </Link>
            </div>
            <div className="p-3 space-y-2">
              {[
                { icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50', title: 'Múltiplas tentativas de login', sub: '5 tentativas falhas — conta #3892', time: 'Há 24 min' },
                { icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50', title: 'Transação suspeita', sub: 'Transferência de valor atípico', time: 'Há 2 horas' },
                { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', title: 'Novo administrador criado', sub: 'Utilizador com privilégios elevados', time: 'Há 5 horas' },
              ].map(({ icon: Icon, color, bg, title, sub, time }) => (
                <div key={title} className={`flex gap-2.5 rounded-md ${bg} p-3`}>
                  <Icon size={14} className={`mt-0.5 flex-shrink-0 ${color}`} />
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium text-gray-800 truncate">{title}</p>
                    <p className="text-[11px] text-gray-500 truncate">{sub}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
