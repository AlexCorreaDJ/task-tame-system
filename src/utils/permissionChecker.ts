
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
        
        // Verifica contexto seguro
        if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
          console.log('Notificações requerem HTTPS');
          return 'denied';
        }
        
        const permission = Notification.permission;
        console.log('Status atual da permissão de notificação:', permission);
        
        if (permission === 'default') return 'prompt';
        if (permission === 'granted') return 'granted';
        if (permission === 'denied') return 'denied';
        
        return 'unknown';

      case 'storage':
        if ('localStorage' in window) {
          try {
            localStorage.setItem('permission-test', 'test');
            localStorage.removeItem('permission-test');
            return 'granted';
          } catch {
            return 'denied';
          }
        }
        return 'denied';

      case 'wakeLock':
        if ('wakeLock' in navigator) {
          return 'granted';
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
  return await Promise.all(
    permissions.map(async (permission) => {
      const status = await checkPermission(permission.id);
      return { ...permission, status };
    })
  );
};
