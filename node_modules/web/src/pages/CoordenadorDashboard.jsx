import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Award } from 'lucide-react';
import { toast } from 'sonner';

const CoordenadorDashboard = () => {
  const [students, setStudents] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [selectedTurma, setSelectedTurma] = useState('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ avgGrade: 0, totalStudents: 0, approvalRate: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [students, historico, selectedTurma]);

  const fetchData = async () => {
    try {
      const [studentsData, historicoData, turmasData] = await Promise.all([
        pb.collection('usuarios').getFullList({ filter: 'perfil = "aluno"', $autoCancel: false }),
        pb.collection('historico_escolar').getFullList({ expand: 'aluno_id,disciplina_id', $autoCancel: false }),
        pb.collection('turmas').getFullList({ $autoCancel: false }),
      ]);

      setStudents(studentsData);
      setHistorico(historicoData);
      setTurmas(turmasData);
    } catch (error) {
      toast.error('Erro ao carregar dados: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    let filteredStudents = students;
    let filteredHistorico = historico;

    if (selectedTurma !== 'all') {
      filteredStudents = students.filter(s => s.turma === selectedTurma);
      const studentIds = filteredStudents.map(s => s.id);
      filteredHistorico = historico.filter(h => studentIds.includes(h.aluno_id));
    }

    const grades = filteredHistorico.filter(h => h.nota !== null).map(h => h.nota);
    const avgGrade = grades.length > 0 ? grades.reduce((a, b) => a + b, 0) / grades.length : 0;

    const approved = filteredHistorico.filter(h => h.situacao === 'aprovado').length;
    const total = filteredHistorico.length;
    const approvalRate = total > 0 ? (approved / total) * 100 : 0;

    setStats({
      avgGrade: avgGrade.toFixed(1),
      totalStudents: filteredStudents.length,
      approvalRate: approvalRate.toFixed(1),
    });
  };

  const getPerformanceDistribution = () => {
    const distribution = { 'Excelente (9-10)': 0, 'Bom (7-8.9)': 0, 'Regular (5-6.9)': 0, 'Insuficiente (0-4.9)': 0 };
    
    historico.forEach(h => {
      if (h.nota !== null) {
        if (h.nota >= 9) distribution['Excelente (9-10)']++;
        else if (h.nota >= 7) distribution['Bom (7-8.9)']++;
        else if (h.nota >= 5) distribution['Regular (5-6.9)']++;
        else distribution['Insuficiente (0-4.9)']++;
      }
    });

    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  };

  const getSituacaoDistribution = () => {
    const distribution = { 'Aprovado': 0, 'Reprovado': 0, 'Em Andamento': 0 };
    
    historico.forEach(h => {
      if (h.situacao === 'aprovado') distribution['Aprovado']++;
      else if (h.situacao === 'reprovado') distribution['Reprovado']++;
      else distribution['Em Andamento']++;
    });

    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  };

  const COLORS = ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd'];

  return (
    <>
      <Helmet>
        <title>Painel do Coordenador - ProjetoDisciplina</title>
        <meta name="description" content="Acompanhe o desempenho da turma e gerencie alunos" />
      </Helmet>

      <div className="min-h-screen bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Painel do Coordenador</h1>
            <p className="text-muted-foreground">Acompanhe o desempenho acadêmico dos alunos</p>
          </div>

          <div className="mb-6">
            <Select value={selectedTurma} onValueChange={setSelectedTurma}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Filtrar por turma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as turmas</SelectItem>
                {turmas.map((t) => (
                  <SelectItem key={t.id} value={t.nome}>
                    {t.nome} - {t.periodo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Média Geral</CardTitle>
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold">{stats.avgGrade}</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
                <Users className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold">{stats.totalStudents}</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Aprovação</CardTitle>
                <Award className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold">{stats.approvalRate}%</div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Desempenho</CardTitle>
                <CardDescription>Notas dos alunos por faixa</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getPerformanceDistribution()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-15} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#1e40af" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status das Disciplinas</CardTitle>
                <CardDescription>Situação atual dos alunos</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={getSituacaoDistribution()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getSituacaoDistribution().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lista de Alunos</CardTitle>
              <CardDescription>Visualize todos os alunos e seus status</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Turma</TableHead>
                      <TableHead>Disciplinas Cursadas</TableHead>
                      <TableHead>Média</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students
                      .filter(s => selectedTurma === 'all' || s.turma === selectedTurma)
                      .map((student) => {
                        const studentHistorico = historico.filter(h => h.aluno_id === student.id);
                        const grades = studentHistorico.filter(h => h.nota !== null).map(h => h.nota);
                        const avg = grades.length > 0 ? (grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(1) : '-';
                        
                        return (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">{student.nome}</TableCell>
                            <TableCell>{student.email}</TableCell>
                            <TableCell>{student.turma || '-'}</TableCell>
                            <TableCell>{studentHistorico.length}</TableCell>
                            <TableCell>{avg}</TableCell>
                          </TableRow>
                        );
                      })}
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

export default CoordenadorDashboard;