
import { useLocalStorage } from './useLocalStorage';
import { toast } from '@/hooks/use-toast';
import { 
  requestAndroidNotificationPermission, 
  showAndroidNotification, 
  checkAndroidNotificationPermission,
  isNativeAndroidApp,
  isWebAndroidApp
} from '@/utils/androidNotifications';
import { playNotificationSound, initializeAudio } from '@/utils/audioNotifications';
import {
  requestLocalNotificationPermission,
  scheduleReminderForToday,
  testLocalNotification,
  initializeLocalNotifications,
  isNativePlatform,
  cancelLocalNotification,
  getPendingLocalNotifications
} from '@/utils/localNotifications';

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  time: string; // HH:MM format
  type: 'task' | 'reading' | 'project' | 'break' | 'custom';
  relatedId?: string; // ID da tarefa/livro/projeto relacionado
  isActive: boolean;
  useBalloonStyle?: boolean; // Nova propriedade para estilo de balão
  createdAt: string;
  localNotificationId?: number; // ID da notificação local agendada
}

export const useReminders = () => {
  const [reminders, setReminders] = useLocalStorage<Reminder[]>('focusflow-reminders', []);

  // Função para mostrar notificação (fallback para web)
  const showNotification = (reminder: Reminder) => {
    console.log('🔔 Mostrando notificação motivacional:', reminder.title);
    
    // Reproduz o som de notificação
    playNotificationSound();
    
    // Para apps nativos, as notificações locais já cuidam disso
    if (isNativePlatform()) {
      console.log('📱 App nativo: notificação será exibida pelo sistema');
      return;
    }
    
    // Fallback para web
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

  // Função para verificar lembretes - apenas para web
  const checkReminders = () => {
    // Para apps nativos, as notificações locais são gerenciadas pelo sistema
    if (isNativePlatform()) {
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
    
    // Se estiver no app nativo, usa notificações locais
    if (isNativePlatform()) {
      console.log('📱 App nativo: configurando notificações locais...');
      
      const initialized = await initializeLocalNotifications();
      
      if (initialized) {
        toast({
          title: "🎉 Sistema ativado!",
          description: "Notificações locais configuradas! 📱🔔",
        });
      }
      
      return () => {
        console.log('⏹️ Sistema de notificações locais não precisa ser parado');
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

  // Função para testar notificação local
  const testBalloonNotification = async () => {
    console.log('🧪 Testando notificação local...');
    
    if (!isNativePlatform()) {
      toast({
        title: "⚠️ Apenas no app nativo",
        description: "Notificações locais só funcionam no app Android/iOS instalado",
        variant: "destructive"
      });
      return false;
    }
    
    const success = await testLocalNotification();
    return success;
  };

  // Função para solicitar permissão
  const requestNotificationPermission = async () => {
    console.log('🔔 Solicitando permissão de notificação...');
    
    // Inicializa o áudio (precisa de interação do usuário)
    initializeAudio();
    
    let granted = false;
    
    // Para apps nativos, usa notificações locais
    if (isNativePlatform()) {
      granted = await requestLocalNotificationPermission();
    } else {
      // Para web, usa o método tradicional
      granted = await requestAndroidNotificationPermission();
    }
    
    if (granted && !isNativePlatform()) {
      // Notificação de teste apenas para web
      setTimeout(() => {
        playNotificationSound();
        
        const success = showAndroidNotification(
          '🎉 TDAHFOCUS - Notificações Ativas!',
          'Agora você receberá lembretes motivacionais! 📱🎯✨',
          { type: 'welcome' }
        );
        
        if (!success) {
          toast({
            title: "🎉 Notificações ativadas!",
            description: "Sistema de lembretes configurado com sucesso!",
          });
        }
      }, 1000);
    }
    
    return granted;
  };

  const addReminder = async (reminderData: Omit<Reminder, 'id' | 'createdAt'>) => {
    const newReminder: Reminder = {
      ...reminderData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    console.log('➕ Adicionando novo lembrete:', newReminder);
    
    // Se estiver no app nativo e o lembrete está ativo, agenda notificação local
    if (isNativePlatform() && newReminder.isActive) {
      console.log('📱 Agendando notificação local...');
      
      const success = await scheduleReminderForToday(
        newReminder.title,
        newReminder.description || 'É hora do seu foco! 🚀',
        newReminder.time,
        {
          reminderType: newReminder.type,
          reminderId: newReminder.id
        }
      );
      
      if (success) {
        // Armazena o ID da notificação local (simplificado - usar timestamp)
        newReminder.localNotificationId = Date.now();
        
        toast({
          title: "✅ Lembrete criado!",
          description: `"${newReminder.title}" aparecerá às ${newReminder.time}! 🔔`,
        });
      } else {
        toast({
          title: "⚠️ Lembrete criado",
          description: `"${newReminder.title}" salvo, mas notificação pode não funcionar`,
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "✅ Lembrete criado!",
        description: `"${newReminder.title}" configurado para ${newReminder.time}`,
      });
    }
    
    setReminders(prev => [...prev, newReminder]);
    return newReminder;
  };

  const updateReminder = async (id: string, updates: Partial<Reminder>) => {
    setReminders(prev => prev.map(reminder => 
      reminder.id === id ? { ...reminder, ...updates } : reminder
    ));
    
    // Para apps nativos, reagenda a notificação local se necessário
    if (isNativePlatform()) {
      const reminder = reminders.find(r => r.id === id);
      if (reminder?.localNotificationId) {
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

  const deleteReminder = async (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    
    // Cancela notificação local se existir
    if (isNativePlatform() && reminder?.localNotificationId) {
      await cancelLocalNotification(reminder.localNotificationId);
    }
    
    setReminders(prev => prev.filter(reminder => reminder.id !== id));
  };

  const toggleReminder = async (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
      await updateReminder(id, { isActive: !reminder.isActive });
      console.log('🔄 Lembrete', reminder.isActive ? 'desativado' : 'ativado', ':', reminder.title);
    }
  };

  // Função placeholder para compatibilidade
  const toggleBalloonStyle = async (id: string) => {
    // Para notificações locais, todas já são exibidas como balão no Android
    toast({
      title: "ℹ️ Notificações locais",
      description: "Todas as notificações locais já são exibidas como balão no Android",
    });
  };

  return {
    reminders,
    addReminder,
    updateReminder,
    deleteReminder,
    toggleReminder,
    toggleBalloonStyle,
    testBalloonNotification,
    requestNotificationPermission,
    startReminderSystem
  };
};
