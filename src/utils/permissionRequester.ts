
import { Permission } from "@/types/permissions";
import { toast } from "@/hooks/use-toast";

const isAndroid = () => /Android/i.test(navigator.userAgent);

export const requestPermission = async (permissionId: string): Promise<Permission['status']> => {
  console.log(`Solicitando permissão no Android: ${permissionId}`);
  
  try {
    let newStatus: Permission['status'] = 'denied';

    switch (permissionId) {
      case 'notifications':
        // Verifica se estamos em um contexto seguro no Android
        if (isAndroid() && location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
          console.log('Android: Notificações requerem HTTPS');
          toast({
            title: "Contexto inseguro detectado",
            description: "No Android, notificações requerem HTTPS. Acesse via HTTPS.",
            variant: "destructive"
          });
          return 'denied';
        }

        // Verifica se a API está disponível
        if (!('Notification' in window)) {
          console.log('API de Notification não disponível no Android');
          toast({
            title: "Notificações não suportadas",
            description: "Este navegador Android não suporta notificações do sistema.",
            variant: "destructive"
          });
          return 'denied';
        }

        console.log('Android - API de Notification disponível, status atual:', Notification.permission);
        
        // Se já foi negada no Android, orienta o usuário
        if (Notification.permission === 'denied') {
          toast({
            title: "Notificações bloqueadas no Android",
            description: "Vá nas configurações do Chrome/navegador > Notificações > Permitir para este site, depois recarregue a página.",
            variant: "destructive"
          });
          return 'denied';
        }

        // Se já está concedida no Android
        if (Notification.permission === 'granted') {
          toast({
            title: "Notificações ativadas no Android!",
            description: "Você receberá notificações com som do sistema.",
          });
          
          // Testa com uma notificação imediata no Android
          setTimeout(() => {
            try {
              new Notification('TDAHFOCUS - Android', {
                body: 'Notificações funcionando no seu Android!',
                icon: '/favicon.ico',
                tag: 'android-test-notification',
                silent: false,
                requireInteraction: true
              });
            } catch (error) {
              console.error('Erro ao criar notificação de teste no Android:', error);
            }
          }, 1000);
          
          return 'granted';
        }

        // Solicita permissão no Android
        if (Notification.permission === 'default') {
          console.log('Android: Solicitando permissão de notificação...');
          
          try {
            const permission = await Notification.requestPermission();
            console.log('Android: Resultado da solicitação:', permission);
            
            if (permission === 'granted') {
              toast({
                title: "Notificações ativadas no Android!",
                description: "Agora você receberá notificações com som para seus lembretes.",
              });
              
              // Testa com uma notificação de boas-vindas no Android
              setTimeout(() => {
                try {
                  new Notification('TDAHFOCUS Android', {
                    body: 'Notificações ativadas com sucesso! Você receberá lembretes com som.',
                    icon: '/favicon.ico',
                    tag: 'android-welcome-notification',
                    silent: false,
                    requireInteraction: true
                  });
                } catch (error) {
                  console.error('Erro ao criar notificação de boas-vindas no Android:', error);
                }
              }, 1000);
              
              newStatus = 'granted';
            } else if (permission === 'denied') {
              toast({
                title: "Notificações negadas no Android",
                description: "Você negou as notificações. Para ativar: Chrome > Menu > Configurações > Notificações.",
                variant: "destructive"
              });
              newStatus = 'denied';
            } else {
              toast({
                title: "Permissão pendente no Android",
                description: "A permissão ainda está pendente. Tente novamente.",
                variant: "destructive"
              });
              newStatus = 'prompt';
            }
          } catch (error) {
            console.error('Android: Erro ao solicitar permissão:', error);
            toast({
              title: "Erro ao solicitar permissão",
              description: "Não foi possível solicitar permissão no Android. Tente recarregar a página.",
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
            title: "Armazenamento disponível no Android!",
            description: "Seus dados serão salvos localmente no dispositivo.",
          });
        } catch (error) {
          console.error('Android: Erro no localStorage:', error);
          newStatus = 'denied';
          toast({
            title: "Erro no armazenamento Android",
            description: "Não foi possível acessar o armazenamento local no Android.",
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
              title: "Controle de tela disponível no Android!",
              description: "O app pode manter a tela ativa durante sessões de foco.",
            });
          } catch (error) {
            console.error('Android: Erro no wake lock:', error);
            newStatus = 'denied';
            toast({
              title: "Não foi possível ativar no Android",
              description: "O controle de tela não está disponível neste momento.",
              variant: "destructive"
            });
          }
        } else {
          newStatus = 'denied';
          toast({
            title: "Não suportado no Android",
            description: "Controle de tela não é suportado neste navegador Android.",
            variant: "destructive"
          });
        }
        break;
    }

    return newStatus;

  } catch (error) {
    console.error(`Android: Erro ao solicitar permissão ${permissionId}:`, error);
    toast({
      title: "Erro no Android",
      description: "Não foi possível solicitar a permissão no Android.",
      variant: "destructive"
    });
    return 'denied';
  }
};

export const requestAllPermissions = async (
  permissions: Permission[],
  onPermissionUpdate: (permissionId: string, status: Permission['status']) => void
) => {
  console.log('Android: Solicitando todas as permissões...');
  
  toast({
    title: "Configurando permissões no Android",
    description: "Vamos solicitar as permissões necessárias para o funcionamento completo.",
  });
  
  for (const permission of permissions) {
    if (permission.status !== 'granted' && permission.isRequired) {
      console.log(`Android: Processando permissão: ${permission.id}`);
      const newStatus = await requestPermission(permission.id);
      onPermissionUpdate(permission.id, newStatus);
      // Pausa entre solicitações para não sobrecarregar o usuário
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
      description: "Seu app Android está configurado e pronto para uso completo.",
    });
  }
};
