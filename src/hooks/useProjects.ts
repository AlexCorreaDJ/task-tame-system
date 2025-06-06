
import { validateInput, sanitizeText, sanitizeHTML, validateFile, VALIDATION_PATTERNS, ALLOWED_FILE_TYPES, FILE_SIZE_LIMITS, checkRateLimit } from '@/utils/security';
import { useSecureLocalStorage } from './useSecureLocalStorage';

export interface ProjectFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'idea' | 'planning' | 'in-progress' | 'completed';
  category: string;
  deadline?: string;
  notes: string;
  files: ProjectFile[];
  createdAt: string;
}

export const useProjects = () => {
  const [projects, setProjects] = useSecureLocalStorage<Project[]>('focusflow-projects', [
    {
      id: '1',
      title: 'App de Produtividade para TDAH',
      description: 'Desenvolver um aplicativo focado em ajudar pessoas com TDAH a se organizarem melhor',
      status: 'in-progress',
      category: 'Desenvolvimento',
      deadline: '2024-02-15',
      notes: 'Foco em interface simples e clara. Usar cores para diferenciação de prioridades.',
      files: [],
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Curso de React Avançado',
      description: 'Estudar hooks avançados, context API e performance optimization',
      status: 'planning',
      category: 'Estudos',
      notes: 'Começar com useReducer e useContext',
      files: [],
      createdAt: new Date().toISOString()
    }
  ], 30 * 24 * 60 * 60 * 1000); // 30 days TTL

  const validateProjectData = (projectData: Omit<Project, 'id' | 'createdAt' | 'files'>): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!validateInput(projectData.title, VALIDATION_PATTERNS.title)) {
      errors.push('Título deve ter entre 1 e 100 caracteres');
    }

    if (!validateInput(projectData.description, VALIDATION_PATTERNS.description)) {
      errors.push('Descrição deve ter no máximo 500 caracteres');
    }

    if (!validateInput(projectData.category, VALIDATION_PATTERNS.category)) {
      errors.push('Categoria deve ter entre 1 e 50 caracteres');
    }

    if (!['idea', 'planning', 'in-progress', 'completed'].includes(projectData.status)) {
      errors.push('Status do projeto inválido');
    }

    return { isValid: errors.length === 0, errors };
  };

  const addProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'files'>): Project | null => {
    if (!checkRateLimit('addProject', 10, 60000)) {
      console.warn('Muitos projetos sendo criados. Tente novamente em alguns segundos.');
      return null;
    }

    const validation = validateProjectData(projectData);
    if (!validation.isValid) {
      console.warn('Dados do projeto inválidos:', validation.errors);
      return null;
    }

    const newProject: Project = {
      ...projectData,
      title: sanitizeText(projectData.title),
      description: sanitizeHTML(projectData.description),
      category: sanitizeText(projectData.category),
      notes: sanitizeHTML(projectData.notes),
      id: Date.now().toString(),
      files: [],
      createdAt: new Date().toISOString()
    };

    setProjects(prev => [...prev, newProject]);
    return newProject;
  };

  const updateProject = (id: string, updates: Partial<Project>): boolean => {
    if (!checkRateLimit('updateProject', 30, 60000)) {
      console.warn('Muitas atualizações sendo feitas. Tente novamente em alguns segundos.');
      return false;
    }

    const sanitizedUpdates = { ...updates };
    if (sanitizedUpdates.title) {
      sanitizedUpdates.title = sanitizeText(sanitizedUpdates.title);
    }
    if (sanitizedUpdates.description) {
      sanitizedUpdates.description = sanitizeHTML(sanitizedUpdates.description);
    }
    if (sanitizedUpdates.notes) {
      sanitizedUpdates.notes = sanitizeHTML(sanitizedUpdates.notes);
    }
    if (sanitizedUpdates.category) {
      sanitizedUpdates.category = sanitizeText(sanitizedUpdates.category);
    }

    setProjects(prev => prev.map(project => 
      project.id === id ? { ...project, ...sanitizedUpdates } : project
    ));
    return true;
  };

  const deleteProject = (id: string): boolean => {
    if (!checkRateLimit('deleteProject', 20, 60000)) {
      console.warn('Muitas exclusões sendo feitas. Tente novamente em alguns segundos.');
      return false;
    }

    setProjects(prev => prev.filter(project => project.id !== id));
    return true;
  };

  const addFileToProject = async (projectId: string, file: File): Promise<{ success: boolean; error?: string }> => {
    if (!checkRateLimit('addFile', 10, 60000)) {
      return { success: false, error: 'Muitos arquivos sendo enviados. Tente novamente em alguns segundos.' };
    }

    // Validate file
    const validation = await validateFile(file, ALLOWED_FILE_TYPES.all, FILE_SIZE_LIMITS.default);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    try {
      const fileUrl = URL.createObjectURL(file);
      const projectFile: ProjectFile = {
        id: Date.now().toString(),
        name: sanitizeText(file.name),
        type: file.type,
        size: file.size,
        url: fileUrl,
        uploadedAt: new Date().toISOString()
      };

      setProjects(prev => prev.map(project => 
        project.id === projectId 
          ? { ...project, files: [...project.files, projectFile] }
          : project
      ));

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Erro ao processar arquivo' };
    }
  };

  const removeFileFromProject = (projectId: string, fileId: string): boolean => {
    if (!checkRateLimit('removeFile', 20, 60000)) {
      console.warn('Muitas remoções sendo feitas. Tente novamente em alguns segundos.');
      return false;
    }

    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { ...project, files: project.files.filter(f => f.id !== fileId) }
        : project
    ));
    return true;
  };

  return {
    projects,
    addProject,
    updateProject,
    deleteProject,
    addFileToProject,
    removeFileFromProject
  };
};
