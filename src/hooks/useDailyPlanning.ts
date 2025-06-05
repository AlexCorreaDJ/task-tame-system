
import { useLocalStorage } from './useLocalStorage';

export interface DailyPlanItem {
  id: string;
  time: string;
  activity: string;
  description?: string;
  completed: boolean;
  isBreak: boolean;
  duration: number; // em minutos
  createdAt: string;
}

export const useDailyPlanning = () => {
  const today = new Date().toISOString().split('T')[0];
  const [dailyPlans, setDailyPlans] = useLocalStorage<Record<string, DailyPlanItem[]>>('focusflow-daily-plans', {});

  const getTodayPlan = () => {
    return dailyPlans[today] || [];
  };

  const addPlanItem = (itemData: Omit<DailyPlanItem, 'id' | 'completed' | 'createdAt'>) => {
    const newItem: DailyPlanItem = {
      ...itemData,
      id: Date.now().toString(),
      completed: false,
      createdAt: new Date().toISOString()
    };

    setDailyPlans(prev => ({
      ...prev,
      [today]: [...(prev[today] || []), newItem].sort((a, b) => a.time.localeCompare(b.time))
    }));

    return newItem;
  };

  const updatePlanItem = (id: string, updates: Partial<DailyPlanItem>) => {
    setDailyPlans(prev => ({
      ...prev,
      [today]: (prev[today] || []).map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    }));
  };

  const deletePlanItem = (id: string) => {
    setDailyPlans(prev => ({
      ...prev,
      [today]: (prev[today] || []).filter(item => item.id !== id)
    }));
  };

  const togglePlanItem = (id: string) => {
    const item = getTodayPlan().find(item => item.id === id);
    if (item) {
      updatePlanItem(id, { completed: !item.completed });
    }
  };

  const createTDAHTemplate = () => {
    const template = [
      { time: "07:00", activity: "Despertar suave", description: "Alongamentos e respiração", isBreak: false, duration: 15 },
      { time: "07:30", activity: "Café da manhã", description: "Refeição nutritiva", isBreak: true, duration: 30 },
      { time: "08:00", activity: "Tarefa prioritária", description: "Foco na tarefa mais importante", isBreak: false, duration: 45 },
      { time: "08:45", activity: "Pausa ativa", description: "Caminhada ou movimento", isBreak: true, duration: 15 },
      { time: "09:00", activity: "Trabalho/Estudo", description: "Bloco de concentração", isBreak: false, duration: 90 },
      { time: "10:30", activity: "Lanche", description: "Hidratação e snack", isBreak: true, duration: 15 },
      { time: "10:45", activity: "Tarefas administrativas", description: "E-mails, organização", isBreak: false, duration: 45 },
      { time: "12:00", activity: "Almoço", description: "Refeição e descanso", isBreak: true, duration: 60 },
      { time: "13:00", activity: "Trabalho/Estudo", description: "Segundo bloco de foco", isBreak: false, duration: 90 },
      { time: "14:30", activity: "Pausa criativa", description: "Atividade prazerosa", isBreak: true, duration: 30 },
      { time: "15:00", activity: "Revisão e organização", description: "Planejamento do dia seguinte", isBreak: false, duration: 30 },
      { time: "18:00", activity: "Exercício físico", description: "Atividade física", isBreak: true, duration: 45 },
      { time: "19:00", activity: "Jantar", description: "Refeição em família/relaxamento", isBreak: true, duration: 60 },
      { time: "21:00", activity: "Relaxamento", description: "Leitura, meditação ou hobby", isBreak: true, duration: 60 },
      { time: "22:00", activity: "Preparação para dormir", description: "Rotina noturna", isBreak: true, duration: 30 }
    ];

    template.forEach(item => {
      addPlanItem(item);
    });
  };

  return {
    todayPlan: getTodayPlan(),
    addPlanItem,
    updatePlanItem,
    deletePlanItem,
    togglePlanItem,
    createTDAHTemplate
  };
};
