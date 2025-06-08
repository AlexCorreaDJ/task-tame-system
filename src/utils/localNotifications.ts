import {
  LocalNotifications,
  PermissionStatus,
  LocalNotification,
  Schedule,
} from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

export const requestLocalNotificationPermission = async (): Promise<boolean> => {
  const permission: PermissionStatus = await LocalNotifications.requestPermissions();
  return permission.display === 'granted';
};

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
        sound: notification.sound ?? null,
        schedule: schedule ?? undefined,
        extra: notification.extra ?? undefined,
        smallIcon: notification.smallIcon ?? undefined,
        iconColor: notification.iconColor ?? undefined,
        group: notification.group ?? undefined,
      },
    ],
  });
};

export const showLocalNotification = async (
  notification: LocalNotification
): Promise<void> => {
  // Agendar notificação para disparar imediatamente (sem schedule)
  await scheduleLocalNotification(notification);
};

export const cancelLocalNotification = async (id: number): Promise<void> => {
  await LocalNotifications.cancel({ notifications: [{ id }] });
};

export const cancelAllLocalNotifications = async (): Promise<void> => {
  const pending = await LocalNotifications.getPending();
  if (pending.notifications.length > 0) {
    await LocalNotifications.cancel({ notifications: pending.notifications });
  }
};

export const getScheduledLocalNotifications = async (): Promise<LocalNotification[]> => {
  const result = await LocalNotifications.getPending();
  return result.notifications;
};

export const testLocalNotification = async (): Promise<boolean> => {
  try {
    await showLocalNotification({
      id: 999,
      title: "🧪 Teste de Notificação",
      body: "Esta é uma notificação de teste! 📱✨",
      sound: null,
    });
    return true;
  } catch (error) {
    console.error('Erro ao testar notificação:', error);
    return false;
  }
};

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

export const scheduleReminderForToday = async (
  title: string,
  body: string,
  time: string, // Formato HH:MM
  extra?: any
): Promise<boolean> => {
  try {
    const [hours, minutes] = time.split(':').map(Number);

    if (isNaN(hours) || isNaN(minutes)) {
      throw new Error(`Formato inválido para horário: ${time}`);
    }

    const now = new Date();
    const scheduleDate = new Date();
    scheduleDate.setHours(hours, minutes, 0, 0);

    if (scheduleDate <= now) {
      scheduleDate.setDate(scheduleDate.getDate() + 1);
    }

    const schedule: Schedule = { at: scheduleDate };

    await scheduleLocalNotification(
      {
        id: Date.now(), // Atenção a possíveis ids duplicados em chamadas rápidas
        title,
        body,
        extra,
        sound: null,
      },
      schedule
    );

    console.log('✅ Lembrete agendado para:', scheduleDate.toLocaleString());

    const agendadas = await getScheduledLocalNotifications();
    console.log("🔍 Notificações agendadas:", agendadas);

    return true;
  } catch (error) {
    console.error('❌ Erro ao agendar lembrete:', error);
    return false;
  }
};

let reminderCheckerStarted = false;

export const startReminderChecker = () => {
  if (reminderCheckerStarted) return;
  reminderCheckerStarted = true;

  console.log("⏰ Iniciando verificação de lembretes a cada minuto...");

  setInterval(async () => {
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const reminders = await getScheduledLocalNotifications();

    for (const r of reminders) {
      const scheduleAt = r.schedule?.at;
      if (!scheduleAt) continue;

      const scheduledDate = new Date(scheduleAt);
      const scheduledMinutes = scheduledDate.getHours() * 60 + scheduledDate.getMinutes();

      if (
        scheduledDate.toDateString() === now.toDateString() &&
        scheduledMinutes === nowMinutes
      ) {
        console.log("🔔 Disparando lembrete agora:", r.title);
        await showLocalNotification(r);
        await cancelLocalNotification(r.id);
      }
    }
  }, 60 * 1000);
};
