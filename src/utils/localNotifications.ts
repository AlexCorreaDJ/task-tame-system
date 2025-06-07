import {
  LocalNotifications,
  PermissionStatus,
  LocalNotification,
  ScheduleOptions,
} from '@capacitor/local-notifications';

// Solicitar permissão para notificações locais
export const requestLocalNotificationPermission = async (): Promise<boolean> => {
  const permission: PermissionStatus = await LocalNotifications.requestPermissions();
  return permission.display === 'granted';
};

// Agendar uma notificação local
export const scheduleLocalNotification = async (
  notification: LocalNotification,
  schedule?: ScheduleOptions
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
  await LocalNotifications.cancelAll();
};

// Listar todas notificações agendadas
export const getScheduledLocalNotifications = async (): Promise<LocalNotification[]> => {
  const result = await LocalNotifications.getPending();
  return result.notifications;
};
