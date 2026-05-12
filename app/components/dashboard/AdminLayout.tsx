import { Link, useLocation } from '@remix-run/react';
import {
  Home, ArrowLeftRight, TrendingUp, TrendingDown, BarChart3,
  ShieldAlert, Users, Bell, Tag, Target, Flag, Server, ScrollText,
  LogOut, Menu, X,
} from 'lucide-react';
import { DashboardLayoutProps } from '~/types/types';
import { useAuthStore } from '~/store/auth-store';
import { useState } from 'react';

type NavItem = { to: string; icon: React.ElementType; label: string };
type NavGroup = { label: string; items: NavItem[] };

const navGroups: NavGroup[] = [
  {
    label: 'Visão Geral',
    items: [
      { to: '/dashboard', icon: Home, label: 'Painel Principal' },
    ],
  },
  {
    label: 'Financeiro',
    items: [
      { to: '/dashboard/transaction', icon: ArrowLeftRight, label: 'Transações' },
      { to: '/dashboard/receipt', icon: TrendingUp, label: 'Receitas' },
      { to: '/dashboard/expense', icon: TrendingDown, label: 'Despesas' },
      { to: '/dashboard/reports', icon: BarChart3, label: 'Relatórios' },
    ],
  },
  {
    label: 'Utilizadores',
    items: [
      { to: '/dashboard/access-management', icon: Users, label: 'Gestão de Acesso' },
      { to: '/dashboard/security', icon: ShieldAlert, label: 'Segurança' },
      { to: '/dashboard/tickets', icon: Bell, label: 'Notificações' },
    ],
  },
  {
    label: 'Plataforma',
    items: [
      { to: '/dashboard/categories', icon: Tag, label: 'Categorias' },
      { to: '/dashboard/goals', icon: Target, label: 'Metas' },
      { to: '/dashboard/feature-flags', icon: Flag, label: 'Feature Flags' },
      { to: '/dashboard/audit', icon: ScrollText, label: 'Audit Log' },
      { to: '/dashboard/system', icon: Server, label: 'Sistema' },
    ],
  },
];

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/transaction': 'Transações',
  '/dashboard/receipt': 'Receitas',
  '/dashboard/expense': 'Despesas',
  '/dashboard/reports': 'Relatórios',
  '/dashboard/access-management': 'Gestão de Acesso',
  '/dashboard/security': 'Segurança',
  '/dashboard/tickets': 'Notificações',
  '/dashboard/categories': 'Categorias',
  '/dashboard/goals': 'Metas',
  '/dashboard/feature-flags': 'Feature Flags',
  '/dashboard/audit': 'Audit Log',
  '/dashboard/system': 'Sistema',
  '/dashboard/profile': 'Meu Perfil',
};

function SidebarContent({ onClose }: { onClose: () => void }) {
  const location = useLocation();
  const { logout, user } = useAuthStore();

  const isActive = (to: string) =>
    to === '/dashboard' ? location.pathname === to : location.pathname.startsWith(to);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'A';

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-2">
          <img src="/logotype.svg" alt="Wundu" className="h-7 w-auto" />
          <span className="text-[15px] font-semibold tracking-tight text-gray-900">Wundu</span>
          <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400">admin</span>
        </div>
        <button className="md:hidden text-gray-400 hover:text-gray-600" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-4">
            <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              {group.label}
            </div>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.to);
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={onClose}
                      className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] transition-colors ${
                        active
                          ? 'bg-[#00216b]/[0.08] text-[#00216b] font-medium'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon size={15} className="shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-gray-200 p-3 shrink-0">
        <div className="flex items-center gap-2 rounded-md px-2 py-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#00216b] text-white text-[11px] font-semibold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="truncate text-[12px] font-medium text-gray-900">{user?.name ?? 'Administrador'}</div>
            <div className="truncate text-[10px] text-gray-400">{user?.email ?? ''}</div>
          </div>
          <button
            onClick={() => logout()}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            title="Encerrar sessão"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentTitle = PAGE_TITLES[location.pathname] ?? 'Wundu Admin';
  const { user } = useAuthStore();
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'A';

  return (
    <div className="flex h-screen bg-[#f8fafc] font-inter">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col">
        <SidebarContent onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Sidebar mobile */}
      {sidebarOpen && (
        <aside className="fixed inset-y-0 left-0 z-50 w-60 flex flex-col md:hidden shadow-xl">
          <SidebarContent onClose={() => setSidebarOpen(false)} />
        </aside>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-gray-200 bg-white/80 backdrop-blur px-4 shrink-0">
          <button
            className="md:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-[13px] min-w-0">
            <span className="font-medium text-gray-900">Wundu</span>
            <span className="text-gray-300">/</span>
            <span className="font-medium text-gray-600 truncate">{currentTitle}</span>
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <button className="relative p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
              <Bell size={16} />
              <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-red-500" />
            </button>
            <Link to="/dashboard/profile">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#00216b] text-white text-[11px] font-semibold">
                {initials}
              </div>
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
