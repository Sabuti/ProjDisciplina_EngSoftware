import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { GraduationCap, LogOut, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const { isAuthenticated, currentUser, userRole, logout } = useAuth();
  const location = useLocation();

  const getDashboardLink = () => {
    if (userRole === 'administrador') return '/admin';
    if (userRole === 'coordenador') return '/coordenador';
    return '/aluno';
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <GraduationCap className="w-6 h-6" />
            <span>ProjetoDisciplina</span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/') ? 'text-primary' : 'text-foreground'
              }`}
            >
              Início
            </Link>

            {isAuthenticated && (
              <Link
                to={getDashboardLink()}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(getDashboardLink()) ? 'text-primary' : 'text-foreground'
                }`}
              >
                Dashboard
              </Link>
            )}

            {isAuthenticated && userRole === 'aluno' && (
              <Link
                to="/ai-recommendations"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/ai-recommendations') ? 'text-primary' : 'text-foreground'
                }`}
              >
                Recomendações IA
              </Link>
            )}

            {!isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">
                    Cadastrar
                  </Button>
                </Link>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="w-4 h-4" />
                    {currentUser?.nome}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={logout} className="gap-2 cursor-pointer">
                    <LogOut className="w-4 h-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;