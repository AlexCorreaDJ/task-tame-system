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
import {
  initializeFirebaseMessaging,
  showBalloonStyleNotification,
  isNativeAndroid,
  sendTestBalloonNotification
} from '@/utils/firebaseNotifications';

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  time: string; // HH:MM format
  type: 'task' | 'reading' | 'project' | 'break' | 'custom';
  relatedId?: string; // ID da tarefa/livro/projeto relacionado
  isActive: boolean;
  createdAt: string;
  useBalloonStyle?: boolean; // Nova propriedade para controlar estilo da notificação
}

export const useReminders = () => {
  const [reminders, setReminders] = useLocalStorage<Reminder[]>('focusflow-reminders', []);

  // Função para mostrar notificação otimizada para Android nativo
  const showNotification = (reminder: Reminder) => {
    console.log('🔔 Mostrando notificação motivacional:', reminder.title);
    
    // Reproduz o som de notificação
    playNotificationSound();
    
    // Se o usuário prefere notificações em estilo balão e estamos no Android nativo
    if (reminder.useBalloonStyle && isNativeAndroid()) {
      console.log('🎈 Usando estilo balão para notificação');
      showBalloonStyleNotification(
        `🎯 ${reminder.title}`,
        reminder.description || 'É hora do seu foco! Mantenha a concentração! 🚀',
        {
          reminderType: reminder.type,
          reminderId: reminder.id,
          timestamp: Date.now()
        }
      );
      return;
    }
    
    // Caso contrário, usa o método padrão de notificação
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
    
    // Se estiver no Android nativo, tenta inicializar Firebase primeiro
    if (isNativeAndroid()) {
      console.log('📱 App nativo Android: tentando inicializar Firebase...');
      
      const firebaseInitialized = await initializeFirebaseMessaging();
      
      if (firebaseInitialized) {
        toast({
          title: "🎉 Firebase ativado!",
          description: "Lembretes em estilo balão configurados! 💬🔔",
        });
      }
      
      // Mesmo se o Firebase falhar, continua com o sistema de notificações locais
      console.log('📱 Configurando notificações em segundo plano como fallback...');
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

  // Função para testar notificação em formato de balão
  const testBalloonNotification = async () => {
    console.log('🎈 Testando notificação em estilo balão...');
    
    // Inicializa o Firebase se necessário
    if (isNativeAndroid() && !await initializeFirebaseMessaging()) {
      toast({
        title: "⚠️ Firebase não inicializado",
        description: "Não foi possível inicializar o Firebase para notificações em balão",
      });
      return false;
    }
    
    const success = await sendTestBalloonNotification();
    
    if (success) {
      toast({
        title: "✅ Teste enviado!",
        description: "Verifique a notificação em estilo balão",
      });
    } else {
      toast({
        title: "❌ Falha no teste",
        description: "Não foi possível enviar notificação em estilo balão",
      });
    }
    
    return success;
  };

  // Função para solicitar permissão otimizada para Android
  const requestNotificationPermission = async () => {
    console.log('🔔 Solicitando permissão de notificação...');
    
    // Inicializa o áudio (precisa de interação do usuário)
    initializeAudio();
    
    const granted = await requestAndroidNotificationPermission();
    
    if (granted) {
      console.log('✅ Permissão concedida com sucesso');
      
      // Para apps nativos, tenta inicializar Firebase primeiro
      if (isNativeAndroid()) {
        await initializeFirebaseMessaging();
        
        // Como fallback, inicializa o sistema de segundo plano com notificações locais
        const initialized = await initializeBackgroundNotifications();
        if (initialized) {
          await scheduleAllActiveReminders(reminders);
        }
      }
      
      // Notificação de teste para confirmar funcionamento
      setTimeout(() => {
        // Toca o som de notificação para teste
        playNotificationSound();
        
        // Tenta usar estilo balão para a notificação de teste se estivermos no Android nativo
        if (isNativeAndroid()) {
          showBalloonStyleNotification(
            '🎉 TDAHFOCUS - Notificações Ativas!',
            'Agora você receberá lembretes motivacionais com balões de notificações do Android! 💬🎯✨',
            { type: 'welcome' }
          );
        } else {
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

  // Função para ativar o estilo de balão para um lembrete
  const toggleBalloonStyle = async (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    
    if (reminder) {
      const newValue = !reminder.useBalloonStyle;
      await updateReminder(id, { useBalloonStyle: newValue });
      
      toast({
        title: newValue ? "🎈 Estilo balão ativado!" : "🔔 Estilo padrão ativado",
        description: newValue 
          ? "Este lembrete aparecerá como balão de conversa" 
          : "Este lembrete usará o estilo padrão de notificação",
      });
      
      console.log(`🎈 Estilo balão ${newValue ? 'ativado' : 'desativado'} para:`, reminder.title);
    }
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
