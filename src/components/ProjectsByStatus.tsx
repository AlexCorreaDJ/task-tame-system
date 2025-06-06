
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Target, FolderOpen } from "lucide-react";
import { Project, ProjectFile } from "@/hooks/useProjects";
import { ProjectCard } from "@/components/ProjectCard";

interface ProjectsByStatusProps {
  projects: Project[];
  onUpdateStatus: (id: string, status: Project['status']) => void;
  onAddFile: (projectId: string, file: File) => void;
  onRemoveFile: (projectId: string, fileId: string) => void;
}

export const ProjectsByStatus = ({ 
  projects, 
  onUpdateStatus, 
  onAddFile, 
  onRemoveFile 
}: ProjectsByStatusProps) => {
  const statusConfig = {
    idea: { label: 'Ideia', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Lightbulb },
    planning: { label: 'Planejamento', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Target },
    'in-progress': { label: 'Em Andamento', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: FolderOpen },
    completed: { label: 'Concluído', color: 'bg-green-100 text-green-700 border-green-200', icon: Target }
  };

  const groupedProjects = projects.reduce((acc, project) => {
    if (!acc[project.status]) {
      acc[project.status] = [];
    }
    acc[project.status].push(project);
    return acc;
  }, {} as Record<string, Project[]>);

  return (
    <>
      {Object.entries(statusConfig).map(([status, config]) => {
        const projectsInStatus = groupedProjects[status] || [];
        
        if (projectsInStatus.length === 0) return null;

        return (
          <Card key={status} className="bg-white/70 backdrop-blur-sm border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <config.icon className="h-5 w-5" />
                {config.label} ({projectsInStatus.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projectsInStatus.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    statusConfig={config}
                    onUpdateStatus={onUpdateStatus}
                    onAddFile={onAddFile}
                    onRemoveFile={onRemoveFile}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </>
  );
};
