// TicketManagementPage.tsx
import { Bell, CheckCircle, MessageSquare, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AdminLayout } from '~/components/dashboard/AdminLayout';
import { notificationsService } from '~/services/admin/notifications.service';
import type { AdminNotification } from '~/types/admin';

export default function TicketManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationsService.list({ size: 50 })
      .then((r) => setNotifications(r.content))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredNotifications = notifications.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || (filterStatus === 'read' ? n.isRead : !n.isRead);
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="px-6 py-5 space-y-5">
        <h1 className="text-[22px] font-semibold tracking-tight text-gray-900">Notificações</h1>
        <p className="text-[13px] text-gray-500">Visualize e gerencie notificações dos utilizadores.</p>

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-1 w-full md:max-w-sm">
            <input
              type="text"
              placeholder="Pesquisar notificações..."
              className="pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:border-[#003cc3] focus:ring-[#003cc3]/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search size={16} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <select
            className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:border-[#003cc3] focus:ring-[#003cc3]/20 cursor-pointer"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Todas</option>
            <option value="unread">Não lidas</option>
            <option value="read">Lidas</option>
          </select>
        </div>

        <div className="rounded-md border border-gray-200 bg-white p-6">
          <h2 className="text-[15px] font-semibold text-gray-900 mb-4">Lista de Notificações</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mensagem</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lida</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">A carregar...</td></tr>
                ) : filteredNotifications.length > 0 ? (
                  filteredNotifications.map(n => (
                    <tr key={n.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Bell size={16} className="text-[#003cc3]" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{n.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">{n.message}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {n.isRead
                          ? <CheckCircle size={16} className="text-green-500" />
                          : <MessageSquare size={16} className="text-yellow-500" />}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(n.createdAt).toLocaleString('pt-BR')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Nenhuma notificação encontrada.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
