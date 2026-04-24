import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import CSVUploadSection from '@/components/CSVUploadSection.jsx';
import PDFUploadSection from '@/components/PDFUploadSection.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Award, TrendingUp, CheckCircle2, FileText, Download, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const AlunoDashboard = () => {
  const { currentUser } = useAuth();
  const [historico, setHistorico] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [availableDisciplinas, setAvailableDisciplinas] = useState([]);
  const [uploadedPDFs, setUploadedPDFs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ gpa: 0, completedCredits: 0, totalCredits: 0 });

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  const fetchData = async () => {
    try {
      const [historicoData, disciplinasData] = await Promise.all([
        pb.collection('historico_escolar').getFullList({
          filter: `aluno_id = "${currentUser.id}"`,
          expand: 'disciplina_id',
          $autoCancel: false,
        }),
        pb.collection('disciplinas').getFullList({ $autoCancel: false }),
      ]);

      setHistorico(historicoData);
      setDisciplinas(disciplinasData);
      
      // Filtrar registros que possuem PDF anexado
      setUploadedPDFs(historicoData.filter(h => h.pdf_file && h.pdf_file !== ''));

      const completedDisciplinaIds = historicoData
        .filter(h => h.situacao === 'aprovado' && h.disciplina_id)
        .map(h => h.disciplina_id);

      const available = disciplinasData.filter(d => {
        if (completedDisciplinaIds.includes(d.id)) return false;
        
        if (d.pre_requisitos && Array.isArray(d.pre_requisitos) && d.pre_requisitos.length > 0) {
          return d.pre_requisitos.every(preReq => completedDisciplinaIds.includes(preReq));
        }
        
        return true;
      });

      setAvailableDisciplinas(available);

      const grades = historicoData.filter(h => h.nota !== null && h.nota !== undefined).map(h => h.nota);
      const gpa = grades.length > 0 ? grades.reduce((a, b) => a + b, 0) / grades.length : 0;

      const completedCredits = historicoData
        .filter(h => h.situacao === 'aprovado')
        .reduce((sum, h) => {
          const disc = disciplinasData.find(d => d.id === h.disciplina_id);
          return sum + (disc?.creditos || 0);
        }, 0);

      const totalCredits = disciplinasData.reduce((sum, d) => sum + (d.creditos || 0), 0);

      setStats({ gpa: gpa.toFixed(1), completedCredits, totalCredits });
    } catch (error) {
      toast.error('Erro ao carregar dados: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getSituacaoBadge = (situacao) => {
    const variants = {
      'aprovado': 'default',
      'reprovado': 'destructive',
      'em andamento': 'secondary',
    };
    return <Badge variant={variants[situacao] || 'outline'}>{situacao}</Badge>;
  };

  const defaultDisciplinaId = disciplinas.length > 0 ? disciplinas[0].id : null;

  return (
    <>
      <Helmet>
        <title>Meu Painel - ProjetoDisciplina</title>
        <meta name="description" content="Acompanhe seu histórico acadêmico e disciplinas disponíveis" />
      </Helmet>

      <div className="min-h-screen bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Meu Painel Acadêmico</h1>
            <p className="text-muted-foreground">Importe seus dados e acompanhe seu progresso atual</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <CSVUploadSection
              title="Upload Grade Curricular (CSV)"
              description="Importe as disciplinas e pré-requisitos em lote"
              uploadType="grade_curricular"
              columnsInfo="codigo, nome, creditos, periodo"
              onUploadSuccess={fetchData}
            />
            <PDFUploadSection
              title="Upload Histórico Escolar (PDF)"
              description="Envie o documento oficial do seu histórico"
              userId={currentUser?.id}
              defaultDisciplinaId={defaultDisciplinaId}
              onUploadSuccess={fetchData}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Média Geral (CRA)</CardTitle>
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold">{stats.gpa}</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Créditos Concluídos</CardTitle>
                <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold">{stats.completedCredits}</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Progresso do Curso</CardTitle>
                <Award className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold">
                    {stats.totalCredits > 0 ? Math.round((stats.completedCredits / stats.totalCredits) * 100) : 0}%
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Documentos Enviados
              </CardTitle>
              <CardDescription>Históricos e comprovantes enviados em PDF</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : uploadedPDFs.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <p>Nenhum documento PDF enviado ainda.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {uploadedPDFs.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-xl bg-card">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2 bg-primary/10 text-primary rounded-lg">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-medium truncate">{doc.pdf_file}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(doc.created).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <a href={pb.files.getUrl(doc, doc.pdf_file)} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="icon" title="Visualizar documento">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Desempenho Acadêmico
                </CardTitle>
                <CardDescription>Disciplinas cursadas e em andamento</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : historico.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhuma disciplina cursada ainda</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Disciplina</TableHead>
                        <TableHead>Nota</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historico.map((h) => (
                        <TableRow key={h.id}>
                          <TableCell className="font-medium">
                            {h.expand?.disciplina_id?.nome || 'Histórico Geral'}
                          </TableCell>
                          <TableCell>{h.nota !== null && h.nota !== undefined ? h.nota.toFixed(1) : '-'}</TableCell>
                          <TableCell>{getSituacaoBadge(h.situacao)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Disciplinas Disponíveis
                </CardTitle>
                <CardDescription>Disciplinas que você pode cursar</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : availableDisciplinas.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhuma disciplina disponível no momento</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Créditos</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {availableDisciplinas.map((d) => (
                        <TableRow key={d.id}>
                          <TableCell className="font-mono text-sm text-muted-foreground">{d.codigo}</TableCell>
                          <TableCell className="font-medium">{d.nome}</TableCell>
                          <TableCell>{d.creditos}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default AlunoDashboard;