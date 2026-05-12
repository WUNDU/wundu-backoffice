import React, { useState, useEffect, useCallback } from 'react';
import { Bot, DollarSign, Users, MessageSquare, X, ChevronRight } from 'lucide-react';
import { AdminLayout } from '~/components/dashboard/AdminLayout';
import { aiService } from '~/services/admin/ai.service';
import type {
  AiUsage,
  AiCostEstimate,
  AiRateLimit,
  AdminConversationSummary,
  AdminConversationDetail,
  Page,
} from '~/types/admin';

type Tab = 'usage' | 'costs' | 'rate-limits' | 'conversations';

const AiPage: React.FC = () => {
  const [tab, setTab] = useState<Tab>('usage');

  const [usage, setUsage] = useState<AiUsage | null>(null);
  const [costs, setCosts] = useState<AiCostEstimate | null>(null);
  const [rateLimits, setRateLimits] = useState<AiRateLimit[]>([]);
  const [conversations, setConversations] = useState<Page<AdminConversationSummary> | null>(null);
  const [detail, setDetail] = useState<AdminConversationDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [loading, setLoading] = useState(false);

  const loadTab = useCallback(async (t: Tab) => {
    setLoading(true);
    try {
      if (t === 'usage' && !usage) setUsage(await aiService.getUsage());
      if (t === 'costs' && !costs) setCosts(await aiService.getCosts());
      if (t === 'rate-limits' && !rateLimits.length) setRateLimits(await aiService.getRateLimits());
      if (t === 'conversations' && !conversations) setConversations(await aiService.listConversations({ size: 50 }));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [usage, costs, rateLimits, conversations]);

  useEffect(() => { loadTab(tab); }, [tab]);

  const openConversation = async (id: string) => {
    setLoadingDetail(true);
    try { setDetail(await aiService.getConversation(id)); } catch (e) { console.error(e); }
    finally { setLoadingDetail(false); }
  };

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'usage', label: 'Utilização', icon: Bot },
    { key: 'costs', label: 'Custos', icon: DollarSign },
    { key: 'rate-limits', label: 'Rate Limits', icon: Users },
    { key: 'conversations', label: 'Conversações', icon: MessageSquare },
  ];

  return (
    <AdminLayout>
      <div className="px-6 py-5 space-y-5">
        <h1 className="text-[22px] font-semibold tracking-tight text-gray-900 flex items-center gap-2">
          <Bot size={22} className="text-[#003cc3]" /> IA — Monitorização
        </h1>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === key
                  ? 'border-[#003cc3] text-[#003cc3]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {loading && <p className="text-center text-gray-500 py-8">A carregar...</p>}

        {/* Usage Tab */}
        {!loading && tab === 'usage' && usage && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-md border border-gray-200 bg-white p-5">
                <p className="text-xs text-gray-500 uppercase mb-1">Total de Pedidos</p>
                <p className="text-2xl font-bold text-gray-900">{usage.totalRequests.toLocaleString()}</p>
              </div>
              {usage.note && (
                <div className="rounded-md border border-blue-100 bg-blue-50 p-5">
                  <p className="text-xs text-blue-600 uppercase mb-1">Nota</p>
                  <p className="text-sm text-blue-800">{usage.note}</p>
                </div>
              )}
            </div>
            <div className="rounded-md border border-gray-200 bg-white p-6">
              <h2 className="text-[15px] font-semibold text-gray-900 mb-4">Pedidos por Modelo</h2>
              {Object.keys(usage.byModel).length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {Object.entries(usage.byModel).map(([model, count]) => (
                    <div key={model} className="flex items-center justify-between py-3">
                      <span className="text-sm font-mono text-gray-700">{model}</span>
                      <span className="text-sm font-bold text-gray-900">{count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Sem dados.</p>
              )}
            </div>
          </div>
        )}

        {/* Costs Tab */}
        {!loading && tab === 'costs' && costs && (
          <div className="space-y-4">
            {costs.disclaimer && (
              <div className="rounded-md border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                ⚠️ {costs.disclaimer}
              </div>
            )}
            <div className="rounded-md border border-gray-200 bg-white p-6">
              <h2 className="text-[15px] font-semibold text-gray-900 mb-4">Custo Estimado por Modelo</h2>
              {Object.keys(costs.byModel).length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modelo</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Pedidos</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tokens Est.</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Custo (USD)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(costs.byModel).map(([model, data]) => (
                      <tr key={model} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-mono text-gray-700">{model}</td>
                        <td className="px-6 py-4 text-sm text-right text-gray-600">{data.requests.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-right text-gray-600">{data.estimatedTokens.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">
                          ${data.estimatedCostUsd.toFixed(4)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-gray-500">Sem dados.</p>
              )}
            </div>
          </div>
        )}

        {/* Rate Limits Tab */}
        {!loading && tab === 'rate-limits' && (
          <div className="rounded-md border border-gray-200 bg-white p-6">
            <h2 className="text-[15px] font-semibold text-gray-900 mb-4">Utilizadores com Rate Limit Atingido Hoje</h2>
            {rateLimits.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilizador</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Pedidos Hoje</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Limite Diário</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Reset em (s)</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rateLimits.map(r => (
                    <tr key={r.userId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-mono text-gray-700">{r.userId}</td>
                      <td className="px-6 py-4 text-sm text-right text-red-600 font-semibold">{r.dailyRequests}</td>
                      <td className="px-6 py-4 text-sm text-right text-gray-600">{r.dailyLimit}</td>
                      <td className="px-6 py-4 text-sm text-right text-gray-500">{r.ttlSeconds}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-gray-500">Nenhum utilizador atingiu o limite hoje.</p>
            )}
          </div>
        )}

        {/* Conversations Tab */}
        {!loading && tab === 'conversations' && (
          <div className="rounded-md border border-gray-200 bg-white p-6">
            <h2 className="text-[15px] font-semibold text-gray-900 mb-4">Conversações</h2>
            {conversations && conversations.content.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilizador</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Última mensagem</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Mensagens</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Criada</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {conversations.content.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-mono text-gray-700 max-w-[160px] truncate">{c.userId}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-[240px] truncate">{c.lastMessagePreview || '—'}</td>
                      <td className="px-6 py-4 text-sm text-right text-gray-600">{c.messageCount}</td>
                      <td className="px-6 py-4 text-sm text-right text-gray-500">
                        {new Date(c.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openConversation(c.id)}
                          className="text-[#003cc3] hover:text-[#00216b] flex items-center gap-1 text-xs ml-auto"
                        >
                          Ver <ChevronRight size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-gray-500">Sem conversações.</p>
            )}
          </div>
        )}

        {/* Conversation Detail Modal */}
        {(detail || loadingDetail) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setDetail(null)}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h3 className="text-[15px] font-semibold text-gray-900">
                  {detail ? `Conversação — ${detail.totalMessages} mensagens` : 'A carregar...'}
                </h3>
                <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                {loadingDetail && <p className="text-center text-gray-500 py-8">A carregar...</p>}
                {detail && detail.messages.map(m => (
                  <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${
                      m.role === 'user'
                        ? 'bg-[#003cc3] text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <p className="whitespace-pre-wrap">{m.content}</p>
                      <p className={`text-[10px] mt-1 ${m.role === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                        {new Date(m.sentAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AiPage;
