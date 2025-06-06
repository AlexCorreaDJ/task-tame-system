
import { Capacitor } from '@capacitor/core';

export const isAlarmSupported = () => {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
};

export const createSystemAlarm = async (title: string, time: string, description?: string) => {
  if (!isAlarmSupported()) {
    console.log('⚠️ Alarmes do sistema só funcionam no app nativo Android');
    return false;
  }

  try {
    // Parse do horário
    const [hours, minutes] = time.split(':').map(Number);
    
    // Cria a data para o alarme
    const now = new Date();
    const alarmDate = new Date();
    alarmDate.setHours(hours, minutes, 0, 0);
    
    // Se o horário já passou hoje, agenda para amanhã
    if (alarmDate <= now) {
      alarmDate.setDate(alarmDate.getDate() + 1);
    }

    console.log(`⏰ Criando alarme do sistema para: ${alarmDate.toLocaleString()}`);

    // Usar Intent do Android para criar alarme
    const intent = {
      action: 'android.intent.action.SET_ALARM',
      extras: {
        'android.intent.extra.alarm.HOUR': hours,
        'android.intent.extra.alarm.MINUTES': minutes,
        'android.intent.extra.alarm.MESSAGE': `🎯 ${title}`,
        'android.intent.extra.alarm.SKIP_UI': false, // Mostra a UI do alarme
        'android.intent.extra.alarm.VIBRATE': true,
        'android.intent.extra.alarm.RINGTONE': 'content://settings/system/alarm_alert'
      }
    };

    // Chama o plugin do Capacitor para abrir o Intent
    if (Capacitor.isPluginAvailable('App')) {
      const { App } = await import('@capacitor/app');
      
      // Abre o app de alarmes do Android
      await App.openUrl({
        url: `intent://alarm?${new URLSearchParams({
          action: 'android.intent.action.SET_ALARM',
          'android.intent.extra.alarm.HOUR': hours.toString(),
          'android.intent.extra.alarm.MINUTES': minutes.toString(),
          'android.intent.extra.alarm.MESSAGE': `🎯 ${title}`,
          'android.intent.extra.alarm.SKIP_UI': 'false'
        }).toString()}#Intent;scheme=alarm;package=com.google.android.deskclock;end`
      });

      console.log('✅ Alarme criado com sucesso no sistema!');
      return true;
    }

    return false;
  } catch (error) {
    console.error('❌ Erro ao criar alarme do sistema:', error);
    return false;
  }
};

export const createAlarmViaIntent = async (title: string, time: string) => {
  if (!isAlarmSupported()) return false;

  try {
    const [hours, minutes] = time.split(':').map(Number);
    
    // URL do Intent para criar alarme
    const intentUrl = `intent://alarm?` +
      `action=android.intent.action.SET_ALARM&` +
      `android.intent.extra.alarm.HOUR=${hours}&` +
      `android.intent.extra.alarm.MINUTES=${minutes}&` +
      `android.intent.extra.alarm.MESSAGE=${encodeURIComponent(`🎯 ${title}`)}&` +
      `android.intent.extra.alarm.SKIP_UI=false&` +
      `android.intent.extra.alarm.VIBRATE=true` +
      `#Intent;scheme=alarm;package=com.google.android.deskclock;end`;

    // Abre o app de alarmes
    window.open(intentUrl, '_system');
    
    console.log('✅ Redirecionado para o app de alarmes do Android');
    return true;
  } catch (error) {
    console.error('❌ Erro ao abrir app de alarmes:', error);
    return false;
  }
};
