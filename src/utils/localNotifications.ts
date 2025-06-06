
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { toast } from '@/hooks/use-toast';

// Verifica se estamos no ambiente nativo
export const isNativePlatform = () => {
  return Capacitor.isNativePlatform();
};

/**
 * Solicita permissão para notificações locais
 */
export const requestLocalNotificationPermission = async (): Promise<boolean> => {
  if (!isNativePlatform()) {
    console.log('⚠️ Notificações locais só funcionam no app nativo');
    return false;
  }

  try {
    console.log('📱 Solicitando permissão para notificações locais...');
    
    const permission = await LocalNotifications.requestPermissions();
    console.log('📋 Resultado da permissão:', permission);
    
    if (permission.display === 'granted') {
      console.log('✅ Permissão para notificações locais concedida');
      
      // Cria canal de notificação para Android
      await LocalNotifications.createChannel({
        id: 'tdahfocus-local-reminders',
        name: 'Lembretes TDAHFOCUS',
        description: 'Lembretes pontuais que aparecem em balão',
        importance: 5, // IMPORTANCE_HIGH
        visibility: 1, // VISIBILITY_PUBLIC
        sound: 'default',
        vibration: true,
        lights: true,
        lightColor: '#4F46E5',
      });
      
      toast({
        title: "✅ Permissão concedida!",
        description: "Notificações locais ativadas com sucesso! 🔔",
      });
      
      return true;
    } else {
      console.log('❌ Permissão para notificações locais negada');
      toast({
        title: "❌ Permissão negada",
        description: "Ative as notificações nas configurações do Android",
        variant: "destructive"
      });
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao solicitar permissão:', error);
    toast({
      title: "❌ Erro na permissão",
      description: "Não foi possível solicitar permissão para notificações",
      variant: "destructive"
    });
    return false;
  }
};

/**
 * Agenda um lembrete pontual usando notificações locais
 */
export const scheduleLocalReminder = async (
  title: string,
  body: string,
  scheduledTime: Date,
  extraData?: any
): Promise<boolean> => {
  if (!isNativePlatform()) {
    console.log('⚠️ Agendamento local só funciona no app nativo');
    return false;
  }

  try {
    const id = Date.now();
    console.log(`📅 Agendando lembrete local "${title}" para ${scheduledTime.toLocaleString()}`);
    
    await LocalNotifications.schedule({
      notifications: [
        {
          id,
          title: `🎯 ${title}`,
          body: body || 'É hora do seu foco! 🚀',
          schedule: { at: scheduledTime },
          sound: 'default',
          channelId: 'tdahfocus-local-reminders',
          smallIcon: 'ic_notification',
          iconColor: '#4F46E5',
          extra: {
            ...extraData,
            type: 'local-reminder',
            scheduledAt: scheduledTime.toISOString(),
            createdAt: new Date().toISOString()
          },
          actionTypeId: 'REMINDER_ACTION',
          attachments: undefined
        }
      ]
    });
    
    console.log(`✅ Lembrete local "${title}" agendado com sucesso! ID: ${id}`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao agendar lembrete local:', error);
    return false;
  }
};

/**
 * Agenda lembrete para daqui a X minutos (para testes)
 */
export const scheduleReminderInMinutes = async (
  title: string,
  body: string,
  minutes: number,
  extraData?: any
): Promise<boolean> => {
  const scheduledTime = new Date(Date.now() + minutes * 60 * 1000);
  return await scheduleLocalReminder(title, body, scheduledTime, extraData);
};

/**
 * Agenda lembrete para horário específico hoje
 */
export const scheduleReminderForToday = async (
  title: string,
  body: string,
  timeString: string, // formato "HH:MM"
  extraData?: any
): Promise<boolean> => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const scheduledTime = new Date();
  scheduledTime.setHours(hours, minutes, 0, 0);
  
  // Se o horário já passou hoje, agenda para amanhã
  if (scheduledTime <= new Date()) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }
  
  return await scheduleLocalReminder(title, body, scheduledTime, extraData);
};

/**
 * Testa notificação local (aparece em 10 segundos)
 */
export const testLocalNotification = async (): Promise<boolean> => {
  console.log('🧪 Testando notificação local em 10 segundos...');
  
  const success = await scheduleReminderInMinutes(
    '🧪 Teste TDAHFOCUS',
    'Esta é uma notificação de teste local! Se você está vendo isso, as notificações locais estão funcionando perfeitamente! 🎉',
    0.17, // ~10 segundos
    { type: 'test', timestamp: Date.now() }
  );
  
  if (success) {
    toast({
      title: "🧪 Teste agendado!",
      description: "Notificação aparecerá em ~10 segundos",
    });
  } else {
    toast({
      title: "❌ Falha no teste",
      description: "Não foi possível agendar a notificação de teste",
      variant: "destructive"
    });
  }
  
  return success;
};

/**
 * Cancela uma notificação local específica
 */
export const cancelLocalNotification = async (notificationId: number): Promise<boolean> => {
  if (!isNativePlatform()) {
    return false;
  }

  try {
    await LocalNotifications.cancel({
      notifications: [{ id: notificationId }]
    });
    console.log(`🗑️ Notificação local ${notificationId} cancelada`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao cancelar notificação:', error);
    return false;
  }
};

/**
 * Obtém todas as notificações pendentes
 */
export const getPendingLocalNotifications = async () => {
  if (!isNativePlatform()) {
    return [];
  }

  try {
    const pending = await LocalNotifications.getPending();
    console.log(`📋 ${pending.notifications.length} notificações locais pendentes`);
    return pending.notifications;
  } catch (error) {
    console.error('❌ Erro ao obter notificações pendentes:', error);
    return [];
  }
};

/**
 * Inicializa o sistema de notificações locais
 */
export const initializeLocalNotifications = async (): Promise<boolean> => {
  if (!isNativePlatform()) {
    console.log('⚠️ Sistema de notificações locais só funciona no app nativo');
    return false;
  }

  try {
    // Listener para quando o usuário tocar na notificação
    LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
      console.log('👆 Usuário tocou na notificação local:', notification);
      
      toast({
        title: "📱 Notificação aberta",
        description: notification.notification.title || "Lembrete do TDAHFOCUS",
      });
    });
    
    console.log('✅ Sistema de notificações locais inicializado');
    return true;
  } catch (error) {
    console.error('❌ Erro ao inicializar notificações locais:', error);
    return false;
  }
};
