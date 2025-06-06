
import {
  scheduleReminderForToday,
  isNativePlatform,
  cancelLocalNotification
} from '@/utils/localNotifications';
import { toast } from '@/hooks/use-toast';
import { Reminder } from '@/types/reminder';

export const scheduleReminder = async (reminder: Reminder): Promise<Reminder> => {
  console.log('➕ Agendando lembrete:', reminder);
  
  // Se estiver no app nativo e o lembrete está ativo, agenda notificação local
  if (isNativePlatform() && reminder.isActive) {
    console.log('📱 Agendando notificação local...');
    
    const success = await scheduleReminderForToday(
      reminder.title,
      reminder.description || 'É hora do seu foco! 🚀',
      reminder.time,
      {
        reminderType: reminder.type,
        reminderId: reminder.id
      }
    );
    
    if (success) {
      // Armazena o ID da notificação local (simplificado - usar timestamp)
      const updatedReminder = {
        ...reminder,
        localNotificationId: Date.now()
      };
      
      toast({
        title: "✅ Lembrete criado!",
        description: `"${reminder.title}" aparecerá às ${reminder.time}! 🔔`,
      });
      
      return updatedReminder;
    } else {
      toast({
        title: "⚠️ Lembrete criado",
        description: `"${reminder.title}" salvo, mas notificação pode não funcionar`,
        variant: "destructive"
      });
    }
  } else {
    toast({
      title: "✅ Lembrete criado!",
      description: `"${reminder.title}" configurado para ${reminder.time}`,
    });
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
        await scheduleReminderForToday(
          updatedReminder.title,
          updatedReminder.description || 'É hora do seu foco! 🚀',
          updatedReminder.time,
          {
            reminderType: updatedReminder.type,
            reminderId: updatedReminder.id
          }
        );
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
