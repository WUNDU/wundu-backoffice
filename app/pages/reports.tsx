import React, { useState, useMemo, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Filter,
  ChevronDown,
  ClipboardList,
  Target,
  Users
} from 'lucide-react';
import { Card } from '~/components/dashboard/Card';
import { ChartCard } from '~/components/dashboard/ChartCard';
import { BarChartCard } from '~/components/dashboard/BarChartCard';
import { AdminLayout } from '~/components/dashboard/AdminLayout';
import { dashboardService } from '~/services/admin/dashboard.service';
import { transactionsService } from '~/services/admin/transactions.service';
import type { DashboardStats, AdminTransactionSummary } from '~/types/admin';

function parseJavaDate(d: unknown): Date | null {
  if (d == null) return null;
  if (Array.isArray(d)) {
    const [y, mo, day, h = 0, min = 0, s = 0] = d as number[];
    return new Date(y, mo - 1, day, h, min, s);
  }
  const dt = new Date(d as string);
  return isNaN(dt.getTime()) ? null : dt;
}

/**
 * ReportsPage Component
 * This page provides a comprehensive overview of financial reports and analytics
 * for the backoffice, allowing administrators to gain insights into aggregated
 * user financial data. It includes summary cards, various charts, and filtering options.
 */
const ReportsPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [transactions, setTransactions] = useState<AdminTransactionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params: Parameters<typeof transactionsService.list>[0] = { size: 50, page: 0, sort: 'createdAt,desc' };
    if (selectedPeriod === 'custom' && startDate) params.from = startDate;
    if (selectedPeriod === 'custom' && endDate) params.to = endDate;

    Promise.all([
      dashboardService.getStats(),
      transactionsService.list({ ...params, type: 'INCOME' }),
      transactionsService.list({ ...params, type: 'EXPENSE' }),
    ])
      .then(([s, income, expense]) => {
        setStats(s);
        setTransactions([...income.content, ...expense.content]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedPeriod, startDate, endDate]);

  const filteredAnnualFinancialPerformance = useMemo(() => {
    const now = new Date();
    let filtered = transactions;

    if (selectedPeriod === 'last-3-months') {
      const cutoff = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      filtered = transactions.filter(tx => {
        const d = parseJavaDate(tx.transactionDate);
        return d != null && d >= cutoff;
      });
    } else if (selectedPeriod === 'last-year') {
      const cutoff = new Date(now.getFullYear() - 1, now.getMonth(), 1);
      filtered = transactions.filter(tx => {
        const d = parseJavaDate(tx.transactionDate);
        return d != null && d >= cutoff;
      });
    }

    const monthly: Record<string, { month: string; receita: number; despesa: number; net: number }> = {};
    filtered.forEach(tx => {
      const d = parseJavaDate(tx.transactionDate);
      if (!d) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('pt-BR', { month: 'short', year: '2-digit' });
      if (!monthly[key]) monthly[key] = { month: label, receita: 0, despesa: 0, net: 0 };
      if (tx.type === 'INCOME') monthly[key].receita += tx.amount;
      else monthly[key].despesa += tx.amount;
      monthly[key].net = monthly[key].receita - monthly[key].despesa;
    });
    return Object.keys(monthly).sort().map(k => monthly[k]);
  }, [transactions, selectedPeriod]);

  const totalReportIncome = useMemo(() => filteredAnnualFinancialPerformance.reduce((s, i) => s + (i.receita || 0), 0), [filteredAnnualFinancialPerformance]);
  const totalReportExpenses = useMemo(() => filteredAnnualFinancialPerformance.reduce((s, i) => s + (i.despesa || 0), 0), [filteredAnnualFinancialPerformance]);
  const totalReportNetBalance = totalReportIncome - totalReportExpenses;
  const totalTransactionsCount = stats?.totalTransactions ?? 0;

  const topExpenseCategoriesReport = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.filter(t => t.type === 'EXPENSE').forEach(t => { map[t.categoryName || 'Sem categoria'] = (map[t.categoryName || 'Sem categoria'] || 0) + t.amount; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const topIncomeSourcesReport = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.filter(t => t.type === 'INCOME').forEach(t => { map[t.categoryName || 'Sem categoria'] = (map[t.categoryName || 'Sem categoria'] || 0) + t.amount; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  return (
    <AdminLayout>
      <div className="px-6 py-5 space-y-5">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <h2 className="text-[22px] font-semibold tracking-tight text-gray-900">Relatórios e Análises</h2>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <button className="flex items-center justify-center px-6 py-3 bg-[#00216b] text-white rounded-lg shadow-md hover:bg-[#003cc3] transition-all duration-300 transform hover:scale-105">
              <ClipboardList size={20} className="mr-2" />
              Gerar Relatório Personalizado
            </button>
          </div>
        </div>

        {/* Summary Cards for Reports */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card
            title="Receita Total Agregada"
            value={totalReportIncome}
            icon={TrendingUp}
            color="success"
            trend={true}
            percentage={8.5}
          />
          <Card
            title="Despesa Total Agregada"
            value={totalReportExpenses}
            icon={TrendingDown}
            color="danger"
            trend={true}
            percentage={-4.1}
          />
          <Card
            title="Balanço Líquido Agregado"
            value={totalReportNetBalance}
            icon={DollarSign}
            color={totalReportNetBalance >= 0 ? 'primary' : 'danger'}
            trend={true}
            percentage={totalReportNetBalance >= 0 ? 6.2 : -2.5}
          />
          <Card
            title="Total de Transações"
            value={totalTransactionsCount}
            icon={Users} // Changed icon to Users to represent overall user activity in transactions
            color="secondary"
            isCurrency={false}
          />
        </div>

        {/* Filters Section */}
        <div className="rounded-md border border-gray-200 bg-white p-6">
          <h3 className="text-[15px] font-semibold text-gray-900 mb-4 flex items-center">
            <Filter size={20} className="mr-2 text-[#00216b]" /> Opções de Relatório
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Period Filter */}
            <div className="relative">
              <select
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:border-[#003cc3] focus:ring-[#003cc3]/20 transition-all duration-200"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="all">Todo o Período</option>
                <option value="last-3-months">Últimos 3 Meses</option>
                <option value="last-year">Último Ano</option>
                <option value="custom">Período Personalizado</option>
              </select>
              <ChevronDown size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Custom Date Range (conditionally rendered) */}
            {selectedPeriod === 'custom' && (
              <>
                <div className="relative">
                  <input
                    type="date"
                    className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-[#003cc3] focus:ring-[#003cc3]/20 transition-all duration-200"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <input
                    type="date"
                    className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-[#003cc3] focus:ring-[#003cc3]/20 transition-all duration-200"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Main Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Annual Financial Performance */}
          <ChartCard
            title="Desempenho Financeiro Anual"
            chartData={filteredAnnualFinancialPerformance}
            dataKey={['receita', 'despesa', 'net']} // Showing all three on one chart
            color="#4F46E5" // Default color, but lines will have specific colors
          />

          {/* Top Expense Categories */}
          <BarChartCard
            title="Principais Categorias de Despesa"
            chartData={topExpenseCategoriesReport}
            dataKey="value"
            barColor="#ef4444" // Red for expenses
          />

          {/* Top Income Sources */}
          <BarChartCard
            title="Principais Fontes de Receita"
            chartData={topIncomeSourcesReport}
            dataKey="value"
            barColor="#22c55e" // Green for income
          />

          {/* Placeholder for another chart, e.g., Budget vs. Actual */}
          <div className="rounded-md border border-gray-200 bg-white p-6 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Target size={48} className="mx-auto mb-3 text-gray-400" />
              <p className="font-medium text-lg">Relatório de Orçamento vs. Real</p>
              <p className="text-sm">Em breve: Acompanhe o desempenho do orçamento dos utilizadores.</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ReportsPage;
