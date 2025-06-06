
import { useProjects } from "@/hooks/useProjects";
import { ProjectNotesBlock } from "@/components/ProjectNotesBlock";
import { ProjectForm } from "@/components/ProjectForm";
import { ProjectsByStatus } from "@/components/ProjectsByStatus";

export const ProjectsSection = () => {
  const { projects, addProject, updateProject, addFileToProject, removeFileFromProject } = useProjects();

  const updateProjectStatus = (id: string, status: any) => {
    updateProject(id, { status });
  };

  return (
    <div className="space-y-6">
      <ProjectNotesBlock />
      <ProjectForm onAddProject={addProject} />
      <ProjectsByStatus 
        projects={projects}
        onUpdateStatus={updateProjectStatus}
        onAddFile={addFileToProject}
        onRemoveFile={removeFileFromProject}
      />
    </div>
  );
};
