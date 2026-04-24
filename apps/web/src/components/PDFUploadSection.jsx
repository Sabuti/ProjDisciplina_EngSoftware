import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';
import { cn } from '@/lib/utils';

const PDFUploadSection = ({ title, description, onUploadSuccess, userId, defaultDisciplinaId }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };

  const handleFileInput = async (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processFile = async (file) => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Formato inválido. Por favor, envie um arquivo PDF.');
      return;
    }

    if (!defaultDisciplinaId) {
      toast.error('Erro: Nenhuma disciplina cadastrada no sistema para vincular o documento.');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('pdf_file', file);
      formData.append('aluno_id', userId);
      // Os campos abaixo são obrigatórios na coleção historico_escolar
      formData.append('situacao', 'em andamento'); 
      formData.append('disciplina_id', defaultDisciplinaId); 

      await pb.collection('historico_escolar').create(formData, { $autoCancel: false });
      
      toast.success('Documento PDF enviado com sucesso!');
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      toast.error('Erro ao enviar arquivo: ' + error.message);
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ease-in-out cursor-pointer relative",
            isDragging ? "border-primary bg-primary/5 scale-[0.99]" : "border-border hover:border-primary/50 hover:bg-muted/50",
            isUploading && "opacity-50 pointer-events-none"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          <input
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileInput}
            disabled={isUploading}
          />
          
          {isUploading ? (
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
              <p className="text-sm font-medium text-foreground">Enviando documento...</p>
              <p className="text-xs text-muted-foreground mt-1">Isso pode levar alguns instantes</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                <Upload className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                Clique para selecionar ou arraste o arquivo PDF
              </p>
              <p className="text-xs text-muted-foreground">
                Tamanho máximo suportado: 20MB
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PDFUploadSection;