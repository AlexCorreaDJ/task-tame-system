
import { useLocalStorage } from './useLocalStorage';
import { toast } from '@/hooks/use-toast';
import { Reminder } from '@/types/reminder';
import {
  requestNotificationPermission,
  testBalloonNotification,
  startReminderSystem
} from '@/utils/reminderNotifications';
import {
  scheduleReminder,
  rescheduleReminder,
  cancelReminder
} from '@/utils/reminderScheduler';

export const useReminders = () => {
  const [reminders, setReminders] = useLocalStorage<Reminder[]>('focusflow-reminders', []);

  const addReminder = async (reminderData: Omit<Reminder, 'id' | 'createdAt'>) => {
    const newReminder: Reminder = {
      ...reminderData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    const scheduledReminder = await scheduleReminder(newReminder);
    setReminders(prev => [...prev, scheduledReminder]);
    return scheduledReminder;
  };

  const updateReminder = async (id: string, updates: Partial<Reminder>) => {
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
      await rescheduleReminder(reminder, updates);
    }
    
    setReminders(prev => prev.map(reminder => 
      reminder.id === id ? { ...reminder, ...updates } : reminder
    ));
  };

  const deleteReminder = async (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
      await cancelReminder(reminder);
    }
    
    setReminders(prev => prev.filter(reminder => reminder.id !== id));
  };

  const toggleReminder = async (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
      await updateReminder(id, { isActive: !reminder.isActive });
      console.log('🔄 Lembrete', reminder.isActive ? 'desativado' : 'ativado', ':', reminder.title);
    }
  };

  // Função placeholder para compatibilidade
  const toggleBalloonStyle = async (id: string) => {
    // Para notificações locais, todas já são exibidas como balão no Android
    toast({
      title: "ℹ️ Notificações locais",
      description: "Todas as notificações locais já são exibidas como balão no Android",
    });
  };

  // Wrapper para o sistema de lembretes que passa os reminders atuais
  const startReminderSystemWrapper = async () => {
    return await startReminderSystem(reminders);
  };

  return {
    reminders,
    addReminder,
    updateReminder,
    deleteReminder,
    toggleReminder,
    toggleBalloonStyle,
    testBalloonNotification,
    requestNotificationPermission,
    startReminderSystem: startReminderSystemWrapper
  };
};
