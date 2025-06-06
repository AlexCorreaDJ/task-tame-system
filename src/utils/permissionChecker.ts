
import { Permission } from "@/types/permissions";

export const checkPermission = async (permissionId: string): Promise<Permission['status']> => {
  try {
    switch (permissionId) {
      case 'notifications':
        // Verifica se a API está disponível
        if (!('Notification' in window)) {
          console.log('Notification API não disponível');
          return 'denied';
        }
        
        // No Android, verifica se estamos em contexto seguro (HTTPS ou localhost)
        const isAndroid = /Android/i.test(navigator.userAgent);
        if (isAndroid && location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
          console.log('Android: Notificações requerem HTTPS');
          return 'denied';
        }
        
        const permission = Notification.permission;
        console.log('Status atual da permissão de notificação no Android:', permission);
        
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
        // No Android, verifica se Wake Lock API está disponível
        if ('wakeLock' in navigator) {
          try {
            // Testa se consegue solicitar wake lock
            const wakeLock = await (navigator as any).wakeLock.request('screen');
            await wakeLock.release();
            return 'granted';
          } catch (error) {
            console.log('Wake Lock não disponível no Android:', error);
            return 'denied';
          }
        }
        return 'denied';

      default:
        return 'unknown';
    }
  } catch (error) {
    console.error(`Erro ao verificar permissão ${permissionId} no Android:`, error);
    return 'denied';
  }
};

export const checkAllPermissions = async (permissions: Permission[]): Promise<Permission[]> => {
  console.log('Verificando todas as permissões no Android...');
  return await Promise.all(
    permissions.map(async (permission) => {
      const status = await checkPermission(permission.id);
      console.log(`Permissão ${permission.id}: ${status}`);
      return { ...permission, status };
    })
  );
};
