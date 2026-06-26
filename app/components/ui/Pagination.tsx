import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number; // 0-indexed
  totalPages: number;
  totalElements?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, totalElements, pageSize, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const from = totalElements != null && pageSize != null ? page * pageSize + 1 : null;
  const to = totalElements != null && pageSize != null ? Math.min((page + 1) * pageSize, totalElements) : null;

  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 0; i < totalPages; i++) pages.push(i);
  } else {
    pages.push(0);
    if (page > 2) pages.push('...');
    for (let i = Math.max(1, page - 1); i <= Math.min(totalPages - 2, page + 1); i++) pages.push(i);
    if (page < totalPages - 3) pages.push('...');
    pages.push(totalPages - 1);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-4 px-1">
      {from != null && to != null && totalElements != null && (
        <span className="text-sm text-gray-500">
          {from}–{to} de {totalElements} registos
        </span>
      )}
      <nav aria-label="Paginação" className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          aria-label="Página anterior"
          className="p-1.5 rounded-md border border-gray-300 disabled:opacity-40 hover:bg-gray-50 transition"
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </button>
        {pages.map((p, i) =>
          p === '...'
            ? <span key={`e${i}`} className="px-2 text-gray-400" aria-hidden="true">…</span>
            : <button
                key={p}
                onClick={() => onPageChange(p as number)}
                aria-label={`Página ${(p as number) + 1}`}
                aria-current={p === page ? 'page' : undefined}
                className={`px-3 py-1 rounded-md text-sm font-medium border transition ${
                  p === page
                    ? 'bg-[#00216b] text-white border-[#00216b]'
                    : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                }`}
              >
                {(p as number) + 1}
              </button>
        )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          aria-label="Próxima página"
          className="p-1.5 rounded-md border border-gray-300 disabled:opacity-40 hover:bg-gray-50 transition"
        >
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </nav>
    </div>
  );
}
