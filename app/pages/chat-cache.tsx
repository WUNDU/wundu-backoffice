import React, { useState } from 'react';
import { DatabaseZap, Trash2 } from 'lucide-react';
import { AdminLayout } from '~/components/dashboard/AdminLayout';
import { chatCacheService } from '~/services/admin/chat-cache.service';
import type { ClearCacheResponse } from '~/types/admin';

const ChatCachePage: React.FC = () => {
  const [clearing, setClearing] = useState(false);
  const [result, setResult] = useState<ClearCacheResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClear = async () => {
    if (!confirm('Limpar todo o cache de chat? Esta acção não pode ser revertida.')) return;
    setClearing(true);
    setResult(null);
    setError(null);
    try {
      const r = await chatCacheService.clear();
      setResult(r);
    } catch (e) {
      setError('Erro ao limpar cache. Tenta novamente.');
      console.error(e);
    } finally {
      setClearing(false);
    }
  };

  return (
    <AdminLayout>
      <div className="px-6 py-5 space-y-5">
        <h1 className="text-[22px] font-semibold tracking-tight text-gray-900 flex items-center gap-2">
          <DatabaseZap size={22} className="text-[#003cc3]" /> Cache de Chat
        </h1>

        <div className="rounded-md border border-gray-200 bg-white p-8 max-w-lg">
          <p className="text-sm text-gray-600 mb-6">
            O cache de chat armazena respostas temporárias do assistente IA para reduzir latência. 
            Ao limpar, as próximas respostas serão geradas de novo pelo modelo.
          </p>

          <button
            onClick={handleClear}
            disabled={clearing}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            <Trash2 size={15} />
            {clearing ? 'A limpar...' : 'Limpar Cache de Chat'}
          </button>

          {result && (
            <div className="mt-6 rounded-md border border-green-200 bg-green-50 px-4 py-3">
              <p className="text-sm font-semibold text-green-800">{result.message}</p>
              <p className="text-sm text-green-700 mt-1">{result.entriesRemoved} entradas removidas.</p>
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ChatCachePage;
