
import { validateInput, sanitizeText, sanitizeHTML, checkRateLimit, VALIDATION_PATTERNS } from '@/utils/security';
import { useSecureLocalStorage } from './useSecureLocalStorage';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
  completed: boolean;
  createdAt: string;
}

export const useTasks = () => {
  const [tasks, setTasks] = useSecureLocalStorage<Task[]>('focusflow-tasks', [
    {
      id: '1',
      title: 'Estudar para prova de matemática',
      description: 'Revisar capítulos 5-7 do livro de cálculo',
      priority: 'high',
      estimatedTime: '2h',
      completed: false,
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Fazer compras do mês',
      priority: 'medium',
      estimatedTime: '1h',
      completed: false,
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      title: 'Organizar mesa de estudos',
      priority: 'low',
      estimatedTime: '30min',
      completed: true,
      createdAt: new Date().toISOString()
    }
  ], 7 * 24 * 60 * 60 * 1000); // 7 days TTL

  const validateTaskData = (taskData: Omit<Task, 'id' | 'completed' | 'createdAt'>): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!validateInput(taskData.title, VALIDATION_PATTERNS.title)) {
      errors.push('Título deve ter entre 1 e 100 caracteres e conter apenas letras, números e pontuação básica');
    }

    if (taskData.description && !validateInput(taskData.description, VALIDATION_PATTERNS.description)) {
      errors.push('Descrição deve ter no máximo 500 caracteres');
    }

    if (!['high', 'medium', 'low'].includes(taskData.priority)) {
      errors.push('Prioridade deve ser alta, média ou baixa');
    }

    return { isValid: errors.length === 0, errors };
  };

  const addTask = (taskData: Omit<Task, 'id' | 'completed' | 'createdAt'>): Task | null => {
    // Rate limiting
    if (!checkRateLimit('addTask', 20, 60000)) {
      console.warn('Muitas tarefas sendo criadas. Tente novamente em alguns segundos.');
      return null;
    }

    const validation = validateTaskData(taskData);
    if (!validation.isValid) {
      console.warn('Dados da tarefa inválidos:', validation.errors);
      return null;
    }

    const newTask: Task = {
      ...taskData,
      title: sanitizeText(taskData.title),
      description: taskData.description ? sanitizeHTML(taskData.description) : undefined,
      estimatedTime: sanitizeText(taskData.estimatedTime),
      id: Date.now().toString(),
      completed: false,
      createdAt: new Date().toISOString()
    };

    setTasks(prev => [...prev, newTask]);
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Task>): boolean => {
    // Rate limiting
    if (!checkRateLimit('updateTask', 50, 60000)) {
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

    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...sanitizedUpdates } : task
    ));
    return true;
  };

  const deleteTask = (id: string): boolean => {
    if (!checkRateLimit('deleteTask', 30, 60000)) {
      console.warn('Muitas exclusões sendo feitas. Tente novamente em alguns segundos.');
      return false;
    }

    setTasks(prev => prev.filter(task => task.id !== id));
    return true;
  };

  const toggleTask = (id: string): boolean => {
    const task = tasks.find(t => t.id === id);
    if (!task) return false;
    
    return updateTask(id, { completed: !task.completed });
  };

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTask
  };
};
