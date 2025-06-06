
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { Project } from "@/hooks/useProjects";

interface ProjectFormProps {
  onAddProject: (projectData: Omit<Project, 'id' | 'createdAt' | 'files'>) => void;
}

export const ProjectForm = ({ onAddProject }: ProjectFormProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    status: 'idea' as Project['status'],
    category: '',
    deadline: '',
    notes: ''
  });

  const handleAddProject = () => {
    if (!newProject.title || !newProject.description) return;
    
    onAddProject({
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

  return (
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
  );
};
