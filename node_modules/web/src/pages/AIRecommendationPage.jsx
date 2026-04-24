import React from 'react';
import { Helmet } from 'react-helmet';
import IntegratedAiChat from '@/components/integrated-ai-chat';
import { Brain, Sparkles } from 'lucide-react';

const AIRecommendationPage = () => {
  return (
    <>
      <Helmet>
        <title>Recomendações IA - ProjetoDisciplina</title>
        <meta name="description" content="Receba recomendações personalizadas de disciplinas baseadas em IA" />
      </Helmet>

      <div className="min-h-screen bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Brain className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold">Recomendações Inteligentes</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Nossa IA analisa seu histórico acadêmico, disciplinas já cursadas, pré-requisitos atendidos e horários disponíveis para recomendar as melhores disciplinas para você cursar no próximo período.
            </p>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-primary mb-2">Como funciona</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Analisa disciplinas que você ainda não cursou</li>
                  <li>• Verifica pré-requisitos já atendidos</li>
                  <li>• Considera horários que não conflitem</li>
                  <li>• Recomenda carga horária adequada por período</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-background rounded-xl shadow-lg border h-[600px]">
            <IntegratedAiChat />
          </div>
        </div>
      </div>
    </>
  );
};

export default AIRecommendationPage;