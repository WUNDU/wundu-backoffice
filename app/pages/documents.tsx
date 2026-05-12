import React, { useState, useEffect } from 'react';
import { FileText, Search, Trash2, RefreshCw, RotateCcw, X, Eye } from 'lucide-react';
import { AdminLayout } from '~/components/dashboard/AdminLayout';
import { documentsService } from '~/services/admin/documents.service';
import type { AdminDocumentSummary, AdminDocumentDetail, OcrStats, Page } from '~/types/admin';
import { useToast, ToastContainer } from '~/components/ui/Toast';
import { Pagination } from '~/components/ui/Pagination';

const PAGE_SIZE = 20;

const DocumentsPage: React.FC = () => {
  const [docs, setDocs] = useState<Page<AdminDocumentSummary> | null>(null);
  const [stats, setStats] = useState<OcrStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');
  const [page, setPage] = useState(0);
  const [detail, setDetail] = useState<AdminDocumentDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [reprocessing, setReprocessing] = useState<string | null>(null);
  const { toasts, showToast, dismiss } = useToast();

  const load = (uid?: string, p = 0) => {
    setLoading(true);
    Promise.all([
      documentsService.list({ userId: uid || undefined, page: p, size: PAGE_SIZE }),
      stats ? Promise.resolve(stats) : documentsService.getStats(),
    ])
      .then(([d, s]) => { setDocs(d); setStats(s); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handlePageChange = (p: number) => { setPage(p); load(userId, p); };

  const openDetail = async (id: string) => {
    setLoadingDetail(true);
    try { setDetail(await documentsService.get(id)); } catch (e) { console.error(e); }
    finally { setLoadingDetail(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar documento?')) return;
    setDeleting(id);
    try {
      await documentsService.delete(id);
      setDocs(prev => prev ? { ...prev, content: prev.content.filter(d => d.id !== id) } : null);
      showToast('Documento eliminado.', 'success');
    } catch (e) { console.error(e); showToast('Erro ao eliminar.', 'error'); }
    finally { setDeleting(null); }
  };

  const handleReprocess = async (id: string) => {
    setReprocessing(id);
    try {
      await documentsService.reprocess(id);
      showToast('Reprocessamento iniciado.', 'success');
    } catch (e) { console.error(e); showToast('Erro ao reprocessar.', 'error'); }
    finally { setReprocessing(null); }
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PROCESSED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
    };
    return map[s] || 'bg-gray-100 text-gray-600';
  };

  const fmtBytes = (b: number) => b > 1024 * 1024
    ? `${(b / 1024 / 1024).toFixed(1)} MB`
    : `${(b / 1024).toFixed(0)} KB`;

  return (
    <AdminLayout>
      <div className="px-6 py-5 space-y-5">
        <div className="flex justify-between items-center">
          <h1 className="text-[22px] font-semibold tracking-tight text-gray-900 flex items-center gap-2">
            <FileText size={22} className="text-[#003cc3]" /> Documentos OCR
          </h1>
          <button onClick={() => load(userId)} className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm text-gray-700 hover:bg-gray-50">
            <RefreshCw size={14} /> Actualizar
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-md border border-gray-200 bg-white p-4">
              <p className="text-xs text-gray-500 uppercase mb-1">Total</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="rounded-md border border-gray-200 bg-white p-4">
              <p className="text-xs text-gray-500 uppercase mb-1">Taxa Sucesso</p>
              <p className="text-xl font-bold text-green-600">{stats.successRate.toFixed(1)}%</p>
            </div>
            <div className="rounded-md border border-gray-200 bg-white p-4">
              <p className="text-xs text-gray-500 uppercase mb-1">Conf. Média</p>
              <p className="text-xl font-bold text-blue-600">{(stats.avgConfidence * 100).toFixed(1)}%</p>
            </div>
            <div className="rounded-md border border-gray-200 bg-white p-4">
              <p className="text-xs text-gray-500 uppercase mb-1">Por Estado</p>
              <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                {Object.entries(stats.byStatus).map(([k, v]) => (
                  <div key={k} className="flex justify-between"><span>{k}</span><span className="font-semibold">{v}</span></div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Filtrar por User ID..."
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-[#003cc3] focus:ring-[#003cc3]/20"
              value={userId}
              onChange={e => setUserId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && load(userId)}
            />
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <button onClick={() => load(userId)} className="px-4 py-2 bg-[#00216b] text-white rounded-lg text-sm hover:bg-[#003cc3] transition-colors">
            Filtrar
          </button>
        </div>

        {/* Table */}
        <div className="rounded-md border border-gray-200 bg-white p-6">
          {loading ? (
            <p className="text-center text-gray-500 py-8">A carregar...</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ficheiro</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilizador</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Confiança</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tamanho</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {docs && docs.content.length > 0 ? docs.content.map(d => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-[160px] truncate">{d.fileName}</td>
                    <td className="px-6 py-4 text-xs font-mono text-gray-500 max-w-[120px] truncate">{d.userId}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{d.docType || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusBadge(d.status)}`}>{d.status}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-600">
                      {d.geminiConfidence !== null ? `${(d.geminiConfidence * 100).toFixed(0)}%` : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-600">{fmtBytes(d.fileSize)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button onClick={() => openDetail(d.id)} className="text-[#003cc3] hover:text-[#00216b]" title="Ver detalhe">
                          <Eye size={15} />
                        </button>
                        <button onClick={() => handleReprocess(d.id)} disabled={reprocessing === d.id} className="text-amber-500 hover:text-amber-700 disabled:opacity-50" title="Reprocessar OCR">
                          <RotateCcw size={15} />
                        </button>
                        <button onClick={() => handleDelete(d.id)} disabled={deleting === d.id} className="text-red-500 hover:text-red-700 disabled:opacity-50" title="Eliminar">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={7} className="px-6 py-4 text-center text-gray-500">Sem documentos.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {docs && (
          <Pagination
            page={page}
            totalPages={docs.totalPages}
            totalElements={docs.totalElements}
            pageSize={PAGE_SIZE}
            onPageChange={handlePageChange}
          />
        )}

        {/* Detail Modal */}
        {(detail || loadingDetail) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setDetail(null)}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h3 className="text-[15px] font-semibold text-gray-900">{detail?.fileName || 'Detalhe'}</h3>
                <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {loadingDetail && <p className="text-center text-gray-500">A carregar...</p>}
                {detail && (
                  <>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {[
                        ['Provider', detail.provider],
                        ['Tipo', detail.docType],
                        ['Estado', detail.status],
                        ['Confiança', detail.geminiConfidence !== null ? `${(detail.geminiConfidence * 100).toFixed(1)}%` : '—'],
                        ['Modelo Gemini', detail.geminiModelVersion || '—'],
                        ['Hash', detail.docHash ? detail.docHash.slice(0, 16) + '...' : '—'],
                        ['Criado em', new Date(detail.createdAt).toLocaleString('pt-BR')],
                      ].map(([k, v]) => (
                        <div key={k}>
                          <p className="text-xs text-gray-400 uppercase mb-0.5">{k}</p>
                          <p className="text-gray-800 font-medium">{v}</p>
                        </div>
                      ))}
                    </div>
                    {detail.extractedText && (
                      <div>
                        <p className="text-xs text-gray-400 uppercase mb-1">Texto Extraído</p>
                        <pre className="bg-gray-50 rounded-lg p-3 text-xs text-gray-700 whitespace-pre-wrap max-h-48 overflow-y-auto">{detail.extractedText}</pre>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </AdminLayout>
  );
};

export default DocumentsPage;
