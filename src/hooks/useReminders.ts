import { useEffect, useState } from 'react';
import {
  requestLocalNotificationPermission,
  testBalloonNotification,
  scheduleReminderForToday,
} from '@/utils/reminderNotifications';

export const useReminders = () => {
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Função para pedir permissão
  const requestPermission = async () => {
    try {
      const granted = await requestLocalNotificationPermission();
      setPermissionGranted(granted);
      if (!granted) {
        setError('Permissão para notificações negada');
      } else {
        setError(null);
      }
    } catch (e) {
      setError('Erro ao solicitar permissão');
    }
  };

  // Testa a notificação "balão"
  const testNotification = async () => {
    try {
      await testBalloonNotification();
    } catch (e) {
      setError('Erro ao testar notificação');
    }
  };

  // Agendar lembrete para hoje em HH:MM
  const scheduleReminder = async (title: string, body: string, time: string) => {
    try {
      const success = await scheduleReminderForToday(title, body, time);
      if (!success) {
        setError('Erro ao agendar lembrete');
      } else {
        setError(null);
      }
    } catch {
      setError('Erro inesperado ao agendar lembrete');
    }
  };

  useEffect(() => {
    requestPermission();
  }, []);

  return {
    permissionGranted,
    error,
    requestPermission,
    testNotification,
    scheduleReminder,
  };
};
