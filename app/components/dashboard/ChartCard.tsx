// ChartCard.tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartCardProps } from '~/types/types';

export const ChartCard: React.FC<ChartCardProps> = ({ title, chartData, dataKey, color, isCurrencyChart = false }) => {
  const fmt = (v: number) => {
    if (isCurrencyChart) {
      if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M Kz`;
      if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K Kz`;
      return `${v} Kz`;
    }
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
    return `${v}`;
  };

  return (
    <div className="rounded-md border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <h3 className="text-[13px] font-semibold tracking-tight text-gray-900">{title}</h3>
        <span className="text-[11px] text-gray-400">Últimos 7 meses</span>
      </div>
      <div className="p-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 30, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} style={{ fontSize: '11px' }} tick={{ fill: '#94a3b8' }} />
            <YAxis axisLine={false} tickLine={false} tickFormatter={fmt} style={{ fontSize: '11px' }} tick={{ fill: '#94a3b8' }} />
            <Tooltip
              contentStyle={{ fontSize: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
              formatter={(v: number) =>
                isCurrencyChart
                  ? [new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(v), title]
                  : [v.toLocaleString(), title]
              }
              labelFormatter={(l: string) => `${l}/2025`}
            />
            {Array.isArray(dataKey) ? (
              <>
                <Line type="monotone" dataKey={dataKey[0]} stroke="#16a34a" strokeWidth={2} dot={false} activeDot={{ r: 4 }} name="Receitas" />
                <Line type="monotone" dataKey={dataKey[1]} stroke="#dc2626" strokeWidth={2} dot={false} activeDot={{ r: 4 }} name="Despesas" />
              </>
            ) : (
              <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
