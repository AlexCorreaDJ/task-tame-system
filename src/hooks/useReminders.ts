
import { useLocalStorage } from './useLocalStorage';
import { toast } from '@/hooks/use-toast';
import { 
  requestAndroidNotificationPermission, 
  showAndroidNotification, 
  checkAndroidNotificationPermission,
  isNativeAndroidApp,
  isWebAndroidApp
} from '@/utils/androidNotifications';
import {
  scheduleBackgroundReminder,
  cancelBackgroundReminder,
  scheduleAllActiveReminders,
  initializeBackgroundNotifications
} from '@/utils/backgroundNotifications';
import { playNotificationSound, initializeAudio } from '@/utils/audioNotifications';

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

  // Função para mostrar notificação otimizada para Android nativo
  const showNotification = (reminder: Reminder) => {
    console.log('🔔 Mostrando notificação motivacional:', reminder.title);
    
    // Reproduz o som de notificação
    playNotificationSound();
    
    const success = showAndroidNotification(
      `🎯 ${reminder.title}`,
      reminder.description || 'É hora do seu foco! Mantenha a concentração! 🚀',
      {
        reminderType: reminder.type,
        reminderId: reminder.id,
        timestamp: Date.now()
      }
    );
    
    if (!success) {
      console.log('❌ Notificação não pôde ser exibida, mostrando toast...');
      toast({
        title: `🔔 ${reminder.title}`,
        description: reminder.description || 'É hora do seu foco! 🎯',
      });
    }
  };

  // Função para verificar lembretes - roda a cada minuto (backup para web)
  const checkReminders = () => {
    // Para apps nativos, as notificações são agendadas em segundo plano
    if (isNativeAndroidApp()) {
      console.log('📱 App nativo: notificações gerenciadas pelo sistema');
      return;
    }

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
  const startReminderSystem = async () => {
    console.log('🚀 Iniciando sistema de lembretes motivacionais...');
    
    // Inicializa o sistema de áudio (requer interação do usuário)
    initializeAudio();
    
    // Para apps nativos Android - usa notificações agendadas
    if (isNativeAndroidApp()) {
      console.log('📱 App nativo Android: inicializando sistema de segundo plano...');
      
      const initialized = await initializeBackgroundNotifications();
      if (initialized) {
        // Agenda todos os lembretes ativos
        await scheduleAllActiveReminders(reminders);
        
        toast({
          title: "🎉 Sistema ativado!",
          description: "Lembretes configurados para funcionar em segundo plano! 📱🔔",
        });
      }
      
      return () => {
        console.log('⏹️ Sistema de segundo plano não precisa ser parado');
      };
    }
    
    // Para web/PWA - usa verificação manual
    console.log('🌐 App web: usando verificação manual a cada minuto');
    
    // Log da plataforma detectada
    if (isWebAndroidApp()) {
      console.log('🌐 Plataforma: App web Android (PWA/WebView)');
    } else {
      console.log('💻 Plataforma: Web/Desktop');
    }
    
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
    console.log('🔔 Solicitando permissão de notificação...');
    
    // Inicializa o áudio (precisa de interação do usuário)
    initializeAudio();
    
    const granted = await requestAndroidNotificationPermission();
    
    if (granted) {
      console.log('✅ Permissão concedida com sucesso');
      
      // Para apps nativos, inicializa o sistema de segundo plano
      if (isNativeAndroidApp()) {
        const initialized = await initializeBackgroundNotifications();
        if (initialized) {
          await scheduleAllActiveReminders(reminders);
        }
      }
      
      // Notificação de teste para confirmar funcionamento
      setTimeout(() => {
        // Toca o som de notificação para teste
        playNotificationSound();
        
        const success = showAndroidNotification(
          '🎉 TDAHFOCUS - Notificações Ativas!',
          'Agora você receberá lembretes motivacionais na barra de notificações do Android! 📱🎯✨',
          { type: 'welcome' }
        );
        
        if (!success) {
          toast({
            title: "🎉 Notificações ativadas!",
            description: "Sistema de lembretes configurado com sucesso!",
          });
        }
      }, 1000);
    } else {
      console.log('❌ Permissão negada ou erro');
    }
    
    return granted;
  };

  const addReminder = async (reminderData: Omit<Reminder, 'id' | 'createdAt'>) => {
    const newReminder: Reminder = {
      ...reminderData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    console.log('➕ Adicionando novo lembrete:', newReminder);
    setReminders(prev => [...prev, newReminder]);
    
    // Para apps nativos, agenda a notificação imediatamente
    if (isNativeAndroidApp() && newReminder.isActive) {
      await scheduleBackgroundReminder(newReminder);
    }
    
    return newReminder;
  };

  const updateReminder = async (id: string, updates: Partial<Reminder>) => {
    setReminders(prev => prev.map(reminder => 
      reminder.id === id ? { ...reminder, ...updates } : reminder
    ));
    
    // Para apps nativos, reagenda a notificação
    if (isNativeAndroidApp()) {
      await cancelBackgroundReminder(id);
      const updatedReminder = reminders.find(r => r.id === id);
      if (updatedReminder && updates.isActive !== false) {
        await scheduleBackgroundReminder({ ...updatedReminder, ...updates } as Reminder);
      }
    }
  };

  const deleteReminder = async (id: string) => {
    setReminders(prev => prev.filter(reminder => reminder.id !== id));
    
    // Para apps nativos, cancela a notificação agendada
    if (isNativeAndroidApp()) {
      await cancelBackgroundReminder(id);
    }
  };

  const toggleReminder = async (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
      await updateReminder(id, { isActive: !reminder.isActive });
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
