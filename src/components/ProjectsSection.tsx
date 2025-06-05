
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FolderOpen, Plus, Calendar, Target, Lightbulb } from "lucide-react";
import { useProjects, Project } from "@/hooks/useProjects";

export const ProjectsSection = () => {
  const { projects, addProject, updateProject } = useProjects();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    status: 'idea' as Project['status'],
    category: '',
    deadline: '',
    notes: ''
  });

  const statusConfig = {
    idea: { label: 'Ideia', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Lightbulb },
    planning: { label: 'Planejamento', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Target },
    'in-progress': { label: 'Em Andamento', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: FolderOpen },
    completed: { label: 'Concluído', color: 'bg-green-100 text-green-700 border-green-200', icon: Target }
  };

  const handleAddProject = () => {
    if (!newProject.title || !newProject.description) return;
    
    addProject({
      title: newProject.title,
      description: newProject.description,
      status: newProject.status,
      category: newProject.category,
      deadline: newProject.deadline,
      notes: newProject.notes
    });

    setNewProject({ title: '', description: '', status: 'idea', category: '', deadline: '', notes: '' });
    setShowAddForm(false);
  };

  const updateProjectStatus = (id: string, status: Project['status']) => {
    updateProject(id, { status });
  };

  const groupedProjects = projects.reduce((acc, project) => {
    if (!acc[project.status]) {
      acc[project.status] = [];
    }
    acc[project.status].push(project);
    return acc;
  }, {} as Record<string, Project[]>);

  return (
    <div className="space-y-6">
      {/* Add Project Form */}
      <Card className="bg-white/70 backdrop-blur-sm border-purple-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-purple-700">Meus Projetos</CardTitle>
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Projeto
            </Button>
          </div>
        </CardHeader>
        
        {showAddForm && (
          <CardContent className="border-t border-purple-100 pt-4">
            <div className="space-y-4">
              <Input
                placeholder="Título do projeto"
                value={newProject.title}
                onChange={(e) => setNewProject({...newProject, title: e.target.value})}
              />
              <Textarea
                placeholder="Descrição do projeto"
                value={newProject.description}
                onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                rows={3}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select value={newProject.status} onValueChange={(value: Project['status']) => setNewProject({...newProject, status: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="idea">💡 Ideia</SelectItem>
                    <SelectItem value="planning">📋 Planejamento</SelectItem>
                    <SelectItem value="in-progress">🚧 Em Andamento</SelectItem>
                    <SelectItem value="completed">✅ Concluído</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Categoria"
                  value={newProject.category}
                  onChange={(e) => setNewProject({...newProject, category: e.target.value})}
                />
                <Input
                  type="date"
                  placeholder="Prazo (opcional)"
                  value={newProject.deadline}
                  onChange={(e) => setNewProject({...newProject, deadline: e.target.value})}
                />
              </div>
              <Textarea
                placeholder="Notas e observações"
                value={newProject.notes}
                onChange={(e) => setNewProject({...newProject, notes: e.target.value})}
                rows={2}
              />
              <div className="flex gap-2">
                <Button onClick={handleAddProject} className="bg-purple-600 hover:bg-purple-700">
                  Criar Projeto
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Projects by Status */}
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
                  <Card key={project.id} className="border hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className={config.color}>
                            {config.label}
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
                      
                      <Select value={project.status} onValueChange={(value: Project['status']) => updateProjectStatus(project.id, value)}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="idea">💡 Ideia</SelectItem>
                          <SelectItem value="planning">📋 Planejamento</SelectItem>
                          <SelectItem value="in-progress">🚧 Em Andamento</SelectItem>
                          <SelectItem value="completed">✅ Concluído</SelectItem>
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
