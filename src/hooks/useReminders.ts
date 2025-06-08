import { useEffect, useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Reminder } from '@/types/reminder';
import {
  requestLocalNotificationPermission,
  testBalloonNotification,
  scheduleReminderForToday,
  isNativePlatform,
  cancelLocalNotification,
  initializeLocalNotifications,
  startReminderChecker
} from '@/utils/localNotifications';
import { scheduleReminder, rescheduleReminder, cancelReminder } from '@/utils/reminderScheduler';

export const useReminders = () => {
  const [reminders, setReminders] = useLocalStorage<Reminder[]>('reminders', []);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Função para pedir permissão
  const requestNotificationPermission = async () => {
    try {
      const granted = await requestLocalNotificationPermission();
      setPermissionGranted(granted);
      if (!granted) {
        setError('Permissão para notificações negada');
      } else {
        setError(null);
      }
      return granted;
    } catch (e) {
      setError('Erro ao solicitar permissão');
      return false;
    }
  };

  // Testa a notificação "balão"
  const testBalloonNotification = async () => {
    try {
      await testBalloonNotification();
    } catch (e) {
      setError('Erro ao testar notificação');
    }
  };

  // Adicionar lembrete
  const addReminder = async (reminderData: Omit<Reminder, 'id' | 'createdAt'>) => {
    const newReminder: Reminder = {
      ...reminderData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    try {
      const scheduledReminder = await scheduleReminder(newReminder);
      setReminders(prev => [...prev, scheduledReminder]);
      setError(null);
    } catch (e) {
      setError('Erro ao adicionar lembrete');
    }
  };

  // Deletar lembrete
  const deleteReminder = async (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
      try {
        await cancelReminder(reminder);
        setReminders(prev => prev.filter(r => r.id !== id));
        setError(null);
      } catch (e) {
        setError('Erro ao deletar lembrete');
      }
    }
  };

  // Toggle ativo/inativo
  const toggleReminder = async (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
      try {
        const updates = { isActive: !reminder.isActive };
        await rescheduleReminder(reminder, updates);
        
        setReminders(prev => 
          prev.map(r => 
            r.id === id ? { ...r, ...updates } : r
          )
        );
        setError(null);
      } catch (e) {
        setError('Erro ao atualizar lembrete');
      }
    }
  };

  // Toggle estilo balão (apenas para apps nativos)
  const toggleBalloonStyle = async (id: string) => {
    if (!isNativePlatform()) return;
    
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
      try {
        const updates = { useBalloonStyle: !reminder.useBalloonStyle };
        await rescheduleReminder(reminder, updates);
        
        setReminders(prev => 
          prev.map(r => 
            r.id === id ? { ...r, ...updates } : r
          )
        );
        setError(null);
      } catch (e) {
        setError('Erro ao atualizar estilo do lembrete');
      }
    }
  };

  // Inicializar sistema de lembretes
  const startReminderSystem = async () => {
    try {
      // Inicializa notificações locais se for app nativo
      if (isNativePlatform()) {
        const initialized = await initializeLocalNotifications();
        setPermissionGranted(initialized);
        
        if (initialized) {
          // Inicia o verificador de lembretes
          startReminderChecker();
        }
      } else {
        // Para web, apenas solicita permissão
        await requestNotificationPermission();
      }
      
      setError(null);
      
      // Retorna função de cleanup (vazia por enquanto)
      return () => {
        // Cleanup se necessário
      };
    } catch (e) {
      setError('Erro ao inicializar sistema de lembretes');
      return () => {};
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return {
    reminders,
    permissionGranted,
    error,
    addReminder,
    deleteReminder,
    toggleReminder,
    toggleBalloonStyle,
    testBalloonNotification,
    requestNotificationPermission,
    startReminderSystem,
  };
};