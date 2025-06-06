
import { Permission } from "@/types/permissions";

export const checkPermission = async (permissionId: string): Promise<Permission['status']> => {
  try {
    switch (permissionId) {
      case 'notifications':
        // Verifica se o navegador suporta notificações de forma mais ampla
        if (!('Notification' in window) && !('webkitNotifications' in window)) {
          console.log('Notification API não disponível');
          // Retorna granted para permitir uso de lembretes alternativos
          return 'granted';
        }
        
        // Verifica se estamos em um contexto seguro (HTTPS ou localhost)
        if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
          console.log('Notificações requerem HTTPS');
          // Ainda permite funcionamento com lembretes alternativos
          return 'granted';
        }
        
        // Usa a API padrão ou webkit
        const NotificationAPI = window.Notification || (window as any).webkitNotifications;
        
        if (!NotificationAPI) {
          // Sem API disponível, mas permite funcionamento alternativo
          return 'granted';
        }
        
        const permission = NotificationAPI.permission;
        console.log('Status atual da permissão de notificação:', permission);
        
        if (permission === 'default') return 'prompt';
        if (permission === 'granted') return 'granted';
        // Mesmo se negada, permite funcionamento alternativo
        return 'granted';

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
