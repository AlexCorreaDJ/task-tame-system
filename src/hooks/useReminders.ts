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

  // Função para mostrar notificação estilo Duolingo
  const showNotification = (reminder: Reminder) => {
    console.log('🔔 Mostrando notificação estilo Duolingo para:', reminder.title);
    
    if ('Notification' in window && Notification.permission === 'granted') {
      console.log('✅ Criando notificação nativa estilo Duolingo...');
      
      // Vibração para chamar atenção (como o Duolingo)
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100, 50, 200]); // Padrão de vibração
        console.log('📳 Vibração ativada');
      }

      // Cria a notificação com configurações estilo Duolingo
      const notification = new Notification(reminder.title, {
        body: reminder.description || 'É hora do seu foco! 🎯',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `tdahfocus-${reminder.id}`, // Tag única para evitar duplicatas
        
        // Configurações estilo Duolingo
        silent: false, // COM som
        requireInteraction: true, // Usuário precisa interagir
        
        // Dados extras para a notificação
        data: {
          reminderType: reminder.type,
          reminderId: reminder.id,
          timestamp: Date.now()
        }
      });

      // Eventos da notificação (como o Duolingo)
      notification.onshow = () => {
        console.log('🎉 Notificação mostrada com sucesso!');
        
        // Som personalizado adicional (se suportado)
        if ('AudioContext' in window) {
          try {
            const audioContext = new AudioContext();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800; // Frequência agradável
            gainNode.gain.value = 0.1; // Volume baixo
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.2); // 200ms
          } catch (error) {
            console.log('Som personalizado não disponível');
          }
        }
      };

      notification.onclick = () => {
        console.log('👆 Usuário clicou na notificação');
        // Foca na janela/app quando clicar
        if (window.focus) {
          window.focus();
        }
        notification.close();
      };

      notification.onerror = (error) => {
        console.error('❌ Erro na notificação:', error);
      };

      // Auto-fechar após 30 segundos (como o Duolingo)
      setTimeout(() => {
        notification.close();
        console.log('⏰ Notificação fechada automaticamente após 30s');
      }, 30000);
      
    } else {
      console.log('❌ Notificações não permitidas, mostrando toast...');
      // Fallback para toast se notificações não estiverem disponíveis
      toast({
        title: `🔔 ${reminder.title}`,
        description: reminder.description || 'É hora do seu foco! 🎯',
      });
    }
  };

  // Função para verificar lembretes - roda a cada minuto
  const checkReminders = () => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    console.log('🕐 Verificando lembretes para:', currentTime);
    
    reminders.forEach(reminder => {
      if (reminder.isActive && reminder.time === currentTime) {
        console.log('🎯 Lembrete encontrado:', reminder.title, 'para', currentTime);
        showNotification(reminder);
      }
    });
  };

  // Inicia o sistema de verificação de lembretes
  const startReminderSystem = () => {
    console.log('🚀 Iniciando sistema de lembretes estilo Duolingo...');
    
    // Verifica imediatamente
    checkReminders();
    
    // Verifica a cada minuto
    const interval = setInterval(checkReminders, 60000);
    
    return () => {
      console.log('⏹️ Parando sistema de lembretes...');
      clearInterval(interval);
    };
  };

  // Função para solicitar permissão de notificação (estilo Duolingo)
  const requestNotificationPermission = async () => {
    console.log('🔔 Solicitando permissão de notificação estilo Duolingo...');
    
    if (!('Notification' in window)) {
      console.log('❌ Notification API não disponível');
      return false;
    }

    if (Notification.permission === 'granted') {
      console.log('✅ Permissão já concedida');
      
      // Testa com uma notificação estilo Duolingo
      setTimeout(() => {
        const testNotification = new Notification('🎉 TDAHFOCUS', {
          body: 'Notificações ativadas! Agora você receberá lembretes motivacionais como este. 🚀',
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'tdahfocus-welcome',
          silent: false,
          requireInteraction: true,
          data: { type: 'welcome' }
        });
        
        // Vibração de boas-vindas
        if ('vibrate' in navigator) {
          navigator.vibrate([200, 100, 200]);
        }
        
        setTimeout(() => {
          testNotification.close();
        }, 5000);
      }, 500);
      
      return true;
    }

    if (Notification.permission === 'denied') {
      console.log('❌ Permissão negada pelo usuário');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      console.log('📋 Resultado da permissão:', permission);
      
      if (permission === 'granted') {
        // Notificação de boas-vindas estilo Duolingo
        setTimeout(() => {
          const welcomeNotification = new Notification('🎉 Bem-vindo ao TDAHFOCUS!', {
            body: 'Agora você receberá lembretes motivacionais para manter seu foco! 🎯✨',
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'tdahfocus-welcome',
            silent: false,
            requireInteraction: true,
            data: { type: 'welcome' }
          });
          
          // Vibração de comemoração
          if ('vibrate' in navigator) {
            navigator.vibrate([100, 50, 100, 50, 200, 100, 300]);
          }
          
          setTimeout(() => {
            welcomeNotification.close();
          }, 6000);
        }, 1000);
        
        return true;
      }
    } catch (error) {
      console.error('❌ Erro ao solicitar permissão:', error);
    }
    
    return false;
  };

  const addReminder = (reminderData: Omit<Reminder, 'id' | 'createdAt'>) => {
    const newReminder: Reminder = {
      ...reminderData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    console.log('➕ Adicionando novo lembrete:', newReminder);
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
      console.log('🔄 Lembrete', reminder.isActive ? 'desativado' : 'ativado', ':', reminder.title);
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
