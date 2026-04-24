import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, BookOpen, School, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ users: 0, disciplines: 0, classes: 0 });
  const [loading, setLoading] = useState(true);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({ nome: '', email: '', password: '', perfil: '', turma: '' });
  const [turmas, setTurmas] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersData, disciplinasData, turmasData] = await Promise.all([
        pb.collection('usuarios').getFullList({ $autoCancel: false }),
        pb.collection('disciplinas').getFullList({ $autoCancel: false }),
        pb.collection('turmas').getFullList({ $autoCancel: false }),
      ]);

      setUsers(usersData);
      setTurmas(turmasData);
      setStats({
        users: usersData.length,
        disciplines: disciplinasData.length,
        classes: turmasData.length,
      });
    } catch (error) {
      toast.error('Erro ao carregar dados: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await pb.collection('usuarios').create({
        ...newUser,
        passwordConfirm: newUser.password,
      }, { $autoCancel: false });
      
      toast.success('Usuário adicionado com sucesso');
      setIsAddUserOpen(false);
      setNewUser({ nome: '', email: '', password: '', perfil: '', turma: '' });
      fetchData();
    } catch (error) {
      toast.error('Erro ao adicionar usuário: ' + error.message);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return;
    
    try {
      await pb.collection('usuarios').delete(id, { $autoCancel: false });
      toast.success('Usuário excluído com sucesso');
      fetchData();
    } catch (error) {
      toast.error('Erro ao excluir usuário: ' + error.message);
    }
  };

  return (
    <>
      <Helmet>
        <title>Painel Administrativo - ProjetoDisciplina</title>
        <meta name="description" content="Gerencie usuários, disciplinas e dados do sistema" />
      </Helmet>

      <div className="min-h-screen bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Painel Administrativo</h1>
            <p className="text-muted-foreground">Gerencie usuários e acompanhe as métricas do sistema</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                <Users className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold">{stats.users}</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Disciplinas</CardTitle>
                <BookOpen className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold">{stats.disciplines}</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Turmas</CardTitle>
                <School className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold">{stats.classes}</div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Gerenciamento de Usuários</CardTitle>
                  <CardDescription>Visualize e gerencie todos os usuários do sistema</CardDescription>
                </div>
                <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                  <DialogTrigger asChild>
                    <Button>Adicionar Usuário</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Novo Usuário</DialogTitle>
                      <DialogDescription>Preencha os dados do novo usuário</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddUser} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-nome">Nome</Label>
                        <Input
                          id="new-nome"
                          value={newUser.nome}
                          onChange={(e) => setNewUser({ ...newUser, nome: e.target.value })}
                          required
                          className="text-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-email">Email</Label>
                        <Input
                          id="new-email"
                          type="email"
                          value={newUser.email}
                          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                          required
                          className="text-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">Senha</Label>
                        <Input
                          id="new-password"
                          type="password"
                          value={newUser.password}
                          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                          required
                          minLength={8}
                          className="text-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-perfil">Perfil</Label>
                        <Select value={newUser.perfil} onValueChange={(value) => setNewUser({ ...newUser, perfil: value })} required>
                          <SelectTrigger id="new-perfil">
                            <SelectValue placeholder="Selecione o perfil" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="aluno">Aluno</SelectItem>
                            <SelectItem value="coordenador">Coordenador</SelectItem>
                            <SelectItem value="administrador">Administrador</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {newUser.perfil === 'aluno' && (
                        <div className="space-y-2">
                          <Label htmlFor="new-turma">Turma</Label>
                          <Select value={newUser.turma} onValueChange={(value) => setNewUser({ ...newUser, turma: value })}>
                            <SelectTrigger id="new-turma">
                              <SelectValue placeholder="Selecione a turma" />
                            </SelectTrigger>
                            <SelectContent>
                              {turmas.map((t) => (
                                <SelectItem key={t.id} value={t.nome}>
                                  {t.nome} - {t.periodo}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      <Button type="submit" className="w-full">Adicionar</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Perfil</TableHead>
                      <TableHead>Turma</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.nome}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell className="capitalize">{user.perfil}</TableCell>
                        <TableCell>{user.turma || '-'}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;