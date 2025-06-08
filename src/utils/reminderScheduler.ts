import {
  scheduleReminderForToday,
  isNativePlatform,
  cancelLocalNotification
} from '@/utils/localNotifications';
import { createSystemAlarm } from '@/utils/alarmIntegration';
import { toast } from '@/hooks/use-toast';
import { Reminder } from '@/types/reminder';

export const scheduleReminder = async (reminder: Reminder): Promise<Reminder> => {
  console.log('➕ Agendando lembrete:', reminder);
  
  let updatedReminder = { ...reminder };
  
  // Cria alarme do sistema se solicitado
  if (reminder.createSystemAlarm && reminder.isActive) {
    console.log('⏰ Criando alarme do sistema...');
    
    const alarmCreated = await createSystemAlarm(
      reminder.title,
      reminder.time,
      reminder.description
    );
    
    if (alarmCreated) {
      toast({
        title: "⏰ Alarme criado!",
        description: `Alarme configurado no sistema para "${reminder.title}" às ${reminder.time}`,
      });
    }
  }
  
  // Se estiver no app nativo e o lembrete está ativo, agenda notificação local
  if (isNativePlatform() && reminder.isActive) {
    console.log('📱 Agendando notificação local...');
    
    // Gera um ID único para a notificação local
    const localNotificationId = Date.now() + Math.floor(Math.random() * 1000);
    
    const success = await scheduleReminderForToday(
      reminder.title,
      reminder.description || 'É hora do seu foco! Mantenha a concentração! 🚀',
      reminder.time,
      {
        reminderType: reminder.type,
        reminderId: reminder.id,
        scheduledAt: new Date().toISOString()
      },
      localNotificationId
    );
    
    if (success) {
      // Retorna o lembrete com o ID da notificação local
      updatedReminder = {
        ...reminder,
        localNotificationId
      };
      
      if (!reminder.createSystemAlarm) {
        toast({
          title: "✅ Lembrete criado!",
          description: `"${reminder.title}" será notificado às ${reminder.time}! 🔔`,
        });
      }
    } else {
      if (!reminder.createSystemAlarm) {
        toast({
          title: "⚠️ Lembrete criado",
          description: `"${reminder.title}" salvo, mas notificação pode não funcionar`,
          variant: "destructive"
        });
      }
    }
  } else {
    // Para web ou lembretes inativos
    if (!reminder.createSystemAlarm && reminder.isActive) {
      toast({
        title: "✅ Lembrete criado!",
        description: `"${reminder.title}" configurado para ${reminder.time} (verificação manual)`,
      });
    }
  }
  
  return updatedReminder;
};

export const rescheduleReminder = async (reminder: Reminder, updates: Partial<Reminder>) => {
  console.log(`🔄 Reagendando lembrete ${reminder.id}:`, updates);
  
  // Para apps nativos, reagenda a notificação local se necessário
  if (isNativePlatform()) {
    // Cancela notificação anterior se existir
    if (reminder.localNotificationId) {
      console.log(`🗑️ Cancelando notificação anterior ${reminder.localNotificationId}`);
      await cancelLocalNotification(reminder.localNotificationId);
    }
    
    // Se ainda está ativo, reagenda
    const updatedReminder = { ...reminder, ...updates } as Reminder;
    if (updatedReminder.isActive) {
      console.log('📱 Reagendando notificação local...');
      
      const newLocalNotificationId = Date.now() + Math.floor(Math.random() * 1000);
      
      const success = await scheduleReminderForToday(
        updatedReminder.title,
        updatedReminder.description || 'É hora do seu foco! Mantenha a concentração! 🚀',
        updatedReminder.time,
        {
          reminderType: updatedReminder.type,
          reminderId: updatedReminder.id,
          rescheduledAt: new Date().toISOString()
        },
        newLocalNotificationId
      );
      
      if (success) {
        // Atualiza o ID da notificação local
        updates.localNotificationId = newLocalNotificationId;
        console.log(`✅ Lembrete reagendado com novo ID: ${newLocalNotificationId}`);
      }
    }
  }
};

export const cancelReminder = async (reminder: Reminder) => {
  console.log(`🗑️ Cancelando lembrete ${reminder.id}`);
  
  // Cancela notificação local se existir
  if (isNativePlatform() && reminder.localNotificationId) {
    await cancelLocalNotification(reminder.localNotificationId);
    console.log(`✅ Notificação local ${reminder.localNotificationId} cancelada`);
  }
};