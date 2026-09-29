import React from 'react';
import {
  BookOpen,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';

interface NavbarProps {
  currentView: 'catalog' | 'dashboard' | 'player';
  setCurrentView: (
    view: 'catalog' | 'dashboard' | 'player'
  ) => void;
  token: string | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  token,
  onOpenAuth,
  onLogout,
}) => {
  return (
    <nav className="w-full border-b border-slate-800 bg-slate-950">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

        {/* Logo */}
        <button
          type="button"
          onClick={() => setCurrentView('catalog')}
          className="flex cursor-pointer items-center gap-2 text-lg font-bold text-indigo-400 transition hover:text-indigo-300"
        >
          <BookOpen size={24} />

          <span>Plataforma de Cursos</span>
        </button>

        {/* Navegação */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentView('catalog')}
            className={`cursor-pointer rounded-xl px-3 py-1.5 text-sm font-medium transition ${
              currentView === 'catalog'
                ? 'border border-slate-700 bg-slate-800 text-indigo-400'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            Catálogo
          </button>

          {token && (
            <button
              type="button"
              onClick={() => setCurrentView('dashboard')}
              className={`flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium transition ${
                currentView === 'dashboard'
                  ? 'border border-slate-700 bg-slate-800 text-indigo-400'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <LayoutDashboard size={17} />

              <span>Dashboard</span>
            </button>
          )}
        </div>

        {/* Usuário */}
        <div className="flex items-center">
          {token ? (
            <button
              type="button"
              onClick={onLogout}
              className="flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium text-slate-400 transition hover:bg-slate-800/50 hover:text-red-400"
            >
              <LogOut size={17} />

              <span>Sair</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium text-slate-400 transition hover:bg-slate-800/50 hover:text-white"
            >
              <UserIcon size={17} />

              <span>Entrar</span>
            </button>
          )}
        </div>

      </div>
    </nav>
  );
};
