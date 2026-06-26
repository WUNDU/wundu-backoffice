import React, { useState, useMemo, useEffect } from 'react';
import {
  DollarSign,
  List,
  Filter,
  Search,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  SearchX,
} from 'lucide-react';
import { Card } from '~/components/dashboard/Card';
import { ChartCard } from '~/components/dashboard/ChartCard';
import { PieChartCard } from '~/components/dashboard/PieChartCard';
import { TransactionItem } from '~/components/dashboard/TransactionItem';
import { AdminLayout } from '~/components/dashboard/AdminLayout';
import { useTransactionsList } from '~/hooks/use-transactions-query';
import { Pagination } from '~/components/ui/Pagination';
import { SkeletonCards, SkeletonRows } from '~/components/ui/Skeleton';
import { EmptyState } from '~/components/ui/EmptyState';
import { PAGE_SIZE, CHART_COLORS_EXTENDED } from '~/lib/constants';

function parseJavaDate(d: unknown): Date {
  if (d == null) return new Date(0);
  if (Array.isArray(d)) {
    const [y, mo, day, h = 0, min = 0, s = 0] = d as number[];
    return new Date(y, mo - 1, day, h, min, s);
  }
  const dt = new Date(d as string);
  return isNaN(dt.getTime()) ? new Date(0) : dt;
}

const TransactionsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedType, setSelectedType] = useState<'' | 'INCOME' | 'EXPENSE'>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [page, setPage] = useState(0);

  const { data: slot, isLoading: loading } = useTransactionsList('', page);
  const apiTransactions = slot?.content ?? [];
  const totalElements = slot?.totalElements ?? 0;
  const totalPages = slot?.totalPages ?? 0;

  const handlePageChange = (p: number) => { setPage(p); };

  useEffect(() => { setPage(0); }, [searchTerm, selectedType, selectedCategory, startDate, endDate]);

  const mappedTransactions = useMemo(() => apiTransactions.map((tx) => ({
    id: tx.id,
    description: tx.description,
    category: tx.categoryName,
    amount: tx.type === 'INCOME' ? tx.amount : -tx.amount,
    date: parseJavaDate(tx.transactionDate).toLocaleDateString('pt-BR'),
    type: (tx.type === 'INCOME' ? 'income' : 'expense') as 'income' | 'expense',
  })), [apiTransactions]);

  const filteredTransactions = useMemo(() => {
    return mappedTransactions.filter(transaction => {
      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === '' || transaction.type === selectedType.toLowerCase();
      const matchesCategory = selectedCategory === '' || transaction.category === selectedCategory;
      const txDate = new Date(transaction.date.split('/').reverse().join('-'));
      const matchesDate = (!startDate || txDate >= new Date(startDate)) && (!endDate || txDate <= new Date(endDate));
      return matchesSearch && matchesType && matchesCategory && matchesDate;
    });
  }, [mappedTransactions, searchTerm, selectedType, selectedCategory, startDate, endDate]);

  const totalIncome = useMemo(() => filteredTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0), [filteredTransactions]);
  const totalExpenses = useMemo(() => filteredTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0), [filteredTransactions]);
  const netBalance = totalIncome - totalExpenses;
  const hasActiveFilter = !!(searchTerm || selectedType || selectedCategory || startDate || endDate);
  const numberOfTransactions = hasActiveFilter ? filteredTransactions.length : totalElements;

  const uniqueCategories = useMemo(() => Array.from(new Set(mappedTransactions.map(t => t.category))), [mappedTransactions]);

  const filteredCategoryData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredTransactions.forEach(t => { map[t.category] = (map[t.category] || 0) + Math.abs(t.amount); });
    let ci = 0;
    return Object.keys(map).map(cat => ({
      name: cat,
      value: map[cat],
      color: CHART_COLORS_EXTENDED[ci++ % CHART_COLORS_EXTENDED.length],
    }));
  }, [filteredTransactions]);

  const incomeExpenseCombinedData = useMemo(() => {
    const monthly: Record<string, { receita: number; despesa: number }> = {};
    apiTransactions.forEach(tx => {
      const m = parseJavaDate(tx.transactionDate).toLocaleString('pt-BR', { month: 'short' });
      if (!monthly[m]) monthly[m] = { receita: 0, despesa: 0 };
      if (tx.type === 'INCOME') monthly[m].receita += tx.amount;
      else monthly[m].despesa += tx.amount;
    });
    return Object.entries(monthly).map(([month, v]) => ({ month, ...v }));
  }, [apiTransactions]);

  return (
    <AdminLayout>
      <div className="px-6 py-5 space-y-5">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <h2 className="text-[22px] font-semibold tracking-tight text-gray-900">Visão Geral das Transações</h2>
          {/* The "Adicionar Nova Transação" button was here and has been removed */}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? <SkeletonCards count={4} /> : (() => {
            const volSum = totalIncome + totalExpenses;
            const pctBalance = volSum > 0 ? Math.round(((totalIncome - totalExpenses) / volSum) * 100) : 0;
            return (
              <>
                <Card title="Total de Receitas" value={totalIncome} icon={TrendingUp} color="success" />
                <Card title="Total de Despesas" value={totalExpenses} icon={TrendingDown} color="danger" />
                <Card title="Balanço Líquido" value={netBalance} icon={DollarSign} color={netBalance >= 0 ? 'primary' : 'danger'} trend={true} percentage={pctBalance} />
                <Card title="Nº de Transações" value={numberOfTransactions} icon={List} color="secondary" isCurrency={false} />
              </>
            );
          })()}
        </div>

        {/* Filters Section */}
        <div className="rounded-md border border-gray-200 bg-white p-6">
          <h3 className="text-[15px] font-semibold text-gray-900 mb-4 flex items-center">
            <Filter size={20} className="mr-2 text-[#00216b]" /> Filtrar Transações
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Pesquisar por descrição..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-[#003cc3] focus:ring-[#003cc3]/20 transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <select
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:border-[#003cc3] focus:ring-[#003cc3]/20 transition-all duration-200"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as '' | 'INCOME' | 'EXPENSE')}
              >
                <option value="">Todos os Tipos</option>
                <option value="INCOME">Receita</option>
                <option value="EXPENSE">Despesa</option>
              </select>
              <ChevronDown size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:border-[#003cc3] focus:ring-[#003cc3]/20 transition-all duration-200"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Todas as Categorias</option>
                {uniqueCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <ChevronDown size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Date Range Filter */}
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <input
                  type="date"
                  className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-[#003cc3] focus:ring-[#003cc3]/20 transition-all duration-200"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="relative flex-1">
                <input
                  type="date"
                  className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-[#003cc3] focus:ring-[#003cc3]/20 transition-all duration-200"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Income vs Expense Chart */}
          <ChartCard
            title="Receitas vs. Despesas (Últimos 7 Meses)"
            chartData={incomeExpenseCombinedData}
            dataKey={['receita', 'despesa']}
            color="#4F46E5" // Primary color for the chart
          />

          {/* Transaction Categories Pie Chart */}
          <PieChartCard
            title="Distribuição por Categoria"
            chartData={filteredCategoryData}
          />
        </div>

        {/* Recent Transactions Section */}
        <div className="rounded-md border border-gray-200 bg-white p-6">
          <h3 className="text-[15px] font-semibold text-gray-900 mb-4">Transações Recentes</h3>
          {loading ? (
            <SkeletonRows count={6} />
          ) : filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))
          ) : (
            <EmptyState
              icon={SearchX}
              title="Nenhuma transação encontrada"
              description={hasActiveFilter ? 'Tente ajustar os filtros para ver mais resultados.' : 'Ainda não existem transações registadas.'}
            />
          )}
          {(searchTerm || selectedType || selectedCategory || startDate || endDate) && (
            <p className="text-xs text-gray-400 mt-2">
              Filtros aplicados à página actual. Navegue entre páginas para ver mais resultados.
            </p>
          )}
          <Pagination
            page={page}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={PAGE_SIZE}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </AdminLayout>
  );
};


export default TransactionsPage;
