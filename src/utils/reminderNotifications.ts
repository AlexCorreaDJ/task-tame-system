import {
  requestLocalNotificationPermission,
  testLocalNotification,
  initializeLocalNotifications,
  isNativePlatform
} from '@/utils/localNotifications';
import { playNotificationSound, initializeAudio } from '@/utils/audioNotifications';
import { toast } from '@/hooks/use-toast';
import { Reminder } from '@/types/reminder';

// Função para mostrar notificação
export const showNotification = (reminder: Reminder) => {
  console.log('🔔 Mostrando notificação motivacional:', reminder.title);
  
  playNotificationSound();

  if (!isNativePlatform()) {
    // Estamos em ambiente Web (PWA ou Desktop), mostrar toast simples
    toast({
      title: `🔔 ${reminder.title}`,
      description: reminder.description || 'É hora do seu foco! 🎯',
    });
    return;
  }

  // Se for app nativo, o plugin de notificação local cuidará da exibição
  console.log('📱 App nativo: notificação será exibida pelo sistema');
};

// Verifica lembretes (somente para Web)
export const checkReminders = (reminders: Reminder[]) => {
  if (isNativePlatform()) return;

  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  console.log('🕐 Verificando lembretes para:', currentTime);
  
  reminders.forEach(reminder => {
    if (reminder.isActive && reminder.time === currentTime) {
      showNotification(reminder);
    }
  });
};

// Solicita permissão para notificação
export const requestNotificationPermission = async () => {
  console.log('🔔 Solicitando permissão de notificação...');
  initializeAudio();

  let granted = false;

  if (isNativePlatform()) {
    granted = await requestLocalNotificationPermission();
  } else {
    // Web não precisa de permissão especial para toast
    granted = true;
  }

  if (granted && !isNativePlatform()) {
    toast({
      title: "🎉 Notificações ativadas!",
      description: "Você receberá lembretes via toast. Para alertas reais, use o app nativo.",
    });
  }

  return granted;
};

// Testa notificação local (apenas no app)
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

  return await testLocalNotification();
};

// Inicia o sistema de lembretes
export const startReminderSystem = async (reminders: Reminder[]) => {
  console.log('🚀 Iniciando sistema de lembretes motivacionais...');
  initializeAudio();

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

  // Web: Verificação manual
  console.log('🌐 App web: usando verificação manual a cada minuto');
  checkReminders(reminders);
  const interval = setInterval(() => checkReminders(reminders), 60000);

  return () => {
    console.log('⏹️ Parando sistema de lembretes...');
    clearInterval(interval);
  };
};
