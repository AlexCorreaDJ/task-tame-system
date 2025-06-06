
import { Permission } from "@/types/permissions";
import { toast } from "@/hooks/use-toast";

const isAndroidApp = () => {
  const userAgent = navigator.userAgent;
  const isAndroid = /Android/i.test(userAgent);
  const isCapacitor = !!(window as any).Capacitor;
  const isWebView = /wv|WebView/i.test(userAgent);
  
  return isAndroid && (isCapacitor || isWebView);
};

export const requestPermission = async (permissionId: string): Promise<Permission['status']> => {
  console.log(`Solicitando permissão: ${permissionId}`);
  
  try {
    let newStatus: Permission['status'] = 'denied';

    switch (permissionId) {
      case 'notifications':
        const isApp = isAndroidApp();
        console.log('É aplicativo Android:', isApp);
        
        // Verifica se a API está disponível
        if (!('Notification' in window)) {
          console.log('API de Notification não disponível');
          toast({
            title: "Notificações não suportadas",
            description: "Este dispositivo não suporta notificações do sistema.",
            variant: "destructive"
          });
          return 'denied';
        }

        console.log('API de Notification disponível, status atual:', Notification.permission);
        
        // Para navegadores (não apps), verifica HTTPS
        if (!isApp) {
          const isSecure = location.protocol === 'https:' || 
                          location.hostname === 'localhost' || 
                          location.hostname === '127.0.0.1';
          
          if (!isSecure) {
            toast({
              title: "Contexto inseguro",
              description: "Notificações requerem HTTPS no navegador. Use um app ou HTTPS.",
              variant: "destructive"
            });
            return 'denied';
          }
        }
        
        // Se já foi negada, orienta o usuário
        if (Notification.permission === 'denied') {
          toast({
            title: "Notificações bloqueadas",
            description: isApp ? 
              "Vá nas configurações do app > Notificações > Permitir" :
              "Vá nas configurações do navegador > Notificações > Permitir para este site",
            variant: "destructive"
          });
          return 'denied';
        }

        // Se já está concedida
        if (Notification.permission === 'granted') {
          toast({
            title: "Notificações ativas!",
            description: "Você receberá lembretes com som do sistema.",
          });
          
          // Testa com uma notificação imediata
          setTimeout(() => {
            try {
              new Notification('TDAHFOCUS', {
                body: 'Notificações funcionando! Você receberá lembretes com som.',
                icon: '/favicon.ico',
                tag: 'test-notification',
                silent: false,
                requireInteraction: true
              });
            } catch (error) {
              console.error('Erro ao criar notificação de teste:', error);
            }
          }, 1000);
          
          return 'granted';
        }

        // Solicita permissão
        if (Notification.permission === 'default') {
          console.log('Solicitando permissão de notificação...');
          
          try {
            const permission = await Notification.requestPermission();
            console.log('Resultado da solicitação:', permission);
            
            if (permission === 'granted') {
              toast({
                title: "Notificações ativadas!",
                description: "Agora você receberá lembretes com som para suas tarefas.",
              });
              
              // Testa com uma notificação de boas-vindas
              setTimeout(() => {
                try {
                  new Notification('TDAHFOCUS', {
                    body: 'Notificações ativadas com sucesso! Você receberá lembretes com som.',
                    icon: '/favicon.ico',
                    tag: 'welcome-notification',
                    silent: false,
                    requireInteraction: true
                  });
                } catch (error) {
                  console.error('Erro ao criar notificação de boas-vindas:', error);
                }
              }, 1000);
              
              newStatus = 'granted';
            } else if (permission === 'denied') {
              toast({
                title: "Notificações negadas",
                description: isApp ? 
                  "Você negou as notificações. Ative nas configurações do app." :
                  "Você negou as notificações. Ative nas configurações do navegador.",
                variant: "destructive"
              });
              newStatus = 'denied';
            } else {
              toast({
                title: "Permissão pendente",
                description: "A permissão ainda está pendente. Tente novamente.",
                variant: "destructive"
              });
              newStatus = 'prompt';
            }
          } catch (error) {
            console.error('Erro ao solicitar permissão:', error);
            toast({
              title: "Erro ao solicitar permissão",
              description: "Não foi possível solicitar permissão. Tente recarregar o app.",
              variant: "destructive"
            });
            newStatus = 'denied';
          }
        }
        break;

      case 'storage':
        try {
          localStorage.setItem('android-permission-test', 'test');
          localStorage.removeItem('android-permission-test');
          newStatus = 'granted';
          toast({
            title: "Armazenamento disponível!",
            description: "Seus dados serão salvos localmente no dispositivo.",
          });
        } catch (error) {
          console.error('Erro no localStorage:', error);
          newStatus = 'denied';
          toast({
            title: "Erro no armazenamento",
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
              title: "Controle de tela disponível!",
              description: "O app pode manter a tela ativa durante sessões de foco.",
            });
          } catch (error) {
            console.error('Erro no wake lock:', error);
            newStatus = 'denied';
            toast({
              title: "Não foi possível ativar",
              description: "O controle de tela não está disponível neste momento.",
              variant: "destructive"
            });
          }
        } else {
          newStatus = 'denied';
          toast({
            title: "Não suportado",
            description: "Controle de tela não é suportado neste dispositivo.",
            variant: "destructive"
          });
        }
        break;
    }

    return newStatus;

  } catch (error) {
    console.error(`Erro ao solicitar permissão ${permissionId}:`, error);
    toast({
      title: "Erro",
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
  console.log('Solicitando todas as permissões...');
  
  toast({
    title: "Configurando permissões",
    description: "Vamos solicitar as permissões necessárias para o funcionamento completo do app.",
  });
  
  for (const permission of permissions) {
    if (permission.status !== 'granted' && permission.isRequired) {
      console.log(`Processando permissão: ${permission.id}`);
      const newStatus = await requestPermission(permission.id);
      onPermissionUpdate(permission.id, newStatus);
      // Pausa entre solicitações
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }
  
  // Verifica se todas as permissões obrigatórias foram concedidas
  const allGranted = permissions
    .filter(p => p.isRequired)
    .every(p => p.status === 'granted');
    
  if (allGranted) {
    toast({
      title: "Todas as permissões concedidas!",
      description: "Seu app está configurado e pronto para uso completo.",
    });
  }
};
