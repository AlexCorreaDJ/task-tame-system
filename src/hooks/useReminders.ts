import { useLocalStorage } from './useLocalStorage';
import { toast } from '@/hooks/use-toast';
import { 
  requestAndroidNotificationPermission, 
  showAndroidNotification, 
  checkAndroidNotificationPermission,
  isNativeAndroidApp,
  isWebAndroidApp
} from '@/utils/androidNotifications';

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

  // Função para mostrar notificação otimizada para Android
  const showNotification = (reminder: Reminder) => {
    console.log('🔔 Mostrando notificação motivacional:', reminder.title);
    
    const success = showAndroidNotification(
      reminder.title,
      reminder.description || 'É hora do seu foco! 🎯',
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
    console.log('🚀 Iniciando sistema de lembretes motivacionais...');
    
    // Log da plataforma detectada
    if (isNativeAndroidApp()) {
      console.log('📱 Plataforma: App nativo Android (Capacitor)');
    } else if (isWebAndroidApp()) {
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
    
    const granted = await requestAndroidNotificationPermission();
    
    if (granted) {
      console.log('✅ Permissão concedida com sucesso');
      
      // Notificação de teste
      setTimeout(() => {
        const success = showAndroidNotification(
          '🎉 TDAHFOCUS - Notificações Ativas!',
          'Agora você receberá lembretes motivacionais para manter seu foco! 📱🎯✨',
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
