
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
    
    // Check permissions first
    const permissionStatus = await PushNotifications.checkPermissions();
    
    if (permissionStatus.receive !== 'granted') {
      console.log('⚠️ Solicitando permissões de notificação push...');
      const requestResult = await PushNotifications.requestPermissions();
      
      if (requestResult.receive !== 'granted') {
        console.log('❌ Permissão de notificação push negada');
        return false;
      }
    }

    // Register with FCM
    await PushNotifications.register();
    
    // Listen for registration result
    PushNotifications.addListener('registration', (token) => {
      console.log(`✅ Token FCM registrado: ${token.value}`);
      fcmToken = token.value;
      
      // Here you would typically send this token to your server
      // For now, we'll just store it locally
      localStorage.setItem('fcm-token', token.value);
    });
    
    // Listen for push notifications
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('📱 Notificação push recebida:', notification);
      
      // Play notification sound
      playNotificationSound();
      
      // Convert FCM notification to local notification to have more control
      showBalloonStyleNotification(
        notification.title || 'Novo lembrete',
        notification.body || '',
        notification.data
      );
    });
    
    // Listen for when user taps on notification
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('👆 Ação em notificação push:', action);
      
      // Handle notification action here
      // For example, navigate to specific screen
    });
    
    firebaseInitialized = true;
    console.log('✅ Firebase Cloud Messaging inicializado com sucesso');
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao inicializar Firebase:', error);
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
          // Special properties for balloon style
          channelId: 'tdahfocus-balloons',
          // These extra settings will help format as a balloon notification
          extra: {
            ...data,
            // Android-specific options for balloon style
            type: 'balloon',
            category: 'msg_category', // Required for bubbles
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
    
    console.log('🎈 Notificação em estilo balão enviada');
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar notificação em balão:', error);
    
    // Fallback to regular notification
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
 * Send a test notification to verify balloon style
 */
export const sendTestBalloonNotification = async (): Promise<boolean> => {
  try {
    const success = await showBalloonStyleNotification(
      '💬 TDAHFOCUS - Teste de Balão',
      'Esta é uma notificação em formato de balão! Este estilo ajuda a chamar mais atenção para os seus lembretes importantes.',
      { type: 'test', timestamp: Date.now() }
    );
    
    return success;
  } catch (error) {
    console.error('❌ Erro ao enviar notificação de teste:', error);
    return false;
  }
};
