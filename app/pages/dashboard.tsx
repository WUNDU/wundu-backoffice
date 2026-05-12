import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Bell,
  ShieldAlert,
  ChevronRight,
  Info,
  Activity,
  MapPin
} from 'lucide-react';
import { Link } from '@remix-run/react';
import { AdminLayout } from '~/components/dashboard/AdminLayout';
import { Card } from '~/components/dashboard/Card';
import { ChartCard } from '~/components/dashboard/ChartCard';
import { TransactionItem } from '~/components/dashboard/TransactionItem';
import { dashboardService } from '~/services/admin/dashboard.service';
import { transactionsService } from '~/services/admin/transactions.service';
import type { DashboardStats, AdminTransactionSummary, UserGrowthPoint } from '~/types/admin';

function parseJavaDate(d: unknown): Date {
  if (Array.isArray(d)) {
    const [y, mo, day, h = 0, min = 0, s = 0] = d as number[];
    return new Date(y, mo - 1, day, h, min, s);
  }
  return new Date(d as string);
}


// New component to handle individual geographical distribution bars with animation
interface GeoDistributionBarProps {
  region: {
    region: string;
    users: number;
  };
  totalUsers: number;
  index: number;
}

const GeoDistributionBar: React.FC<GeoDistributionBarProps> = ({ region, totalUsers, index }) => {
  const [animatedWidth, setAnimatedWidth] = useState(0);
  // Ensure totalUsers is not zero to prevent division by zero, which results in NaN or Infinity
  const targetWidth = totalUsers > 0 ? (region.users / totalUsers) * 100 : 0;

  useEffect(() => {
    // Reset animatedWidth to 0 before starting new animation
    setAnimatedWidth(0);

    let animationFrameId: number;
    let startTime: number | null = null;
    const duration = 1000; // 1 second animation

    const animateBar = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = (currentTime - startTime) / duration;
      const currentWidth = Math.min(progress, 1) * targetWidth;
      setAnimatedWidth(currentWidth);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animateBar);
      }
    };

    // Start animation after a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      animationFrameId = requestAnimationFrame(animateBar);
    }, 100 * index); // Stagger animation for each bar

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(animationFrameId);
      setAnimatedWidth(0); // Reset on unmount
    };
  }, [targetWidth, index, region.region, region.users, totalUsers]);

  return (
    <div className="flex items-center">
      <div className="w-32 text-sm text-gray-700">{region.region}</div>
      <div className="flex-1">
        <div className="relative h-4 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-primary transition-all duration-1000 ease-out"
            style={{ width: `${animatedWidth}%` }}
          ></div>
        </div>
      </div>
      <div className="w-24 text-right text-sm font-medium text-gray-700">
        {region.users.toLocaleString()}
        <span className="text-xs text-gray-500 ml-1">
          ({totalUsers > 0 ? ((region.users / totalUsers) * 100).toFixed(1) : '0.0'}%)
        </span>
      </div>
    </div>
  );
};


export default function AdminDashboard() {
  const [period, setPeriod] = useState('month');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [growthData, setGrowthData] = useState<UserGrowthPoint[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<AdminTransactionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardService.getStats(),
      dashboardService.getUserGrowth({ groupBy: 'MONTH' }),
      transactionsService.list({ size: 8, sort: 'createdAt,desc' }),
    ])
      .then(([s, g, t]) => {
        setStats(s);
        setGrowthData(g);
        setRecentTransactions(t.content);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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

  const geoDistributionData: Array<{ region: string; users: number }> = [];

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-gray-200 px-6 py-4">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-gray-900">Painel Administrativo</h1>
          <p className="mt-0.5 text-[13px] text-gray-500">Visão geral do sistema e métricas principais</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="h-8 rounded-md border border-gray-200 bg-white px-3 text-[12px] text-gray-700 focus:outline-none focus:border-[#003cc3] cursor-pointer"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="today">Hoje</option>
            <option value="week">Esta Semana</option>
            <option value="month">Este Mês</option>
            <option value="quarter">Este Trimestre</option>
            <option value="year">Este Ano</option>
          </select>
          <button className="h-8 flex items-center gap-1.5 px-3 bg-[#00216b] hover:bg-[#003cc3] text-white text-[12px] font-medium rounded-md transition-colors">
            <Bell size={13} />
            Visualizar Alertas
          </button>
        </div>
      </div>

      <div className="px-6 py-5 space-y-5">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card title="Total de Usuários" value={loading ? 0 : (stats?.totalUsers ?? 0)} icon={Users} trend percentage={9} color="primary" isCurrency={false} />
          <Card title="Novos Usuários (Mês)" value={loading ? 0 : (stats?.newUsersLast30Days ?? 0)} icon={UserPlus} trend percentage={12} color="success" isCurrency={false} />
          <Card title="Transações (Mês)" value={loading ? 0 : (stats?.totalTransactions ?? 0)} icon={Activity} trend percentage={7} color="secondary" isCurrency={false} />
          <Card title="Tickets de Suporte" value={loading ? 0 : (stats?.activeSessions ?? 0)} icon={Bell} trend percentage={-15} color="danger" isCurrency={false} />
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
        </div>

        {/* Distribuição Geográfica */}
        {geoDistributionData.length > 0 && (
          <div className="rounded-md border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <h3 className="text-[13px] font-semibold text-gray-900">Distribuição Geográfica</h3>
              <div className="flex items-center gap-1 text-[11px] text-gray-400">
                <MapPin size={11} />
                Por região
              </div>
            </div>
            <div className="p-4 space-y-3">
              {geoDistributionData.map((region, i) => (
                <GeoDistributionBar key={i} region={region} totalUsers={stats?.totalUsers ?? 0} index={i} />
              ))}
            </div>
          </div>
        )}

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
              {mappedTransactions.map(transaction => (
                <TransactionItem key={transaction.id} transaction={transaction} />
              ))}
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
