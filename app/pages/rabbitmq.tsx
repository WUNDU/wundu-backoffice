import React, { useState, useEffect } from 'react';
import { Radio, RefreshCw, RotateCcw, CheckCircle } from 'lucide-react';
import { AdminLayout } from '~/components/dashboard/AdminLayout';
import { rabbitmqService } from '~/services/admin/rabbitmq.service';
import type { QueueInfo } from '~/types/admin';

const RabbitmqPage: React.FC = () => {
  const [queues, setQueues] = useState<QueueInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState<string | null>(null);
  const [retryResult, setRetryResult] = useState<Record<string, number>>({});

  const load = () => {
    setLoading(true);
    rabbitmqService.getQueues()
      .then(setQueues)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleRetry = async (queueName: string) => {
    if (!confirm(`Reenviar mensagens da DLQ "${queueName}"?`)) return;
    setRetrying(queueName);
    try {
      const r = await rabbitmqService.retryDlq(queueName);
      setRetryResult(prev => ({ ...prev, [queueName]: r.retriedMessages }));
    } catch (e) { console.error(e); }
    finally { setRetrying(null); }
  };

  const dlqQueues = queues.filter(q => q.isDlq);
  const mainQueues = queues.filter(q => !q.isDlq);

  return (
    <AdminLayout>
      <div className="px-6 py-5 space-y-5">
        <div className="flex justify-between items-center">
          <h1 className="text-[22px] font-semibold tracking-tight text-gray-900 flex items-center gap-2">
            <Radio size={22} className="text-[#003cc3]" /> Filas RabbitMQ
          </h1>
          <button onClick={load} className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm text-gray-700 hover:bg-gray-50">
            <RefreshCw size={14} /> Actualizar
          </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-8">A carregar...</p>
        ) : (
          <>
            {/* Main Queues */}
            <div className="rounded-md border border-gray-200 bg-white p-6">
              <h2 className="text-[15px] font-semibold text-gray-900 mb-4">Filas Principais</h2>
              {mainQueues.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fila</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Mensagens</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Consumidores</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mainQueues.map(q => (
                      <tr key={q.name} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-mono text-gray-800">{q.name}</td>
                        <td className="px-6 py-4 text-sm text-right">
                          <span className={`font-semibold ${q.messageCount > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                            {q.messageCount}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-right text-gray-600">{q.consumerCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-gray-500">Sem filas.</p>
              )}
            </div>

            {/* DLQ */}
            <div className="rounded-md border border-red-100 bg-white p-6">
              <h2 className="text-[15px] font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Dead Letter Queues
              </h2>
              {dlqQueues.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fila</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Mensagens</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dlqQueues.map(q => (
                      <tr key={q.name} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-mono text-gray-800">{q.name}</td>
                        <td className="px-6 py-4 text-sm text-right font-semibold text-red-600">{q.messageCount}</td>
                        <td className="px-6 py-4 text-right">
                          {retryResult[q.name] !== undefined ? (
                            <span className="flex items-center justify-end gap-1 text-green-600 text-xs">
                              <CheckCircle size={13} /> {retryResult[q.name]} reenviadas
                            </span>
                          ) : (
                            <button
                              onClick={() => handleRetry(q.name)}
                              disabled={retrying === q.name || q.messageCount === 0}
                              className="flex items-center gap-1 ml-auto text-sm text-[#003cc3] hover:text-[#00216b] disabled:text-gray-400 disabled:cursor-not-allowed"
                            >
                              <RotateCcw size={14} />
                              {retrying === q.name ? 'A reenviar...' : 'Retry DLQ'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-gray-500">Sem Dead Letter Queues.</p>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default RabbitmqPage;
