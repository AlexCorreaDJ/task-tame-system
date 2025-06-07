
import {
  LocalNotifications,
  PermissionStatus,
  LocalNotification,
  Schedule,
} from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

// Check if running on native platform
export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

// Solicitar permissão para notificações locais
export const requestLocalNotificationPermission = async (): Promise<boolean> => {
  const permission: PermissionStatus = await LocalNotifications.requestPermissions();
  return permission.display === 'granted';
};

// Agendar uma notificação local
export const scheduleLocalNotification = async (
  notification: LocalNotification,
  schedule?: Schedule
): Promise<void> => {
  await LocalNotifications.schedule({
    notifications: [
      {
        id: notification.id,
        title: notification.title,
        body: notification.body,
        sound: notification.sound || undefined,
        schedule: schedule || undefined,
        extra: notification.extra || undefined,
        smallIcon: notification.smallIcon || undefined,
        iconColor: notification.iconColor || undefined,
        group: notification.group || undefined,
      },
    ],
  });
};

// Mostrar notificação imediatamente (agendar sem delay)
export const showLocalNotification = async (
  notification: LocalNotification
): Promise<void> => {
  await scheduleLocalNotification(notification);
};

// Cancelar notificação por ID
export const cancelLocalNotification = async (id: number): Promise<void> => {
  await LocalNotifications.cancel({ notifications: [{ id }] });
};

// Cancelar todas notificações agendadas
export const cancelAllLocalNotifications = async (): Promise<void> => {
  const pending = await LocalNotifications.getPending();
  if (pending.notifications.length > 0) {
    await LocalNotifications.cancel({ notifications: pending.notifications });
  }
};

// Listar todas notificações agendadas
export const getScheduledLocalNotifications = async (): Promise<LocalNotification[]> => {
  const result = await LocalNotifications.getPending();
  return result.notifications;
};

// Testar notificação local
export const testLocalNotification = async (): Promise<boolean> => {
  try {
    await showLocalNotification({
      id: 999,
      title: "🧪 Teste de Notificação",
      body: "Esta é uma notificação de teste! 📱✨"
    });
    return true;
  } catch (error) {
    console.error('Erro ao testar notificação:', error);
    return false;
  }
};

// Inicializar sistema de notificações locais
export const initializeLocalNotifications = async (): Promise<boolean> => {
  if (!isNativePlatform()) {
    console.log('🌐 Não é app nativo, pulando inicialização de notificações locais');
    return false;
  }

  try {
    const permission = await requestLocalNotificationPermission();
    if (permission) {
      console.log('✅ Notificações locais inicializadas com sucesso');
      return true;
    } else {
      console.log('❌ Permissão de notificação negada');
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao inicializar notificações locais:', error);
    return false;
  }
};

// Agendar lembrete para hoje
export const scheduleReminderForToday = async (
  title: string,
  body: string,
  time: string, // HH:MM format
  extra?: any
): Promise<boolean> => {
  try {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const scheduleDate = new Date();
    scheduleDate.setHours(hours, minutes, 0, 0);

    // Se o horário já passou hoje, agendar para amanhã
    if (scheduleDate <= now) {
      scheduleDate.setDate(scheduleDate.getDate() + 1);
    }

    const schedule: Schedule = {
      at: scheduleDate,
    };

    await scheduleLocalNotification(
      {
        id: Date.now(),
        title,
        body,
        extra,
      },
      schedule
    );

    console.log('✅ Lembrete agendado para:', scheduleDate.toLocaleString());
    return true;
  } catch (error) {
    console.error('❌ Erro ao agendar lembrete:', error);
    return false;
  }
};
