import React, { useState, useMemo, useEffect } from 'react';
import {
  TrendingDown,
  Filter,
  Search,
  ChevronDown,
  List,
  Tag,
  Wallet
} from 'lucide-react';
import { Card } from '~/components/dashboard/Card';
import { ChartCard } from '~/components/dashboard/ChartCard';
import { PieChartCard } from '~/components/dashboard/PieChartCard';
import { ExpenseItem } from '~/components/dashboard/ExpenseItem';
import { AdminLayout } from '~/components/dashboard/AdminLayout';
import { transactionsService } from '~/services/admin/transactions.service';
import type { AdminTransactionSummary } from '~/types/admin';
import { Pagination } from '~/components/ui/Pagination';

const PAGE_SIZE = 50;

/**
 * ExpensesPage Component
 * This page provides a detailed overview of expense transactions,
 * including summary cards, expense trend charts, expense category distribution,
 * and a detailed list of individual expenses with filtering capabilities.
 * Designed for an administrative backoffice view.
 */
// Backend returns LocalDateTime as number array [year, month, day, hour, min, sec?]
function parseJavaDate(d: unknown): Date {
  if (Array.isArray(d)) {
    const [y, mo, day, h = 0, min = 0, s = 0] = d as number[];
    return new Date(y, mo - 1, day, h, min, s);
  }
  return new Date(d as string);
}

const ExpensesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [apiExpenses, setApiExpenses] = useState<AdminTransactionSummary[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadPage = (p = 0) => {
    setLoading(true);
    transactionsService.list({ type: 'EXPENSE', size: PAGE_SIZE, page: p, sort: 'createdAt,desc' })
      .then((r) => { setApiExpenses(r.content); setTotalElements(r.totalElements); setTotalPages(r.totalPages); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadPage(); }, []);

  const handlePageChange = (p: number) => { setPage(p); loadPage(p); };

  const detailedExpenses = useMemo(() => apiExpenses.map(tx => ({
    id: tx.id,
    description: tx.description,
    category: tx.categoryName,
    amount: -tx.amount,
    date: parseJavaDate(tx.transactionDate).toLocaleDateString('pt-BR'),
    type: 'expense',
    source: tx.source,
    status: 'Concluído',
    paymentMethod: '',
  })), [apiExpenses]);

  const expenseData = useMemo(() => {
    const monthly: Record<string, number> = {};
    apiExpenses.forEach(tx => {
      const m = parseJavaDate(tx.transactionDate).toLocaleString('pt-BR', { month: 'short' });
      monthly[m] = (monthly[m] || 0) + tx.amount;
    });
    return Object.entries(monthly).map(([month, despesa]) => ({ month, despesa }));
  }, [apiExpenses]);

  const filteredExpenses = useMemo(() => {
    return detailedExpenses.filter(e => {
      const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === '' || e.category === selectedCategory;
      const txDate = new Date(e.date.split('/').reverse().join('-'));
      const matchesDate = (!startDate || txDate >= new Date(startDate)) && (!endDate || txDate <= new Date(endDate));
      return matchesSearch && matchesCategory && matchesDate;
    });
  }, [detailedExpenses, searchTerm, selectedCategory, startDate, endDate]);

  const totalExpenses = useMemo(() => filteredExpenses.reduce((s, e) => s + Math.abs(e.amount), 0), [filteredExpenses]);
  const averageExpense = useMemo(() => filteredExpenses.length > 0 ? totalExpenses / filteredExpenses.length : 0, [totalExpenses, filteredExpenses.length]);
  const numberOfExpenses = filteredExpenses.length;

  const uniqueCategories = useMemo(() => {
    const categories = new Set<string>();
    detailedExpenses.forEach(e => e.category && categories.add(e.category));
    return Array.from(categories);
  }, [detailedExpenses]);

  const filteredExpenseCategoryData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredExpenses.forEach(e => {
      const cat = e.category || 'Outro';
      map[cat] = (map[cat] || 0) + Math.abs(e.amount);
    });
    const colors = ['#ef4444', '#FFC107', '#2196F3', '#9C27B0', '#FF5722', '#00BCD4', '#8BC34A'];
    return Object.entries(map).map(([name, value], i) => ({ name, value, color: colors[i % colors.length] }));
  }, [filteredExpenses]);

  return (
    <AdminLayout>
      <div className="px-6 py-5 space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <h2 className="text-[22px] font-semibold tracking-tight text-gray-900">Gestão de Despesas</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card title="Total de Despesas" value={totalExpenses} icon={TrendingDown} color="danger" trend={true} percentage={-10.0} />
          <Card title="Despesa Média" value={averageExpense} icon={Wallet} color="primary" trend={true} percentage={-3.0} />
          <Card title="Nº de Despesas" value={numberOfExpenses} icon={List} color="secondary" isCurrency={false} />
          <Card title="Categorias Únicas" value={uniqueCategories.length} icon={Tag} color="danger" isCurrency={false} />
        </div>

        <div className="rounded-md border border-gray-200 bg-white p-6">
          <h3 className="text-[15px] font-semibold text-gray-900 mb-4 flex items-center">
            <Filter size={20} className="mr-2 text-[#00216b]" /> Filtrar Despesas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <input type="text" placeholder="Pesquisar por descrição..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-[#003cc3] focus:ring-[#003cc3]/20" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <div className="relative">
              <select className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:border-[#003cc3] focus:ring-[#003cc3]/20" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                <option value="">Todas as Categorias</option>
                {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div className="flex space-x-2 lg:col-span-2">
              <input type="date" className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-[#003cc3] focus:ring-[#003cc3]/20" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <input type="date" className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-[#003cc3] focus:ring-[#003cc3]/20" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Tendência de Despesas" chartData={expenseData} dataKey="despesa" color="#ef4444" />
          <PieChartCard title="Distribuição por Categoria" chartData={filteredExpenseCategoryData} />
        </div>

        <div className="rounded-md border border-gray-200 bg-white p-6">
          <h3 className="text-[15px] font-semibold text-gray-900 mb-4">Despesas Detalhadas</h3>
          {loading ? (
            <p className="text-center text-gray-500 py-8">A carregar...</p>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[700px]">
                {filteredExpenses.length > 0 ? (
                  filteredExpenses.map(expense => (
                    <ExpenseItem key={expense.id} transaction={expense as any} />
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">Nenhuma despesa encontrada.</p>
                )}
              </div>
            </div>
          )}
        </div>
        <Pagination
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={PAGE_SIZE}
          onPageChange={handlePageChange}
        />
      </div>
    </AdminLayout>
  );
};

export default ExpensesPage;
