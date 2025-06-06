
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

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
      console.log('📱 App nativo Android detectado - usando Capacitor Push Notifications');
      
      try {
        const permStatus = await PushNotifications.requestPermissions();
        console.log('📱 Status da permissão nativa:', permStatus);
        
        if (permStatus.receive === 'granted') {
          console.log('✅ Permissão nativa concedida para Android');
          
          // Registra para receber notificações
          await PushNotifications.register();
          console.log('✅ Registro de notificações nativas concluído');
          
          return true;
        } else {
          console.log('❌ Permissão nativa negada para Android');
          return false;
        }
      } catch (error) {
        console.error('❌ Erro ao solicitar permissão nativa:', error);
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
  
  // Para apps nativos Android
  if (isNativeAndroidApp()) {
    console.log('📱 Enviando notificação via Capacitor...');
    
    // Com Capacitor, notificações locais são enviadas via plugin separado
    // Por enquanto, vamos usar a Web API como fallback
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
      
      // Vibração específica para Android
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 300]);
      }
      
      setTimeout(() => notification.close(), 10000);
      return true;
    }
    return false;
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
      const permStatus = await PushNotifications.checkPermissions();
      console.log('📱 Status atual da permissão nativa:', permStatus);
      
      if (permStatus.receive === 'granted') return 'granted';
      if (permStatus.receive === 'denied') return 'denied';
      return 'prompt';
    } catch (error) {
      console.error('❌ Erro ao verificar permissão nativa:', error);
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
