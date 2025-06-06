import { Permission } from "@/types/permissions";
import { checkAndroidNotificationPermission, isNativeAndroidApp, isWebAndroidApp } from './androidNotifications';

export const checkPermission = async (permissionId: string): Promise<Permission['status']> => {
  try {
    switch (permissionId) {
      case 'notifications':
        console.log('🔍 Verificando permissão de notificações...');
        
        // Log da plataforma detectada
        if (isNativeAndroidApp()) {
          console.log('📱 Verificando permissão no app nativo Android...');
        } else if (isWebAndroidApp()) {
          console.log('🌐 Verificando permissão no app web Android...');
        } else {
          console.log('💻 Verificando permissão na plataforma web/desktop...');
        }
        
        const status = await checkAndroidNotificationPermission();
        console.log('📋 Status da permissão de notificações:', status);
        
        return status;

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
  console.log('🔍 Verificando todas as permissões...');
  return await Promise.all(
    permissions.map(async (permission) => {
      const status = await checkPermission(permission.id);
      console.log(`📋 Permissão ${permission.id}: ${status}`);
      return { ...permission, status };
    })
  );
};
