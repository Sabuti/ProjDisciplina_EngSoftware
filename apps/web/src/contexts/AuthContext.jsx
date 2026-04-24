import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (pb.authStore.isValid && pb.authStore.model) {
      setCurrentUser(pb.authStore.model);
    }
    setInitialLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const authData = await pb.collection('usuarios').authWithPassword(email, password, { $autoCancel: false });
      setCurrentUser(authData.record);
      toast.success('Login realizado com sucesso');
      
      if (authData.record.perfil === 'administrador') {
        navigate('/admin');
      } else if (authData.record.perfil === 'coordenador') {
        navigate('/coordenador');
      } else {
        navigate('/aluno');
      }
      
      return authData.record;
    } catch (error) {
      toast.error('Erro ao fazer login: ' + error.message);
      throw error;
    }
  };

  const signup = async (nome, email, password, perfil, turma) => {
    try {
      const data = {
        nome,
        email,
        password,
        passwordConfirm: password,
        perfil,
      };
      
      if (turma) {
        data.turma = turma;
      }
      
      await pb.collection('usuarios').create(data, { $autoCancel: false });
      toast.success('Cadastro realizado com sucesso. Faça login para continuar.');
      navigate('/login');
    } catch (error) {
      toast.error('Erro ao cadastrar: ' + error.message);
      throw error;
    }
  };

  const logout = () => {
    pb.authStore.clear();
    setCurrentUser(null);
    toast.success('Logout realizado com sucesso');
    navigate('/');
  };

  const userRole = currentUser?.perfil || null;

  const value = {
    currentUser,
    userRole,
    login,
    signup,
    logout,
    isAuthenticated: pb.authStore.isValid,
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};