import { Link, useLocation } from "@remix-run/react";
import {
  Home,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  BarChart3,
  ShieldAlert,
  Users,
  Bell,
  Tag,
  Target,
  Flag,
  Server,
  ScrollText,
  LogOut,
  Menu,
  X,
  Bot,
  MonitorSmartphone,
  Radio,
  FileText,
  DatabaseZap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { DashboardLayoutProps } from "~/types/types";
import { useAuthStore } from "~/store/auth-store";
import { useState } from "react";

type NavItem = { to: string; icon: React.ElementType; label: string };
type NavGroup = { label: string; items: NavItem[] };

const navGroups: NavGroup[] = [
  {
    label: "Visão Geral",
    items: [{ to: "/dashboard", icon: Home, label: "Painel Principal" }],
  },
  {
    label: "Financeiro",
    items: [
      {
        to: "/dashboard/transaction",
        icon: ArrowLeftRight,
        label: "Transações",
      },
      { to: "/dashboard/receipt", icon: TrendingUp, label: "Receitas" },
      { to: "/dashboard/expense", icon: TrendingDown, label: "Despesas" },
      { to: "/dashboard/reports", icon: BarChart3, label: "Relatórios" },
    ],
  },
  {
    label: "Utilizadores",
    items: [
      {
        to: "/dashboard/access-management",
        icon: Users,
        label: "Gestão de Acesso",
      },
      { to: "/dashboard/security", icon: ShieldAlert, label: "Segurança" },
      { to: "/dashboard/tickets", icon: Bell, label: "Notificações" },
      { to: "/dashboard/sessions", icon: MonitorSmartphone, label: "Sessões" },
    ],
  },
  {
    label: "Plataforma",
    items: [
      { to: "/dashboard/categories", icon: Tag, label: "Categorias" },
      { to: "/dashboard/goals", icon: Target, label: "Metas" },
      { to: "/dashboard/documents", icon: FileText, label: "Documentos OCR" },
      { to: "/dashboard/rabbitmq", icon: Radio, label: "RabbitMQ" },
      {
        to: "/dashboard/chat-cache",
        icon: DatabaseZap,
        label: "Cache de Chat",
      },
      { to: "/dashboard/ai", icon: Bot, label: "IA" },
      { to: "/dashboard/feature-flags", icon: Flag, label: "Feature Flags" },
      { to: "/dashboard/audit", icon: ScrollText, label: "Audit Log" },
      { to: "/dashboard/system", icon: Server, label: "Sistema" },
    ],
  },
];

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/transaction": "Transações",
  "/dashboard/receipt": "Receitas",
  "/dashboard/expense": "Despesas",
  "/dashboard/reports": "Relatórios",
  "/dashboard/access-management": "Gestão de Acesso",
  "/dashboard/security": "Segurança",
  "/dashboard/tickets": "Notificações",
  "/dashboard/categories": "Categorias",
  "/dashboard/goals": "Metas",
  "/dashboard/documents": "Documentos OCR",
  "/dashboard/rabbitmq": "Filas RabbitMQ",
  "/dashboard/chat-cache": "Cache de Chat",
  "/dashboard/sessions": "Sessões Activas",
  "/dashboard/ai": "IA — Monitorização",
  "/dashboard/feature-flags": "Feature Flags",
  "/dashboard/audit": "Audit Log",
  "/dashboard/system": "Sistema",
  "/dashboard/profile": "Meu Perfil",
};

/*
  Intent: Financial admin backoffice — operator managing users, transactions, compliance.
  Precision instrument; authoritative navy territory.

  Palette: #f4f7ff sidebar surface (brand-tinted, barely visible); #00216b primary borders/accents;
  cool slate for text hierarchy. Every surface stays in the same blue-navy hue family.

  Depth: Borders-only. Single fine line separates sidebar from content. No shadows inside sidebar.

  Signature: border-l-2 active ledger-line — a precise structural mark, not a button fill.
  Appears on active nav items in expanded mode; traces the brand color with rounded-md corners.

  Spacing base: 4px (Tailwind 1 unit). Nav items: py-[7px], gap-2.5. Labels: tracking-[0.12em].
*/

function SidebarContent({
  onClose,
  collapsed = false,
  onToggleCollapse,
}: {
  onClose: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const location = useLocation();
  const { logout, user } = useAuthStore();

  const isActive = (to: string) =>
    to === "/dashboard"
      ? location.pathname === to
      : location.pathname.startsWith(to);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "A";

  return (
    <div className="h-full flex flex-col bg-[#f4f7ff] border-r border-[#00216b]/[0.1]">
      {/* ── Logo header ── */}
      <div
        className={`flex items-center h-14 border-b border-[#00216b]/[0.08] shrink-0 ${
          collapsed ? "justify-center px-2" : "justify-between px-4"
        }`}
      >
        {collapsed ? (
          /* Collapsed: toggle button is the only element */
          <button
            onClick={onToggleCollapse}
            title="Expandir sidebar"
            className="flex items-center justify-center w-8 h-8 rounded-md text-[#00216b]/40 hover:text-[#00216b] hover:bg-[#00216b]/[0.06] transition-colors"
          >
            <ChevronRight size={15} />
          </button>
        ) : (
          <>
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src="/logotype.svg"
                alt="Wundu"
                className="h-7 w-auto shrink-0"
              />
              <span className="text-[9px] font-medium tracking-[0.1em] uppercase bg-[#00216b]/[0.08] text-[#00216b]/60 px-1.5 py-0.5 rounded-sm shrink-0 select-none">
                admin
              </span>
            </div>
            {/* Desktop: collapse chevron */}
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                title="Colapsar sidebar"
                className="ml-2 flex items-center justify-center w-6 h-6 rounded-md text-[#00216b]/35 hover:text-[#00216b] hover:bg-[#00216b]/[0.06] transition-colors shrink-0"
              >
                <ChevronLeft size={14} />
              </button>
            )}
            {/* Mobile: close button */}
            {!onToggleCollapse && (
              <button
                onClick={onClose}
                className="flex items-center justify-center w-7 h-7 rounded-md text-slate-400 hover:text-slate-600 hover:bg-[#00216b]/[0.05] transition-colors"
              >
                <X size={15} />
              </button>
            )}
          </>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav
        className="flex-1 overflow-y-auto py-3 px-2"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(0,33,107,0.12) transparent",
        }}
      >
        {navGroups.map((group) => (
          <div key={group.label} className="mb-3">
            {/* Group label — collapsed: height spacer to preserve rhythm */}
            {collapsed ? (
              <div className="h-[22px]" />
            ) : (
              <div className="px-2.5 pb-1.5 text-[9px] font-semibold tracking-[0.12em] uppercase text-[#00216b]/35 select-none">
                {group.label}
              </div>
            )}

            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.to);
                const Icon = item.icon;

                if (collapsed) {
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        onClick={onClose}
                        title={item.label}
                        className={`flex items-center justify-center py-[7px] rounded-md transition-colors ${
                          active
                            ? "bg-[#00216b]/[0.1] text-[#00216b]"
                            : "text-slate-500 hover:bg-[#00216b]/[0.05] hover:text-slate-800"
                        }`}
                      >
                        <Icon size={15} className="shrink-0" />
                      </Link>
                    </li>
                  );
                }

                /* Expanded — signature: border-l-2 ledger-line active indicator */
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={onClose}
                      className={`flex items-center gap-2.5 rounded-md pl-2 pr-3 py-[7px] text-[13px] transition-colors border-l-2 ${
                        active
                          ? "border-[#00216b] bg-[#00216b]/[0.06] text-[#00216b] font-medium"
                          : "border-transparent text-slate-600 hover:bg-[#00216b]/[0.04] hover:text-slate-900"
                      }`}
                    >
                      <Icon size={14} className="shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* ── User footer ── */}
      <div className="border-t border-[#00216b]/[0.08] p-3 shrink-0">
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full bg-[#00216b] text-white text-[10px] font-semibold shrink-0 ring-2 ring-[#00216b]/[0.18]"
              title={user?.name ?? "Administrador"}
            >
              {initials}
            </div>
            <button
              onClick={() => logout()}
              className="flex items-center justify-center w-7 h-7 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Encerrar sessão"
            >
              <LogOut size={13} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 rounded-md px-2 py-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#00216b] text-white text-[10px] font-semibold shrink-0 ring-2 ring-[#00216b]/[0.18]">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="truncate text-[12px] font-medium text-gray-900">
                {user?.name ?? "Administrador"}
              </div>
              <div className="truncate text-[10px] text-slate-400">
                {user?.email ?? ""}
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="flex items-center justify-center w-6 h-6 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Encerrar sessão"
            >
              <LogOut size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const currentTitle = PAGE_TITLES[location.pathname] ?? "Wundu Admin";
  const { user } = useAuthStore();
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "A";

  return (
    <div className="flex h-screen bg-[#f8fafc] font-inter">
      {/* Mobile overlay */}
      <button
        type="button"
        aria-label="Fechar menu"
        tabIndex={sidebarOpen ? 0 : -1}
        className={`fixed inset-0 z-40 w-full bg-black/25 md:hidden transition-opacity duration-200 ${
          sidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar — desktop */}
      <aside
        className={`hidden md:flex shrink-0 flex-col transition-[width] duration-200 ${
          collapsed ? "w-[60px]" : "w-60"
        }`}
      >
        <SidebarContent
          onClose={() => {}}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
        />
      </aside>

      {/* Sidebar — mobile (always mounted to preserve scroll position) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 flex flex-col md:hidden shadow-xl transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-[#00216b]/[0.08] bg-white/90 backdrop-blur-sm px-4 shrink-0">
          <button
            className="md:hidden text-slate-500 hover:text-slate-700 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={18} />
          </button>

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-[13px] min-w-0">
            <span className="font-medium text-slate-400">Wundu</span>
            <span className="text-slate-300">/</span>
            <span className="font-medium text-slate-700 truncate">
              {currentTitle}
            </span>
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <button className="relative p-1.5 text-slate-500 hover:text-slate-700 hover:bg-[#00216b]/[0.04] rounded-md transition-colors">
              <Bell size={15} />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
            </button>
            <Link to="/dashboard/profile" className="ml-1">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#00216b] text-white text-[10px] font-semibold ring-2 ring-[#00216b]/[0.18] hover:ring-[#00216b]/[0.35] transition-all">
                {initials}
              </div>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
