import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Brain, BarChart3, GraduationCap, ArrowRight } from 'lucide-react';

const HomePage = () => {
  const features = [
    {
      icon: Upload,
      title: 'Upload de CSV',
      description: 'Importe grades curriculares e históricos escolares de forma rápida e segura através de arquivos CSV.',
    },
    {
      icon: Brain,
      title: 'Recomendações com IA',
      description: 'Sistema inteligente que analisa seu histórico e recomenda as melhores disciplinas para cursar.',
    },
    {
      icon: BarChart3,
      title: 'Análise de Desempenho',
      description: 'Acompanhe o desempenho acadêmico com gráficos e estatísticas detalhadas.',
    },
  ];

  return (
    <>
      <Helmet>
        <title>ProjetoDisciplina - Sistema de Gerenciamento Acadêmico</title>
        <meta name="description" content="Sistema inteligente de gerenciamento acadêmico com recomendações de disciplinas baseadas em IA" />
      </Helmet>

      <div className="min-h-screen">
        <section className="relative min-h-[90vh] flex items-center">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1590579491624-f98f36d4c763"
              alt="Estudantes em ambiente acadêmico"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-6">
                <GraduationCap className="w-10 h-10 text-primary" />
                <span className="text-sm font-semibold text-primary tracking-wide uppercase">
                  Engenharia de Software
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6" style={{ letterSpacing: '-0.02em' }}>
                Gerencie seu percurso acadêmico com inteligência
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed mb-8 max-w-prose">
                Sistema completo para gestão de disciplinas, análise de desempenho e recomendações personalizadas baseadas em inteligência artificial.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/signup">
                  <Button size="lg" className="gap-2">
                    Começar agora
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline">
                    Fazer login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Recursos principais
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Ferramentas poderosas para otimizar sua jornada acadêmica
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="border-2 hover:shadow-lg transition-all duration-200">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-primary rounded-2xl p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Pronto para começar?
              </h2>
              <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
                Crie sua conta gratuitamente e comece a gerenciar suas disciplinas de forma inteligente
              </p>
              <Link to="/signup">
                <Button size="lg" variant="secondary" className="gap-2">
                  Criar conta gratuita
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default HomePage;