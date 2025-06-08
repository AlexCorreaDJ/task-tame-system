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
  try {
    console.log('🔔 Solicitando permissão para notificações...');
    
    const permission: PermissionStatus = await LocalNotifications.requestPermissions();
    console.log('📱 Resultado da permissão:', permission);
    
    if (permission.display === 'granted') {
      console.log('✅ Permissão concedida!');
      
      // Cria canal de notificação para Android
      if (Capacitor.getPlatform() === 'android') {
        await LocalNotifications.createChannel({
          id: 'tdahfocus-reminders',
          name: 'Lembretes TDAHFOCUS',
          description: 'Lembretes motivacionais para manter seu foco',
          importance: 5, // IMPORTANCE_HIGH
          visibility: 1, // VISIBILITY_PUBLIC
          sound: 'default',
          vibration: true,
          lights: true,
          lightColor: '#4F46E5'
        });
        console.log('📱 Canal de notificação criado para Android');
      }
      
      return true;
    }
    
    console.log('❌ Permissão negada');
    return false;
  } catch (error) {
    console.error('❌ Erro ao solicitar permissão:', error);
    return false;
  }
};

export const scheduleLocalNotification = async (
  notification: LocalNotification,
  schedule?: Schedule
): Promise<void> => {
  try {
    console.log('📅 Agendando notificação:', {
      id: notification.id,
      title: notification.title,
      schedule: schedule
    });
    
    await LocalNotifications.schedule({
      notifications: [
        {
          id: notification.id,
          title: notification.title,
          body: notification.body,
          sound: 'default', // Força som padrão
          schedule: schedule || undefined,
          extra: notification.extra || undefined,
          smallIcon: 'ic_notification',
          iconColor: '#4F46E5',
          channelId: 'tdahfocus-reminders', // Usa o canal criado
          actionTypeId: 'REMINDER_ACTION',
          attachments: undefined,
        },
      ],
    });
    
    console.log('✅ Notificação agendada com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao agendar notificação:', error);
    throw error;
  }
};

export const showLocalNotification = async (
  notification: LocalNotification
): Promise<void> => {
  await scheduleLocalNotification(notification);
};

export const cancelLocalNotification = async (id: number): Promise<void> => {
  try {
    console.log(`🗑️ Cancelando notificação ${id}`);
    await LocalNotifications.cancel({ notifications: [{ id }] });
    console.log(`✅ Notificação ${id} cancelada`);
  } catch (error) {
    console.error(`❌ Erro ao cancelar notificação ${id}:`, error);
  }
};

export const cancelAllLocalNotifications = async (): Promise<void> => {
  try {
    const pending = await LocalNotifications.getPending();
    console.log(`🗑️ Cancelando ${pending.notifications.length} notificações pendentes`);
    
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications });
      console.log('✅ Todas as notificações canceladas');
    }
  } catch (error) {
    console.error('❌ Erro ao cancelar todas as notificações:', error);
  }
};

export const getScheduledLocalNotifications = async (): Promise<LocalNotification[]> => {
  try {
    const result = await LocalNotifications.getPending();
    console.log(`📋 ${result.notifications.length} notificações agendadas`);
    return result.notifications;
  } catch (error) {
    console.error('❌ Erro ao buscar notificações agendadas:', error);
    return [];
  }
};

export const testBalloonNotification = async (): Promise<boolean> => {
  try {
    console.log('🧪 Testando notificação...');
    
    await showLocalNotification({
      id: 999999, // ID único para teste
      title: "🧪 Teste TDAHFOCUS",
      body: "Se você está vendo isso, as notificações estão funcionando! 🎉📱",
      sound: 'default',
      channelId: 'tdahfocus-reminders',
      smallIcon: 'ic_notification',
      iconColor: '#4F46E5'
    });
    
    console.log('✅ Notificação de teste enviada');
    return true;
  } catch (error) {
    console.error('❌ Erro ao testar notificação:', error);
    return false;
  }
};

export const initializeLocalNotifications = async (): Promise<boolean> => {
  if (!isNativePlatform()) {
    console.log('🌐 Não é app nativo, pulando inicialização de notificações locais');
    return false;
  }

  try {
    console.log('🚀 Inicializando sistema de notificações locais...');
    
    const permission = await requestLocalNotificationPermission();
    if (permission) {
      console.log('✅ Notificações locais inicializadas com sucesso');
      
      // Configura listeners para notificações
      LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
        console.log('👆 Usuário tocou na notificação:', notification);
      });
      
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
  extra?: any,
  notificationId?: number // Parâmetro opcional para ID da notificação
): Promise<boolean> => {
  try {
    console.log(`⏰ Agendando lembrete "${title}" para ${time}`);
    
    const [hours, minutes] = time.split(':').map(Number);

    if (isNaN(hours) || isNaN(minutes)) {
      throw new Error(`Formato inválido para horário: ${time}`);
    }

    const now = new Date();
    const scheduleDate = new Date();
    scheduleDate.setHours(hours, minutes, 0, 0);

    // Se o horário já passou hoje, agenda para amanhã
    if (scheduleDate <= now) {
      scheduleDate.setDate(scheduleDate.getDate() + 1);
      console.log(`⏰ Horário já passou hoje, agendando para amanhã: ${scheduleDate.toLocaleString()}`);
    } else {
      console.log(`⏰ Agendando para hoje: ${scheduleDate.toLocaleString()}`);
    }

    const schedule: Schedule = { 
      at: scheduleDate,
      repeats: true, // Repetir diariamente
      every: 'day'
    };

    await scheduleLocalNotification(
      {
        id: notificationId || Date.now(),
        title: `🎯 ${title}`,
        body: body || 'É hora do seu foco! Mantenha a concentração! 🚀',
        extra: {
          ...extra,
          scheduledTime: time,
          createdAt: new Date().toISOString()
        },
        sound: 'default',
        channelId: 'tdahfocus-reminders',
        smallIcon: 'ic_notification',
        iconColor: '#4F46E5'
      },
      schedule
    );

    console.log(`✅ Lembrete "${title}" agendado para ${scheduleDate.toLocaleString()}`);
    
    // Verifica se foi realmente agendado
    const agendadas = await getScheduledLocalNotifications();
    console.log(`📋 Total de notificações agendadas: ${agendadas.length}`);
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao agendar lembrete:', error);
    return false;
  }
};

// Sistema de verificação manual (backup)
let reminderCheckerStarted = false;
let reminderInterval: NodeJS.Timeout | null = null;

export const startReminderChecker = () => {
  if (reminderCheckerStarted) {
    console.log('⚠️ Sistema de verificação já está rodando');
    return;
  }
  
  reminderCheckerStarted = true;
  console.log("⏰ Iniciando sistema de verificação de lembretes...");

  // Verifica a cada 30 segundos para maior precisão
  reminderInterval = setInterval(async () => {
    try {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      // Busca lembretes do localStorage
      const remindersData = localStorage.getItem('reminders');
      if (!remindersData) return;
      
      const reminders = JSON.parse(remindersData);
      
      for (const reminder of reminders) {
        if (reminder.isActive && reminder.time === currentTime) {
          console.log(`🔔 Disparando lembrete manual: "${reminder.title}" às ${currentTime}`);
          
          // Dispara notificação imediata
          await showLocalNotification({
            id: Date.now() + Math.random() * 1000, // ID único
            title: `🎯 ${reminder.title}`,
            body: reminder.description || 'É hora do seu foco! Mantenha a concentração! 🚀',
            sound: 'default',
            channelId: 'tdahfocus-reminders',
            smallIcon: 'ic_notification',
            iconColor: '#4F46E5',
            extra: {
              reminderType: reminder.type,
              reminderId: reminder.id,
              triggeredAt: new Date().toISOString()
            }
          });
        }
      }
    } catch (error) {
      console.error('❌ Erro no verificador de lembretes:', error);
    }
  }, 30000); // Verifica a cada 30 segundos
};

export const stopReminderChecker = () => {
  if (reminderInterval) {
    clearInterval(reminderInterval);
    reminderInterval = null;
    reminderCheckerStarted = false;
    console.log('🛑 Sistema de verificação de lembretes parado');
  }
};