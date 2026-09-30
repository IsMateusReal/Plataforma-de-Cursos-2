import { BookOpen, UserRound, LogOut, LayoutDashboard, Settings } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
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
}: NavbarProps) => {
  const isAdminView = currentView.startsWith('admin');

  return (
    <nav className="site-nav">
      <div className="nav-inner">
        <button type="button" onClick={() => setCurrentView('catalog')} className="brand-mark" aria-label="Matt's School, ir para o catálogo">
          <span className="brand-icon"><BookOpen size={20} /></span>
          <span>Matt's School<span className="brand-period">.</span></span>
        </button>

        <div className="nav-links" aria-label="Navegação principal">
          <button type="button" onClick={() => setCurrentView('catalog')} className={`nav-link ${currentView === 'catalog' ? 'active' : ''}`} aria-current={currentView === 'catalog' ? 'page' : undefined}>
            Catálogo
          </button>
          {token && (
            <>
              <button type="button" onClick={() => setCurrentView('dashboard')} className={`nav-link ${currentView === 'dashboard' || currentView === 'player' ? 'active' : ''}`} aria-current={currentView === 'dashboard' ? 'page' : undefined}>
                <LayoutDashboard size={17} /><span>Meus cursos</span>
              </button>
              <button type="button" onClick={() => setCurrentView('admin')} className={`nav-link ${isAdminView ? 'active' : ''}`} aria-current={isAdminView ? 'page' : undefined}>
                <Settings size={17} /><span>Gestão</span>
              </button>
            </>
          )}
        </div>

        <div className="nav-actions">
          {token ? (
            <button type="button" onClick={onLogout} className="nav-account">
              <LogOut size={17} /><span>Sair</span>
            </button>
          ) : (
            <button type="button" onClick={onOpenAuth} className="nav-account login-action">
              <UserRound size={17} /><span>Entrar</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};