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
    const localNotificationId = Date.now();
    
    const success = await scheduleReminderForToday(
      reminder.title,
      reminder.description || 'É hora do seu foco! 🚀',
      reminder.time,
      {
        reminderType: reminder.type,
        reminderId: reminder.id
      },
      localNotificationId
    );
    
    if (success) {
      // Retorna o lembrete com o ID da notificação local
      const updatedReminder = {
        ...reminder,
        localNotificationId
      };
      
      if (!reminder.createSystemAlarm) {
        toast({
          title: "✅ Lembrete criado!",
          description: `"${reminder.title}" aparecerá às ${reminder.time}! 🔔`,
        });
      }
      
      return updatedReminder;
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
    if (!reminder.createSystemAlarm) {
      toast({
        title: "✅ Lembrete criado!",
        description: `"${reminder.title}" configurado para ${reminder.time}`,
      });
    }
  }
  
  return reminder;
};

export const rescheduleReminder = async (reminder: Reminder, updates: Partial<Reminder>) => {
  // Para apps nativos, reagenda a notificação local se necessário
  if (isNativePlatform()) {
    if (reminder.localNotificationId) {
      await cancelLocalNotification(reminder.localNotificationId);
    }
    
    // Se ainda está ativo, reagenda
    if (updates.isActive !== false) {
      const updatedReminder = { ...reminder, ...updates } as Reminder;
      if (updatedReminder.isActive) {
        const newLocalNotificationId = Date.now();
        
        await scheduleReminderForToday(
          updatedReminder.title,
          updatedReminder.description || 'É hora do seu foco! 🚀',
          updatedReminder.time,
          {
            reminderType: updatedReminder.type,
            reminderId: updatedReminder.id
          },
          newLocalNotificationId
        );
        
        // Atualiza o ID da notificação local
        updates.localNotificationId = newLocalNotificationId;
      }
    }
  }
};

export const cancelReminder = async (reminder: Reminder) => {
  // Cancela notificação local se existir
  if (isNativePlatform() && reminder.localNotificationId) {
    await cancelLocalNotification(reminder.localNotificationId);
  }
};