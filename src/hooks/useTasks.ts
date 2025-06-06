
import { useLocalStorage } from './useLocalStorage';

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
  const [tasks, setTasks] = useLocalStorage<Task[]>('focusflow-tasks', [
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
  ]);

  const addTask = (taskData: Omit<Task, 'id' | 'completed' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      completed: false,
      createdAt: new Date().toISOString()
    };
    setTasks(prev => [...prev, newTask]);
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const toggleTask = (id: string) => {
    updateTask(id, { completed: !tasks.find(t => t.id === id)?.completed });
  };

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTask
  };
};
