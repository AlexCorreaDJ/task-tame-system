
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';

export const isNativeAndroidApp = () => {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
};

export const isWebAndroidApp = () => {
  const userAgent = navigator.userAgent;
  const isAndroid = /Android/i.test(userAgent);
  const isWebView = /wv|WebView/i.test(userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  
  return isAndroid && (isWebView || isStandalone) && !Capacitor.isNativePlatform();
};

export const requestAndroidNotificationPermission = async (): Promise<boolean> => {
  console.log('📱 Solicitando permissão de notificação para Android...');
  
  try {
    // Para apps nativos Android (APK/AAB via Capacitor)
    if (isNativeAndroidApp()) {
      console.log('📱 App nativo Android detectado - configurando notificações locais');
      
      try {
        // Solicita permissão para notificações locais
        const localPermission = await LocalNotifications.requestPermissions();
        console.log('📱 Permissão de notificações locais:', localPermission);
        
        if (localPermission.display === 'granted') {
          console.log('✅ Permissão de notificações locais concedida');
          
          // Configura canal de notificação para Android
          await LocalNotifications.createChannel({
            id: 'tdahfocus-reminders',
            name: 'Lembretes TDAHFOCUS',
            description: 'Lembretes motivacionais para manter seu foco',
            importance: 5,
            visibility: 1,
            sound: 'default',
            vibration: true,
            lights: true
          });
          
          return true;
        } else {
          console.log('❌ Permissão de notificações locais negada');
          return false;
        }
      } catch (error) {
        console.error('❌ Erro ao solicitar permissão de notificações locais:', error);
        return false;
      }
    }
    
    // Para apps web no Android (PWA/WebView)
    if (isWebAndroidApp() || /Android/i.test(navigator.userAgent)) {
      console.log('🌐 App web Android detectado - usando Web Notification API');
      
      if (!('Notification' in window)) {
        console.log('❌ Web Notification API não disponível');
        return false;
      }
      
      if (Notification.permission === 'granted') {
        console.log('✅ Permissão web já concedida');
        return true;
      }
      
      if (Notification.permission === 'denied') {
        console.log('❌ Permissão web negada anteriormente');
        return false;
      }
      
      const permission = await Notification.requestPermission();
      console.log('🌐 Resultado da permissão web:', permission);
      
      return permission === 'granted';
    }
    
    // Fallback para outros casos
    console.log('💻 Plataforma não-Android detectada');
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    
    return false;
    
  } catch (error) {
    console.error('❌ Erro geral ao solicitar permissão:', error);
    return false;
  }
};

export const showAndroidNotification = (title: string, body: string, data?: any) => {
  console.log('🔔 Mostrando notificação Android:', { title, body });
  
  // Para apps nativos Android - usar LocalNotifications
  if (isNativeAndroidApp()) {
    console.log('📱 Enviando notificação local via Capacitor...');
    
    try {
      LocalNotifications.schedule({
        notifications: [
          {
            id: Date.now(),
            title: title,
            body: body,
            channelId: 'tdahfocus-reminders',
            sound: 'default',
            smallIcon: 'ic_notification',
            iconColor: '#4F46E5',
            attachments: undefined,
            actionTypeId: '',
            extra: data
          }
        ]
      });
      
      // Vibração para Android
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 300]);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar notificação local:', error);
      
      // Fallback para Web Notification
      if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: `tdahfocus-${Date.now()}`,
          silent: false,
          requireInteraction: true,
          data
        });
        
        setTimeout(() => notification.close(), 10000);
        return true;
      }
      return false;
    }
  }
  
  // Para apps web Android
  if (isWebAndroidApp() || /Android/i.test(navigator.userAgent)) {
    console.log('🌐 Enviando notificação web Android...');
    
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `tdahfocus-${Date.now()}`,
        silent: false,
        requireInteraction: true,
        data
      });
      
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 300]);
      }
      
      setTimeout(() => notification.close(), 15000);
      return true;
    }
    return false;
  }
  
  // Fallback para outros casos
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body,
      icon: '/favicon.ico',
      data
    });
    
    setTimeout(() => notification.close(), 8000);
    return true;
  }
  
  return false;
};

export const checkAndroidNotificationPermission = async (): Promise<'granted' | 'denied' | 'prompt'> => {
  // Para apps nativos Android
  if (isNativeAndroidApp()) {
    try {
      const localPermission = await LocalNotifications.checkPermissions();
      console.log('📱 Status atual da permissão de notificações locais:', localPermission);
      
      if (localPermission.display === 'granted') return 'granted';
      if (localPermission.display === 'denied') return 'denied';
      return 'prompt';
    } catch (error) {
      console.error('❌ Erro ao verificar permissão de notificações locais:', error);
      return 'denied';
    }
  }
  
  // Para apps web Android
  if ('Notification' in window) {
    const permission = Notification.permission;
    if (permission === 'default') return 'prompt';
    return permission as 'granted' | 'denied';
  }
  
  return 'denied';
};
