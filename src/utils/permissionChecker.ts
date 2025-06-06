
import { Permission } from "@/types/permissions";

const isAndroidApp = () => {
  // Detecta se é app Android (APK/Capacitor) ou navegador Android
  const userAgent = navigator.userAgent;
  const isAndroid = /Android/i.test(userAgent);
  const isCapacitor = !!(window as any).Capacitor;
  const isWebView = /wv|WebView/i.test(userAgent);
  
  return isAndroid && (isCapacitor || isWebView);
};

export const checkPermission = async (permissionId: string): Promise<Permission['status']> => {
  try {
    switch (permissionId) {
      case 'notifications':
        console.log('Verificando suporte a notificações...');
        
        // Verifica se a API está disponível
        if (!('Notification' in window)) {
          console.log('Notification API não disponível');
          return 'denied';
        }
        
        const isApp = isAndroidApp();
        console.log('É app Android:', isApp);
        console.log('Status atual da permissão:', Notification.permission);
        
        // Para apps Android (APK), não precisamos verificar HTTPS
        if (!isApp) {
          // Somente para navegadores web, verifica HTTPS
          const isSecure = location.protocol === 'https:' || 
                          location.hostname === 'localhost' || 
                          location.hostname === '127.0.0.1';
          
          if (!isSecure) {
            console.log('Contexto inseguro detectado no navegador');
            return 'denied';
          }
        }
        
        const permission = Notification.permission;
        console.log('Permissão de notificação atual:', permission);
        
        if (permission === 'default') return 'prompt';
        if (permission === 'granted') return 'granted';
        if (permission === 'denied') return 'denied';
        
        return 'unknown';

      case 'storage':
        if ('localStorage' in window) {
          try {
            localStorage.setItem('android-permission-test', 'test');
            localStorage.removeItem('android-permission-test');
            return 'granted';
          } catch {
            return 'denied';
          }
        }
        return 'denied';

      case 'wakeLock':
        // Para apps Android, verifica Wake Lock API
        if ('wakeLock' in navigator) {
          try {
            const wakeLock = await (navigator as any).wakeLock.request('screen');
            await wakeLock.release();
            return 'granted';
          } catch (error) {
            console.log('Wake Lock não disponível:', error);
            return 'denied';
          }
        }
        return 'denied';

      default:
        return 'unknown';
    }
  } catch (error) {
    console.error(`Erro ao verificar permissão ${permissionId}:`, error);
    return 'denied';
  }
};

export const checkAllPermissions = async (permissions: Permission[]): Promise<Permission[]> => {
  console.log('Verificando todas as permissões...');
  return await Promise.all(
    permissions.map(async (permission) => {
      const status = await checkPermission(permission.id);
      console.log(`Permissão ${permission.id}: ${status}`);
      return { ...permission, status };
    })
  );
};
