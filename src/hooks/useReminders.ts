
import { useLocalStorage } from './useLocalStorage';
import { toast } from '@/hooks/use-toast';

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  time: string; // HH:MM format
  type: 'task' | 'reading' | 'project' | 'break' | 'custom';
  relatedId?: string; // ID da tarefa/livro/projeto relacionado
  isActive: boolean;
  createdAt: string;
}

export const useReminders = () => {
  const [reminders, setReminders] = useLocalStorage<Reminder[]>('focusflow-reminders', []);

  // Função para mostrar notificação nativa com som
  const showNotification = (reminder: Reminder) => {
    console.log('Tentando mostrar notificação para:', reminder.title);
    
    if ('Notification' in window && Notification.permission === 'granted') {
      console.log('Criando notificação nativa...');
      
      // Cria a notificação nativa com som
      const notification = new Notification(reminder.title, {
        body: reminder.description || 'Hora do seu lembrete!',
        icon: '/favicon.ico',
        tag: reminder.id,
        badge: '/favicon.ico',
        // Garante que a notificação faça som
        silent: false,
        requireInteraction: true // Mantém a notificação até o usuário interagir
      });

      // Log quando a notificação é mostrada
      notification.onshow = () => {
        console.log('Notificação mostrada com sucesso!');
      };

      // Log se houver erro
      notification.onerror = (error) => {
        console.error('Erro na notificação:', error);
      };

      // Auto-fechar após 10 segundos se o usuário não interagir
      setTimeout(() => {
        notification.close();
      }, 10000);
      
    } else {
      console.log('Notificações não permitidas, mostrando toast...');
      // Fallback para toast se notificações não estiverem disponíveis
      toast({
        title: reminder.title,
        description: reminder.description || 'Hora do seu lembrete!',
      });
    }
  };

  // Função para verificar lembretes - roda a cada minuto
  const checkReminders = () => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    console.log('Verificando lembretes para:', currentTime);
    
    reminders.forEach(reminder => {
      if (reminder.isActive && reminder.time === currentTime) {
        console.log('Lembrete encontrado:', reminder.title, 'para', currentTime);
        showNotification(reminder);
      }
    });
  };

  // Inicia o sistema de verificação de lembretes
  const startReminderSystem = () => {
    console.log('Iniciando sistema de lembretes...');
    
    // Verifica imediatamente
    checkReminders();
    
    // Verifica a cada minuto
    const interval = setInterval(checkReminders, 60000);
    
    return () => {
      console.log('Parando sistema de lembretes...');
      clearInterval(interval);
    };
  };

  // Função para solicitar permissão de notificação
  const requestNotificationPermission = async () => {
    console.log('Solicitando permissão de notificação...');
    
    if (!('Notification' in window)) {
      console.log('Notification API não disponível');
      return false;
    }

    if (Notification.permission === 'granted') {
      console.log('Permissão já concedida');
      return true;
    }

    if (Notification.permission === 'denied') {
      console.log('Permissão negada pelo usuário');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      console.log('Resultado da permissão:', permission);
      
      if (permission === 'granted') {
        // Testa com uma notificação imediata
        setTimeout(() => {
          const testNotification = new Notification('TDAHFOCUS', {
            body: 'Notificações ativadas! Você receberá lembretes com som.',
            icon: '/favicon.ico',
            silent: false
          });
          
          setTimeout(() => {
            testNotification.close();
          }, 3000);
        }, 500);
        
        return true;
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
    }
    
    return false;
  };

  const addReminder = (reminderData: Omit<Reminder, 'id' | 'createdAt'>) => {
    const newReminder: Reminder = {
      ...reminderData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    console.log('Adicionando novo lembrete:', newReminder);
    setReminders(prev => [...prev, newReminder]);
    return newReminder;
  };

  const updateReminder = (id: string, updates: Partial<Reminder>) => {
    setReminders(prev => prev.map(reminder => 
      reminder.id === id ? { ...reminder, ...updates } : reminder
    ));
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(reminder => reminder.id !== id));
  };

  const toggleReminder = (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
      updateReminder(id, { isActive: !reminder.isActive });
      console.log('Lembrete', reminder.isActive ? 'desativado' : 'ativado', ':', reminder.title);
    }
  };

  return {
    reminders,
    addReminder,
    updateReminder,
    deleteReminder,
    toggleReminder,
    requestNotificationPermission,
    startReminderSystem
  };
};
