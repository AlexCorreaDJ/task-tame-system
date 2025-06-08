import {
  requestLocalNotificationPermission,
  testLocalNotification,
  initializeLocalNotifications,
  isNativePlatform,
  showLocalNotification,
} from '@/utils/localNotifications';
import { playNotificationSound, initializeAudio } from '@/utils/audioNotifications';
import { toast } from '@/hooks/use-toast';
import { Reminder } from '@/types/reminder';

// Função para mostrar notificação
export const showNotification = (reminder: Reminder): void => {
  console.log('🔔 Mostrando notificação motivacional:', reminder.title);

  playNotificationSound();

  if (!isNativePlatform()) {
    // Ambiente Web: mostrar toast simples
    toast({
      title: `🔔 ${reminder.title}`,
      description: reminder.description || 'É hora do seu foco! 🎯',
    });
    return;
  }

  // App nativo: disparar notificação local
  showLocalNotification({
    id: Date.now(),
    title: reminder.title,
    body: reminder.description || 'É hora do seu foco! 🎯',
  }).catch(error => {
    console.error('Erro ao mostrar notificação local:', error);
  });

  console.log('📱 App nativo: notificação exibida pelo sistema');
};

// Verifica lembretes (somente para Web)
export const checkReminders = (reminders: Reminder[]): void => {
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
export const requestNotificationPermission = async (): Promise<boolean> => {
  console.log('🔔 Solicitando permissão de notificação...');
  initializeAudio();

  try {
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
  } catch (error) {
    console.error('Erro ao solicitar permissão de notificação:', error);
    return false;
  }
};

// Testa notificação local (apenas no app)
export const testBalloonNotification = async (): Promise<boolean> => {
  console.log('🧪 Testando notificação local...');

  if (!isNativePlatform()) {
    toast({
      title: "⚠️ Apenas no app nativo",
      description: "Notificações locais só funcionam no app Android/iOS instalado",
      variant: "destructive",
    });
    return false;
  }

  return await testLocalNotification();
};

// Inicia o sistema de lembretes
export const startReminderSystem = async (reminders: Reminder[]): Promise<() => void> => {
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

  // Web: Verificação manual a cada minuto
  console.log('🌐 App web: usando verificação manual a cada minuto');
  checkReminders(reminders);
  const interval = setInterval(() => checkReminders(reminders), 60000);

  return () => {
    console.log('⏹️ Parando sistema de lembretes...');
    clearInterval(interval);
  };
};
