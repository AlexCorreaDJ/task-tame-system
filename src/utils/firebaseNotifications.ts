
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { playNotificationSound } from './audioNotifications';
import { toast } from '@/hooks/use-toast';

// Track if Firebase is initialized
let firebaseInitialized = false;

// Store the device token
let fcmToken: string | null = null;

/**
 * Check if the app is running on a native Android platform
 */
export const isNativeAndroid = () => {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
};

/**
 * Initialize Firebase Cloud Messaging
 */
export const initializeFirebaseMessaging = async (): Promise<boolean> => {
  if (!isNativeAndroid()) {
    console.log('⚠️ Firebase Cloud Messaging só funciona no app nativo Android');
    return false;
  }

  if (firebaseInitialized) {
    console.log('✅ Firebase já está inicializado');
    return true;
  }

  try {
    console.log('🔥 Inicializando Firebase Cloud Messaging...');
    
    // Check if push notifications are available
    const isAvailable = await PushNotifications.checkPermissions();
    console.log('🔔 Status de permissões push:', isAvailable);
    
    if (isAvailable.receive !== 'granted') {
      console.log('⚠️ Solicitando permissões de notificação push...');
      const requestResult = await PushNotifications.requestPermissions();
      console.log('📱 Resultado da solicitação de permissão:', requestResult);
      
      if (requestResult.receive !== 'granted') {
        console.log('❌ Permissão de notificação push negada');
        toast({
          title: "⚠️ Permissão necessária",
          description: "Para receber notificações, ative as permissões nas configurações do Android",
          variant: "destructive"
        });
        return false;
      }
    }

    // Register with FCM
    console.log('📱 Registrando com Firebase Cloud Messaging...');
    await PushNotifications.register();
    
    // Listen for registration result
    PushNotifications.addListener('registration', (token) => {
      console.log(`✅ Token FCM registrado com sucesso: ${token.value.substring(0, 50)}...`);
      fcmToken = token.value;
      
      // Store token locally and show success message
      localStorage.setItem('fcm-token', token.value);
      
      toast({
        title: "🎉 Firebase configurado!",
        description: "Notificações push ativadas com sucesso! 🔔",
      });
    });
    
    // Listen for registration errors
    PushNotifications.addListener('registrationError', (error) => {
      console.error('❌ Erro no registro FCM:', error);
      toast({
        title: "❌ Erro no Firebase",
        description: "Não foi possível configurar as notificações push",
        variant: "destructive"
      });
    });
    
    // Listen for push notifications when app is in foreground
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('📱 Notificação push recebida (foreground):', notification);
      
      // Play notification sound
      playNotificationSound();
      
      // Show as local notification for better control
      showBalloonStyleNotification(
        notification.title || 'Novo lembrete',
        notification.body || '',
        notification.data
      );
    });
    
    // Listen for when user taps on notification
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('👆 Usuário clicou na notificação push:', action);
      
      // Show toast to confirm action
      toast({
        title: "📱 Notificação aberta",
        description: action.notification.title || "Lembrete do TDAHFOCUS",
      });
    });
    
    firebaseInitialized = true;
    console.log('✅ Firebase Cloud Messaging inicializado com sucesso');
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao inicializar Firebase Cloud Messaging:', error);
    
    toast({
      title: "❌ Erro no Firebase",
      description: "Verifique se o google-services.json está na pasta android/app/",
      variant: "destructive"
    });
    
    return false;
  }
};

/**
 * Show a notification in balloon style on Android
 */
export const showBalloonStyleNotification = async (
  title: string,
  body: string,
  data?: any
): Promise<boolean> => {
  if (!isNativeAndroid()) {
    console.log('⚠️ Notificações em estilo balão só funcionam no app nativo Android');
    return false;
  }
  
  try {
    console.log('🎈 Criando notificação em estilo balão:', title);
    
    // Create a notification channel specifically for balloon style notifications
    await LocalNotifications.createChannel({
      id: 'tdahfocus-balloons',
      name: 'TDAHFOCUS Balões',
      description: 'Lembretes em formato de balão flutuante',
      importance: 5, // IMPORTANCE_HIGH
      visibility: 1, // VISIBILITY_PUBLIC
      sound: 'default',
      vibration: true,
      lights: true,
      lightColor: '#4F46E5',
    });
    
    // Schedule the local notification with balloon style properties
    await LocalNotifications.schedule({
      notifications: [
        {
          id: Date.now(),
          title: title,
          body: body,
          channelId: 'tdahfocus-balloons',
          extra: {
            ...data,
            type: 'balloon',
            category: 'msg_category',
            style: 'bubble',
            shortcutId: 'tdah-reminder-shortcut',
            person: {
              name: 'TDAHFOCUS',
              icon: 'ic_notification',
            }
          },
          actionTypeId: 'REMINDER_ACTION',
          schedule: undefined,
          attachments: undefined,
          smallIcon: 'ic_notification',
          iconColor: '#4F46E5',
        }
      ]
    });
    
    console.log('🎈 Notificação em estilo balão enviada com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar notificação em balão:', error);
    
    // Fallback to toast
    toast({
      title: title,
      description: body,
    });
    
    return false;
  }
};

/**
 * Get the FCM token for this device
 */
export const getFCMToken = (): string | null => {
  if (fcmToken) return fcmToken;
  
  // Try to get from local storage
  return localStorage.getItem('fcm-token');
};

/**
 * Send a test notification to verify balloon style and Firebase
 */
export const sendTestBalloonNotification = async (): Promise<boolean> => {
  try {
    console.log('🧪 Enviando notificação de teste...');
    
    // Test local notification first
    const localSuccess = await showBalloonStyleNotification(
      '🧪 TDAHFOCUS - Teste Local',
      'Esta é uma notificação de teste local em formato de balão! Se você está vendo isso, as notificações locais estão funcionando.',
      { type: 'test-local', timestamp: Date.now() }
    );
    
    if (localSuccess) {
      toast({
        title: "✅ Teste local enviado!",
        description: "Verifique a notificação em balão acima",
      });
    }
    
    // If Firebase is initialized, test FCM token
    if (firebaseInitialized && fcmToken) {
      console.log('🔥 Firebase está ativo! Token disponível para testes de servidor');
      toast({
        title: "🔥 Firebase ativo!",
        description: `Token FCM: ${fcmToken.substring(0, 20)}...`,
      });
    } else {
      console.log('⚠️ Firebase não inicializado ou token não disponível');
      toast({
        title: "⚠️ Firebase não ativo",
        description: "Execute o app no dispositivo Android para ativar Firebase",
        variant: "destructive"
      });
    }
    
    return localSuccess;
  } catch (error) {
    console.error('❌ Erro ao enviar notificação de teste:', error);
    
    toast({
      title: "❌ Erro no teste",
      description: "Verifique os logs para mais detalhes",
      variant: "destructive"
    });
    
    return false;
  }
};

/**
 * Check if Firebase services are working
 */
export const checkFirebaseStatus = (): { initialized: boolean; hasToken: boolean; token?: string } => {
  const token = getFCMToken();
  
  return {
    initialized: firebaseInitialized,
    hasToken: !!token,
    token: token?.substring(0, 50) + '...' || undefined
  };
};
