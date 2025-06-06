
import { 
  requestAndroidNotificationPermission, 
  showAndroidNotification, 
  isNativeAndroidApp,
  isWebAndroidApp
} from '@/utils/androidNotifications';
import { playNotificationSound, initializeAudio } from '@/utils/audioNotifications';
import {
  requestLocalNotificationPermission,
  testLocalNotification,
  initializeLocalNotifications,
  isNativePlatform
} from '@/utils/localNotifications';
import { toast } from '@/hooks/use-toast';
import { Reminder } from '@/types/reminder';

// Função para mostrar notificação (fallback para web)
export const showNotification = (reminder: Reminder) => {
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
export const checkReminders = (reminders: Reminder[]) => {
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

// Função para solicitar permissão
export const requestNotificationPermission = async () => {
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

// Função para testar notificação local
export const testBalloonNotification = async () => {
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

// Inicia o sistema de verificação de lembretes
export const startReminderSystem = async (reminders: Reminder[]) => {
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
  checkReminders(reminders);
  
  // Verifica a cada minuto
  const interval = setInterval(() => checkReminders(reminders), 60000);
  
  return () => {
    console.log('⏹️ Parando sistema de lembretes...');
    clearInterval(interval);
  };
};
