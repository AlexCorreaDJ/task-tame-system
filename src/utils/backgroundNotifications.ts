
import { LocalNotifications } from '@capacitor/local-notifications';
import { isNativeAndroidApp } from './androidNotifications';
import { Reminder } from '@/hooks/useReminders';
import { playNotificationSound } from './audioNotifications';

export const scheduleBackgroundReminder = async (reminder: Reminder) => {
  if (!isNativeAndroidApp()) {
    console.log('⚠️ Notificações agendadas só funcionam no app nativo');
    return false;
  }

  try {
    // Calcula quando a notificação deve ser enviada
    const [hours, minutes] = reminder.time.split(':').map(Number);
    const now = new Date();
    const scheduledDate = new Date();
    scheduledDate.setHours(hours, minutes, 0, 0);
    
    // Se o horário já passou hoje, agenda para amanhã
    if (scheduledDate <= now) {
      scheduledDate.setDate(scheduledDate.getDate() + 1);
    }

    console.log(`📅 Agendando lembrete "${reminder.title}" para ${scheduledDate.toLocaleString()}`);

    await LocalNotifications.schedule({
      notifications: [
        {
          id: parseInt(reminder.id),
          title: `🎯 ${reminder.title}`,
          body: reminder.description || 'É hora do seu foco! Mantenha a concentração! 🚀',
          schedule: {
            at: scheduledDate,
            repeats: true,
            every: 'day'
          },
          sound: 'default',  // Garante que o som padrão seja tocado
          channelId: 'tdahfocus-reminders',
          smallIcon: 'ic_notification',
          iconColor: '#4F46E5',
          extra: {
            reminderType: reminder.type,
            reminderId: reminder.id,
            timestamp: Date.now()
          },
          actionTypeId: 'REMINDER_ACTION',
          attachments: undefined
        }
      ]
    });

    console.log(`✅ Lembrete "${reminder.title}" agendado com sucesso!`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao agendar lembrete:', error);
    return false;
  }
};

export const cancelBackgroundReminder = async (reminderId: string) => {
  if (!isNativeAndroidApp()) return;

  try {
    await LocalNotifications.cancel({
      notifications: [{ id: parseInt(reminderId) }]
    });
    console.log(`🗑️ Lembrete ${reminderId} cancelado`);
  } catch (error) {
    console.error('❌ Erro ao cancelar lembrete:', error);
  }
};

export const scheduleAllActiveReminders = async (reminders: Reminder[]) => {
  if (!isNativeAndroidApp()) {
    console.log('⚠️ Agendamento em lote só funciona no app nativo');
    return;
  }

  console.log('📋 Agendando todos os lembretes ativos...');
  
  // Cancela todas as notificações existentes primeiro
  try {
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({
        notifications: pending.notifications.map(n => ({ id: n.id }))
      });
      console.log(`🗑️ ${pending.notifications.length} notificações pendentes canceladas`);
    }
  } catch (error) {
    console.error('❌ Erro ao cancelar notificações pendentes:', error);
  }

  // Agenda todos os lembretes ativos
  let successCount = 0;
  for (const reminder of reminders.filter(r => r.isActive)) {
    const success = await scheduleBackgroundReminder(reminder);
    if (success) successCount++;
  }

  console.log(`✅ ${successCount} lembretes agendados com sucesso!`);
  return successCount;
};

export const initializeBackgroundNotifications = async () => {
  if (!isNativeAndroidApp()) {
    console.log('⚠️ Sistema de segundo plano só funciona no app nativo');
    return false;
  }

  try {
    // Solicita permissão
    const permission = await LocalNotifications.requestPermissions();
    if (permission.display !== 'granted') {
      console.log('❌ Permissão de notificações negada');
      return false;
    }

    // Cria canal de notificação
    await LocalNotifications.createChannel({
      id: 'tdahfocus-reminders',
      name: 'Lembretes TDAHFOCUS',
      description: 'Lembretes que aparecem na tela mesmo com o app fechado',
      importance: 5, // IMPORTANCE_HIGH
      visibility: 1, // VISIBILITY_PUBLIC
      sound: 'default',
      vibration: true,
      lights: true,
      lightColor: '#4F46E5'
    });

    // Listener para quando o usuário tocar na notificação
    LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
      console.log('👆 Usuário tocou na notificação:', notification);
      
      // Toca um som quando a notificação é acionada
      playNotificationSound();
      
      // Aqui você pode adicionar lógica para abrir uma tela específica
      // ou executar alguma ação quando o usuário tocar na notificação
    });

    console.log('✅ Sistema de notificações em segundo plano inicializado!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao inicializar sistema de segundo plano:', error);
    return false;
  }
};
