import { Permission } from "@/types/permissions";
import { toast } from "@/hooks/use-toast";
import { 
  requestAndroidNotificationPermission, 
  isNativeAndroidApp, 
  isWebAndroidApp 
} from './androidNotifications';

export const requestPermission = async (permissionId: string): Promise<Permission['status']> => {
  console.log(`🔔 Solicitando permissão: ${permissionId}`);
  
  try {
    let newStatus: Permission['status'] = 'denied';

    switch (permissionId) {
      case 'notifications':
        console.log('📱 Solicitando permissão de notificações...');
        
        // Log da plataforma
        if (isNativeAndroidApp()) {
          console.log('📱 Usando API nativa do Capacitor para Android');
        } else if (isWebAndroidApp()) {
          console.log('🌐 Usando Web Notification API para Android');
        } else {
          console.log('💻 Usando Web Notification API para desktop/web');
        }
        
        const granted = await requestAndroidNotificationPermission();
        
        if (granted) {
          newStatus = 'granted';
          
          if (isNativeAndroidApp()) {
            toast({
              title: "🎉 Sucesso no Android!",
              description: "Notificações nativas ativadas! Você receberá lembretes na barra de notificações do Android! 📱🔔",
            });
          } else {
            toast({
              title: "✅ Notificações ativadas!",
              description: "Agora você receberá lembretes motivacionais!",
            });
          }
        } else {
          newStatus = 'denied';
          
          if (isNativeAndroidApp()) {
            toast({
              title: "⚠️ Permissão necessária",
              description: "Para receber notificações, vá em: Configurações > Apps > TDAHFOCUS > Notificações > Permitir",
              variant: "destructive"
            });
          } else if (isWebAndroidApp()) {
            toast({
              title: "🔒 Notificações bloqueadas",
              description: "Vá nas configurações do Android > Apps > Chrome/Samsung Internet > Notificações > Permitir",
              variant: "destructive"
            });
          } else {
            toast({
              title: "❌ Notificações negadas",
              description: "Ative nas configurações do navegador para receber lembretes.",
              variant: "destructive"
            });
          }
        }
        break;

      case 'storage':
        try {
          localStorage.setItem('android-permission-test', 'test');
          localStorage.removeItem('android-permission-test');
          newStatus = 'granted';
          toast({
            title: "✅ Armazenamento disponível!",
            description: "Seus dados serão salvos localmente no dispositivo.",
          });
        } catch (error) {
          console.error('❌ Erro no localStorage:', error);
          newStatus = 'denied';
          toast({
            title: "❌ Erro no armazenamento",
            description: "Não foi possível acessar o armazenamento local.",
            variant: "destructive"
          });
        }
        break;

      case 'wakeLock':
        if ('wakeLock' in navigator) {
          try {
            const wakeLock = await (navigator as any).wakeLock.request('screen');
            await wakeLock.release();
            newStatus = 'granted';
            toast({
              title: "✅ Controle de tela disponível!",
              description: "O app pode manter a tela ativa durante sessões de foco.",
            });
          } catch (error) {
            console.error('❌ Erro no wake lock:', error);
            newStatus = 'denied';
            toast({
              title: "❌ Não foi possível ativar",
              description: "O controle de tela não está disponível neste momento.",
              variant: "destructive"
            });
          }
        } else {
          newStatus = 'denied';
          toast({
            title: "❌ Não suportado",
            description: "Controle de tela não é suportado neste dispositivo.",
            variant: "destructive"
          });
        }
        break;
    }

    return newStatus;

  } catch (error) {
    console.error(`❌ Erro ao solicitar permissão ${permissionId}:`, error);
    toast({
      title: "❌ Erro",
      description: "Não foi possível solicitar a permissão.",
      variant: "destructive"
    });
    return 'denied';
  }
};

export const requestAllPermissions = async (
  permissions: Permission[],
  onPermissionUpdate: (permissionId: string, status: Permission['status']) => void
) => {
  console.log('🔔 Solicitando todas as permissões...');
  
  toast({
    title: "📱 Configurando aplicativo",
    description: "Vamos solicitar as permissões necessárias para o funcionamento do app.",
  });
  
  for (const permission of permissions) {
    if (permission.status !== 'granted' && permission.isRequired) {
      console.log(`🔄 Processando permissão: ${permission.id}`);
      const newStatus = await requestPermission(permission.id);
      onPermissionUpdate(permission.id, newStatus);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  const allGranted = permissions
    .filter(p => p.isRequired)
    .every(p => p.status === 'granted');
    
  if (allGranted) {
    toast({
      title: "🎉 App configurado!",
      description: "Todas as permissões foram concedidas! Seu app está pronto para uso. 📱✨",
    });
  } else {
    toast({
      title: "⚠️ Algumas permissões pendentes",
      description: "Para funcionar completamente, conceda todas as permissões nas configurações do sistema.",
      variant: "destructive"
    });
  }
};
