
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

  // Detecta se é Android
  const isAndroidApp = () => {
    const userAgent = navigator.userAgent;
    const isAndroid = /Android/i.test(userAgent);
    const isCapacitor = !!(window as any).Capacitor;
    const isWebView = /wv|WebView/i.test(userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    return isAndroid && (isCapacitor || isWebView || isStandalone);
  };

  // Função para mostrar notificação otimizada para Android
  const showNotification = (reminder: Reminder) => {
    console.log('🔔 Mostrando notificação motivacional para Android:', reminder.title);
    
    if ('Notification' in window && Notification.permission === 'granted') {
      console.log('✅ Criando notificação nativa para Android...');
      
      const isApp = isAndroidApp();
      
      // Vibração para chamar atenção (especialmente importante no Android)
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 300]); // Padrão mais forte para Android
        console.log('📳 Vibração ativada no Android');
      }

      // Cria a notificação otimizada para Android
      const notification = new Notification(reminder.title, {
        body: reminder.description || 'É hora do seu foco! 🎯',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `tdahfocus-${reminder.id}`, // Tag única para evitar duplicatas
        
        // Configurações otimizadas para Android
        silent: false, // COM som (importante para Android)
        requireInteraction: true, // Usuário precisa interagir (Android)
        
        // Dados extras para a notificação
        data: {
          reminderType: reminder.type,
          reminderId: reminder.id,
          timestamp: Date.now(),
          isAndroid: isApp
        }
      });

      // Eventos da notificação otimizados para Android
      notification.onshow = () => {
        console.log('🎉 Notificação mostrada com sucesso no Android!');
        
        // Som personalizado adicional para Android (se suportado)
        if ('AudioContext' in window) {
          try {
            const audioContext = new AudioContext();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800; // Frequência agradável
            gainNode.gain.value = 0.15; // Volume um pouco mais alto para Android
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.3); // 300ms
          } catch (error) {
            console.log('Som personalizado não disponível no Android');
          }
        }
      };

      notification.onclick = () => {
        console.log('👆 Usuário clicou na notificação no Android');
        // Foca na janela/app quando clicar (importante para Android)
        if (window.focus) {
          window.focus();
        }
        notification.close();
      };

      notification.onerror = (error) => {
        console.error('❌ Erro na notificação Android:', error);
      };

      // Auto-fechar após 45 segundos para Android (mais tempo que no navegador)
      setTimeout(() => {
        notification.close();
        console.log('⏰ Notificação fechada automaticamente após 45s');
      }, 45000);
      
    } else {
      console.log('❌ Notificações não permitidas no Android, mostrando toast...');
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
    console.log('🚀 Iniciando sistema de lembretes motivacionais para Android...');
    
    // Verifica imediatamente
    checkReminders();
    
    // Verifica a cada minuto
    const interval = setInterval(checkReminders, 60000);
    
    return () => {
      console.log('⏹️ Parando sistema de lembretes...');
      clearInterval(interval);
    };
  };

  // Função para solicitar permissão otimizada para Android
  const requestNotificationPermission = async () => {
    console.log('🔔 Solicitando permissão de notificação otimizada para Android...');
    
    if (!('Notification' in window)) {
      console.log('❌ Notification API não disponível');
      return false;
    }

    const isApp = isAndroidApp();
    console.log('📱 É app Android:', isApp);

    if (Notification.permission === 'granted') {
      console.log('✅ Permissão já concedida');
      
      // Testa com uma notificação otimizada para Android
      setTimeout(() => {
        const testNotification = new Notification('🎉 TDAHFOCUS - Android', {
          body: 'Notificações ativadas no Android! Agora você receberá lembretes na barra de notificações. 📱🔔',
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'tdahfocus-android-welcome',
          silent: false,
          requireInteraction: true,
          data: { type: 'android-welcome' }
        });
        
        // Vibração especial para Android
        if ('vibrate' in navigator) {
          navigator.vibrate([100, 50, 100, 50, 200, 100, 300]);
        }
        
        setTimeout(() => {
          testNotification.close();
        }, 6000);
      }, 500);
      
      return true;
    }

    if (Notification.permission === 'denied') {
      console.log('❌ Permissão negada pelo usuário no Android');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      console.log('📋 Resultado da permissão no Android:', permission);
      
      if (permission === 'granted') {
        // Notificação de boas-vindas específica para Android
        setTimeout(() => {
          const welcomeNotification = new Notification('🎉 Bem-vindo ao TDAHFOCUS no Android!', {
            body: 'Agora você receberá lembretes motivacionais na barra de notificações do Android! 📱🎯✨',
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'tdahfocus-android-setup',
            silent: false,
            requireInteraction: true,
            data: { type: 'android-setup' }
          });
          
          // Vibração de comemoração para Android
          if ('vibrate' in navigator) {
            navigator.vibrate([100, 50, 100, 50, 200, 100, 300, 100, 400]);
          }
          
          setTimeout(() => {
            welcomeNotification.close();
          }, 8000);
        }, 1000);
        
        return true;
      }
    } catch (error) {
      console.error('❌ Erro ao solicitar permissão no Android:', error);
    }
    
    return false;
  };

  // Função para adicionar um novo lembrete
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

  // Função para atualizar um lembrete existente
  const updateReminder = (id: string, updates: Partial<Reminder>) => {
    setReminders(prev => prev.map(reminder => 
      reminder.id === id ? { ...reminder, ...updates } : reminder
    ));
  };

  // Função para deletar um lembrete
  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(reminder => reminder.id !== id));
  };

  // Função para alternar o status de um lembrete
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
