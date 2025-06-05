
import { useLocalStorage } from './useLocalStorage';

export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'idea' | 'planning' | 'in-progress' | 'completed';
  category: string;
  deadline?: string;
  notes: string;
  createdAt: string;
}

export const useProjects = () => {
  const [projects, setProjects] = useLocalStorage<Project[]>('focusflow-projects', [
    {
      id: '1',
      title: 'App de Produtividade para TDAH',
      description: 'Desenvolver um aplicativo focado em ajudar pessoas com TDAH a se organizarem melhor',
      status: 'in-progress',
      category: 'Desenvolvimento',
      deadline: '2024-02-15',
      notes: 'Foco em interface simples e clara. Usar cores para diferenciação de prioridades.',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Curso de React Avançado',
      description: 'Estudar hooks avançados, context API e performance optimization',
      status: 'planning',
      category: 'Estudos',
      notes: 'Começar com useReducer e useContext',
      createdAt: new Date().toISOString()
    }
  ]);

  const addProject = (projectData: Omit<Project, 'id' | 'createdAt'>) => {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setProjects(prev => [...prev, newProject]);
    return newProject;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(project => 
      project.id === id ? { ...project, ...updates } : project
    ));
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(project => project.id !== id));
  };

  return {
    projects,
    addProject,
    updateProject,
    deleteProject
  };
};
