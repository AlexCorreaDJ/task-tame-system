
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, File, Image, FileText, Music, Video, X, Download, AlertCircle, CheckCircle } from "lucide-react";
import { ProjectFile } from "@/hooks/useProjects";
import { ALLOWED_FILE_TYPES, FILE_SIZE_LIMITS } from "@/utils/security";
import { toast } from "@/hooks/use-toast";

interface ProjectFileManagerProps {
  projectId: string;
  files: ProjectFile[];
  onAddFile: (projectId: string, file: File) => Promise<{ success: boolean; error?: string }>;
  onRemoveFile: (projectId: string, fileId: string) => boolean;
}

export const ProjectFileManager = ({ projectId, files, onAddFile, onRemoveFile }: ProjectFileManagerProps) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type.startsWith('video/')) return Video;
    if (type.startsWith('audio/')) return Music;
    if (type.includes('pdf') || type.includes('document') || type.includes('text')) return FileText;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFilesUpload = async (fileList: FileList) => {
    if (uploading) return;
    
    setUploading(true);
    const uploadPromises = Array.from(fileList).map(async (file) => {
      const result = await onAddFile(projectId, file);
      
      if (result.success) {
        toast({
          title: "Arquivo enviado",
          description: `${file.name} foi adicionado com sucesso`,
        });
      } else {
        toast({
          title: "Erro no upload",
          description: result.error || "Falha ao enviar arquivo",
          variant: "destructive"
        });
      }
      
      return result;
    });

    await Promise.all(uploadPromises);
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (e.dataTransfer.files.length > 0) {
      handleFilesUpload(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesUpload(e.target.files);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (fileId: string) => {
    const success = onRemoveFile(projectId, fileId);
    if (success) {
      toast({
        title: "Arquivo removido",
        description: "O arquivo foi removido do projeto",
      });
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível remover o arquivo",
        variant: "destructive"
      });
    }
  };

  const downloadFile = (file: ProjectFile) => {
    try {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      link.click();
    } catch (error) {
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar o arquivo",
        variant: "destructive"
      });
    }
  };

  const allowedTypesText = ALLOWED_FILE_TYPES.all.join(', ');
  const maxSizeText = `${FILE_SIZE_LIMITS.default / 1024 / 1024}MB`;

  return (
    <div className="space-y-4">
      {/* Security Info */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5" />
        <div className="text-sm text-blue-700">
          <p className="font-medium">Arquivos seguros</p>
          <p>Tamanho máximo: {maxSizeText} | Tipos permitidos: PDF, imagens, documentos</p>
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver ? 'border-purple-400 bg-purple-50' : 'border-gray-300 hover:border-purple-300'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
      >
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">
          {uploading ? 'Enviando arquivos...' : 'Arraste arquivos aqui ou clique para selecionar'}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept={ALLOWED_FILE_TYPES.all.join(',')}
          disabled={uploading}
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          className="border-purple-300 text-purple-700 hover:bg-purple-50"
          disabled={uploading}
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? 'Enviando...' : 'Selecionar Arquivos'}
        </Button>
      </div>

      {/* Files Grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file) => {
            const FileIcon = getFileIcon(file.type);
            return (
              <Card key={file.id} className="relative group hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <FileIcon className="h-8 w-8 text-purple-600" />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                      onClick={() => handleRemoveFile(file.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="font-medium text-sm truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                    </Badge>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    {file.type.startsWith('image/') && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="text-xs">
                            Visualizar
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>{file.name}</DialogTitle>
                          </DialogHeader>
                          <div className="flex justify-center">
                            <img
                              src={file.url}
                              alt={file.name}
                              className="max-w-full max-h-96 object-contain"
                              onError={(e) => {
                                console.warn('Erro ao carregar imagem:', file.name);
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => downloadFile(file)}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  </div>
                  
                  <p className="text-xs text-gray-400">
                    {new Date(file.uploadedAt).toLocaleDateString('pt-BR')}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
