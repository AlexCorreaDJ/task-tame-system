
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, FileText, Upload } from "lucide-react";
import { Project, ProjectFile } from "@/hooks/useProjects";
import { ProjectFileManager } from "@/components/ProjectFileManager";

interface ProjectCardProps {
  project: Project;
  statusConfig: {
    label: string;
    color: string;
  };
  onUpdateStatus: (id: string, status: Project['status']) => void;
  onAddFile: (projectId: string, file: File) => void;
  onRemoveFile: (projectId: string, fileId: string) => void;
}

export const ProjectCard = ({ 
  project, 
  statusConfig, 
  onUpdateStatus, 
  onAddFile, 
  onRemoveFile 
}: ProjectCardProps) => {
  return (
    <Card className="border hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className={statusConfig.color}>
              {statusConfig.label}
            </Badge>
            {project.category && (
              <Badge variant="outline" className="bg-gray-100 text-gray-700">
                {project.category}
              </Badge>
            )}
          </div>
          <h3 className="font-semibold text-gray-800">{project.title}</h3>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-600">{project.description}</p>
        
        {project.deadline && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Prazo: {new Date(project.deadline).toLocaleDateString('pt-BR')}</span>
          </div>
        )}
        
        {project.notes && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-700">{project.notes}</p>
          </div>
        )}

        {project.files && project.files.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FileText className="h-4 w-4" />
            <span>{project.files.length} arquivo(s)</span>
          </div>
        )}
        
        <div className="flex gap-2">
          <Select value={project.status} onValueChange={(value: Project['status']) => onUpdateStatus(project.id, value)}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="idea">💡 Ideia</SelectItem>
              <SelectItem value="planning">📋 Planejamento</SelectItem>
              <SelectItem value="in-progress">🚧 Em Andamento</SelectItem>
              <SelectItem value="completed">✅ Concluído</SelectItem>
            </SelectContent>
          </Select>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Arquivos do Projeto: {project.title}
                </DialogTitle>
              </DialogHeader>
              <ProjectFileManager
                projectId={project.id}
                files={project.files || []}
                onAddFile={onAddFile}
                onRemoveFile={onRemoveFile}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};
