import React, { useState, useMemo, useEffect } from 'react';
import {
  TrendingUp,
  Filter,
  Search,
  ChevronDown,
  List,
  Wallet,
  Tag
} from 'lucide-react';
import { Card } from '~/components/dashboard/Card';
import { ChartCard } from '~/components/dashboard/ChartCard';
import { PieChartCard } from '~/components/dashboard/PieChartCard';
import { ReceiptItem } from '~/components/dashboard/ReceiptItem';
import { AdminLayout } from '~/components/dashboard/AdminLayout';
import { useAdminTransactionsStore } from '~/store/admin-transactions-store';
import type { AdminTransactionSummary } from '~/types/admin';

function parseJavaDate(d: unknown): Date {
  if (Array.isArray(d)) {
    const [y, mo, day, h = 0, min = 0, s = 0] = d as number[];
    return new Date(y, mo - 1, day, h, min, s);
  }
  return new Date(d as string);
}

const ReceiptsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const { income: slot, isLoading: loading, fetch: fetchTx } = useAdminTransactionsStore();
  const apiReceipts: AdminTransactionSummary[] = slot.items;

  useEffect(() => { fetchTx('INCOME', 0); }, [fetchTx]);

  const detailedReceipts = useMemo(() => apiReceipts.map(tx => ({
    id: tx.id,
    description: tx.description,
    category: tx.categoryName,
    amount: tx.amount,
    date: parseJavaDate(tx.transactionDate).toLocaleDateString('pt-BR'),
    type: 'income',
    source: tx.source,
    status: 'Concluído',
  })), [apiReceipts]);

  const incomeData = useMemo(() => {
    const monthly: Record<string, number> = {};
    apiReceipts.forEach(tx => {
      const m = parseJavaDate(tx.transactionDate).toLocaleString('pt-BR', { month: 'short' });
      monthly[m] = (monthly[m] || 0) + tx.amount;
    });
    return Object.entries(monthly).map(([month, receita]) => ({ month, receita }));
  }, [apiReceipts]);

  const filteredReceipts = useMemo(() => {
    return detailedReceipts.filter(r => {
      const matchesSearch = r.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === '' || r.category === selectedCategory;
      const txDate = new Date(r.date.split('/').reverse().join('-'));
      const matchesDate = (!startDate || txDate >= new Date(startDate)) && (!endDate || txDate <= new Date(endDate));
      return matchesSearch && matchesCategory && matchesDate;
    });
  }, [detailedReceipts, searchTerm, selectedCategory, startDate, endDate]);

  const totalIncome = useMemo(() => filteredReceipts.reduce((s, r) => s + r.amount, 0), [filteredReceipts]);
  const averageIncome = useMemo(() => filteredReceipts.length > 0 ? totalIncome / filteredReceipts.length : 0, [totalIncome, filteredReceipts.length]);
  const numberOfReceipts = filteredReceipts.length;

  const uniqueCategories = useMemo(() => {
    const s = new Set<string>();
    detailedReceipts.forEach(r => r.category && s.add(r.category));
    return Array.from(s);
  }, [detailedReceipts]);

  const uniqueSources = useMemo(() => {
    const s = new Set<string>();
    detailedReceipts.forEach(r => r.source && s.add(r.source));
    return Array.from(s);
  }, [detailedReceipts]);

  const filteredIncomeSourceData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredReceipts.forEach(r => {
      const src = r.source || 'Outros';
      map[src] = (map[src] || 0) + r.amount;
    });
    const colors = ['#4CAF50', '#FFC107', '#2196F3', '#9C27B0', '#FF5722', '#00BCD4', '#8BC34A'];
    return Object.entries(map).map(([name, value], i) => ({ name, value, color: colors[i % colors.length] }));
  }, [filteredReceipts]);

  return (
    <AdminLayout>
      <div className="px-6 py-5 space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <h2 className="text-[22px] font-semibold tracking-tight text-gray-900">Gestão de Receitas</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card title="Total de Receitas" value={totalIncome} icon={TrendingUp} color="success" trend={true} percentage={15.0} />
          <Card title="Receita Média" value={averageIncome} icon={Wallet} color="primary" trend={true} percentage={5.0} />
          <Card title="Nº de Receitas" value={numberOfReceipts} icon={List} color="secondary" isCurrency={false} />
          <Card title="Fontes Únicas" value={uniqueSources.length} icon={Tag} color="success" isCurrency={false} />
        </div>

        <div className="rounded-md border border-gray-200 bg-white p-6">
          <h3 className="text-[15px] font-semibold text-gray-900 mb-4 flex items-center">
            <Filter size={20} className="mr-2 text-[#00216b]" /> Filtrar Receitas
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
          <ChartCard title="Tendência de Receitas" chartData={incomeData} dataKey="receita" color="#22c55e" />
          <PieChartCard title="Distribuição por Fonte" chartData={filteredIncomeSourceData} />
        </div>

        <div className="rounded-md border border-gray-200 bg-white p-6">
          <h3 className="text-[15px] font-semibold text-gray-900 mb-4">Receitas Detalhadas</h3>
          {loading ? (
            <p className="text-center text-gray-500 py-8">A carregar...</p>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[700px]">
                {filteredReceipts.length > 0 ? (
                  filteredReceipts.map(r => (
                    <ReceiptItem key={r.id} receipt={r as any} />
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">Nenhuma receita encontrada.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ReceiptsPage;

