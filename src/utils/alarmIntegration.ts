import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

// Verifica se está rodando em Android nativo
export const isAlarmSupported = () => {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
};

// Pede permissão para notificações
export const requestNotificationPermission = async () => {
  const permission = await LocalNotifications.requestPermissions();
  return permission.display === 'granted';
};

// Agenda notificação local no horário informado
export const createSystemAlarm = async (
  title: string,
  time: string,
  description?: string
) => {
  if (!isAlarmSupported()) {
    console.log('⚠️ Alarmes do sistema só funcionam no app nativo Android');
    return false;
  }

  // Pede permissão para notificação
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    console.log('⚠️ Permissão para notificações negada');
    return false;
  }

  try {
    // Parse do horário "HH:mm"
    const [hours, minutes] = time.split(':').map(Number);

    // Calcula o momento para agendar
    const now = new Date();
    const alarmDate = new Date();
    alarmDate.setHours(hours, minutes, 0, 0);
    if (alarmDate <= now) {
      alarmDate.setDate(alarmDate.getDate() + 1);
    }

    console.log(`⏰ Agendando notificação para: ${alarmDate.toLocaleString()}`);

    // Agenda a notificação
    await LocalNotifications.schedule({
      notifications: [
        {
          id: new Date().getTime(), // id único
          title: `🎯 ${title}`,
          body: description ?? '',
          schedule: { at: alarmDate },
          sound: null,
        },
      ],
    });

    console.log('✅ Notificação agendada com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao agendar notificação:', error);
    return false;
  }
};

// Método antigo para abrir o app relógio via Intent, caso queira manter
export const createAlarmViaIntent = async (title: string, time: string) => {
  if (!isAlarmSupported()) return false;

  try {
    const [hours, minutes] = time.split(':').map(Number);

    const intentUrl =
      `intent://alarm?` +
      `action=android.intent.action.SET_ALARM&` +
      `android.intent.extra.alarm.HOUR=${hours}&` +
      `android.intent.extra.alarm.MINUTES=${minutes}&` +
      `android.intent.extra.alarm.MESSAGE=${encodeURIComponent(`🎯 ${title}`)}&` +
      `android.intent.extra.alarm.SKIP_UI=false&` +
      `android.intent.extra.alarm.VIBRATE=true` +
      `#Intent;scheme=alarm;package=com.google.android.deskclock;end`;

    window.open(intentUrl, '_system');

    console.log('✅ Redirecionado para o app de alarmes do Android');
    return true;
  } catch (error) {
    console.error('❌ Erro ao abrir app de alarmes:', error);
    return false;
  }
};
