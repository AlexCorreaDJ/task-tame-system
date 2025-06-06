
import { Permission } from "@/types/permissions";

const isAndroidApp = () => {
  // Detecta se é app Android (APK/Capacitor) ou navegador Android
  const userAgent = navigator.userAgent;
  const isAndroid = /Android/i.test(userAgent);
  const isCapacitor = !!(window as any).Capacitor;
  const isWebView = /wv|WebView/i.test(userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  
  console.log('🔍 Detecção de plataforma:', {
    userAgent,
    isAndroid,
    isCapacitor,
    isWebView,
    isStandalone
  });
  
  return isAndroid && (isCapacitor || isWebView || isStandalone);
};

export const checkPermission = async (permissionId: string): Promise<Permission['status']> => {
  try {
    switch (permissionId) {
      case 'notifications':
        console.log('🔍 Verificando permissão de notificações para Android...');
        
        // Verifica se a API está disponível
        if (!('Notification' in window)) {
          console.log('❌ Notification API não disponível');
          return 'denied';
        }
        
        const isApp = isAndroidApp();
        const currentPermission = Notification.permission;
        
        console.log('📱 É app Android:', isApp);
        console.log('🔔 Status atual da permissão:', currentPermission);
        
        // Para apps Android, forçamos a verificação real
        if (isApp) {
          console.log('📱 Verificando permissão no Android APK...');
          
          // Tenta criar uma notificação de teste para verificar se realmente funciona
          if (currentPermission === 'granted') {
            try {
              console.log('✅ Testando notificação no Android...');
              const testNotification = new Notification('Teste TDAHFOCUS', {
                body: 'Testando se as notificações funcionam no Android',
                icon: '/favicon.ico',
                tag: 'android-permission-test',
                silent: true // Teste silencioso
              });
              
              setTimeout(() => {
                testNotification.close();
              }, 1000);
              
              console.log('✅ Permissões de notificação FUNCIONANDO no Android!');
              return 'granted';
            } catch (error) {
              console.log('❌ Erro ao testar notificação:', error);
              return 'denied';
            }
          } else if (currentPermission === 'denied') {
            console.log('❌ Permissões de notificação NEGADAS no Android');
            return 'denied';
          } else {
            console.log('⏳ Permissões de notificação PENDENTES no Android');
            return 'prompt';
          }
        } else {
          // Para navegadores web, verifica HTTPS também
          const isSecure = location.protocol === 'https:' || 
                          location.hostname === 'localhost' || 
                          location.hostname === '127.0.0.1';
          
          if (!isSecure) {
            console.log('❌ Contexto inseguro detectado no navegador');
            return 'denied';
          }
        }
        
        // Retorna status baseado na permissão atual
        if (currentPermission === 'default') return 'prompt';
        if (currentPermission === 'granted') return 'granted';
        if (currentPermission === 'denied') return 'denied';
        
        return 'unknown';

      case 'storage':
        if ('localStorage' in window) {
          try {
            localStorage.setItem('android-permission-test', 'test');
            localStorage.removeItem('android-permission-test');
            console.log('✅ Armazenamento local disponível');
            return 'granted';
          } catch {
            console.log('❌ Armazenamento local negado');
            return 'denied';
          }
        }
        console.log('❌ localStorage não disponível');
        return 'denied';

      case 'wakeLock':
        // Para apps Android, verifica Wake Lock API
        if ('wakeLock' in navigator) {
          try {
            const wakeLock = await (navigator as any).wakeLock.request('screen');
            await wakeLock.release();
            console.log('✅ Wake Lock disponível');
            return 'granted';
          } catch (error) {
            console.log('❌ Wake Lock não disponível:', error);
            return 'denied';
          }
        }
        console.log('❌ Wake Lock API não suportada');
        return 'denied';

      default:
        return 'unknown';
    }
  } catch (error) {
    console.error(`❌ Erro ao verificar permissão ${permissionId}:`, error);
    return 'denied';
  }
};

export const checkAllPermissions = async (permissions: Permission[]): Promise<Permission[]> => {
  console.log('🔍 Verificando todas as permissões no Android...');
  return await Promise.all(
    permissions.map(async (permission) => {
      const status = await checkPermission(permission.id);
      console.log(`📋 Permissão ${permission.id}: ${status}`);
      return { ...permission, status };
    })
  );
};
