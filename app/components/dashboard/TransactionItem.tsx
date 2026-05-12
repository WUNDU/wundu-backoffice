import { TrendingUp, TrendingDown, CreditCard } from 'lucide-react';
import { TransactionItemProps } from '~/types/types';

export const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const { description, category, amount, date, type } = transaction;

  return (
    <div className="flex items-center py-2.5 border-b border-gray-100 last:border-0 hover:bg-gray-50/60 transition-colors">
      <div className={`flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center ${
        type === 'income' ? 'bg-green-50 text-green-600' :
        type === 'expense' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
      }`}>
        {type === 'income' ? <TrendingUp size={14} /> : type === 'expense' ? <TrendingDown size={14} /> : <CreditCard size={14} />}
      </div>
      <div className="ml-3 flex-1 min-w-0">
        <p className="text-[13px] font-medium text-gray-800 truncate">{description}</p>
        <p className="text-[11px] text-gray-400">{category} · {date}</p>
      </div>
      <div className={`text-[13px] font-mono font-medium tabular-nums ${amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
        {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(amount)}
      </div>
    </div>
  );
};