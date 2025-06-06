
import { Permission } from "@/types/permissions";

export const checkPermission = async (permissionId: string): Promise<Permission['status']> => {
  try {
    switch (permissionId) {
      case 'notifications':
        if ('Notification' in window) {
          const permission = Notification.permission;
          if (permission === 'default') return 'prompt';
          return permission as Permission['status'];
        }
        return 'denied';

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
