import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import { AdminLayout } from '~/components/dashboard/AdminLayout';
import type { AdminCategory } from '~/types/admin';
import { useCategoriesList, useCreateCategory, useUpdateCategory, useDeleteCategory } from '~/hooks/use-categories-query';
import { Pagination } from '~/components/ui/Pagination';

const PAGE_SIZE = 20;

const CategoriesPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [form, setForm] = useState({ name: '', type: 'EXPENSE' });

  const { data: categoriesPage, isLoading: loading } = useCategoriesList(page);
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const removeCategory = useDeleteCategory();

  const categories = categoriesPage?.content ?? [];
  const totalElements = categoriesPage?.totalElements ?? 0;
  const totalPages = categoriesPage?.totalPages ?? 0;

  const handlePageChange = (p: number) => { setPage(p); };

  const openCreate = () => { setEditing(null); setForm({ name: '', type: 'EXPENSE' }); setShowModal(true); };
  const openEdit = (c: AdminCategory) => { setEditing(c); setForm({ name: c.name, type: c.type }); setShowModal(true); };

  const handleSave = async () => {
    if (editing) {
      await updateCategory.mutateAsync({ id: editing.id, body: form });
    } else {
      await createCategory.mutateAsync(form);
    }
    setShowModal(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar categoria?')) return;
    await removeCategory.mutateAsync(id);
  };

  return (
    <AdminLayout>
      <div className="px-6 py-5 space-y-5">
        <div className="flex justify-between items-center">
          <h1 className="text-[22px] font-semibold tracking-tight text-gray-900">Categorias</h1>
          <button onClick={openCreate} className="flex items-center px-4 py-2 bg-[#00216b] text-white rounded-lg hover:bg-[#003cc3] transition-colors">
            <Plus size={16} className="mr-2" /> Nova Categoria
          </button>
        </div>

        <div className="rounded-md border border-gray-200 bg-white p-6">
          {loading ? (
            <p className="text-center text-gray-500 py-8">A carregar...</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Removida em</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.length > 0 ? categories.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center gap-2">
                      <Tag size={14} className="text-[#003cc3]" /> {c.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{c.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{c.isActive ? 'Activa' : 'Inactiva'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.deletedAt ? new Date(c.deletedAt).toLocaleDateString('pt-BR') : '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button onClick={() => openEdit(c)} className="text-[#003cc3] hover:text-[#00216b] mr-3"><Pencil size={16} /></button>
                      <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">Sem categorias.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 0 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={PAGE_SIZE}
            onPageChange={handlePageChange}
          />
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="rounded-md border border-gray-200 bg-white p-6 w-full max-w-md">
              <h2 className="text-[15px] font-semibold text-gray-900 mb-4">{editing ? 'Editar Categoria' : 'Nova Categoria'}</h2>
              <div className="space-y-3">
                <input className="w-full border rounded-lg px-3 py-2" placeholder="Nome" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                <select className="w-full border rounded-lg px-3 py-2" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="EXPENSE">Despesa</option>
                  <option value="INCOME">Receita</option>
                  <option value="BOTH">Ambos</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg text-sm">Cancelar</button>
                <button onClick={handleSave} className="px-4 py-2 bg-[#00216b] text-white rounded-lg text-sm hover:bg-[#003cc3]">Guardar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default CategoriesPage;
