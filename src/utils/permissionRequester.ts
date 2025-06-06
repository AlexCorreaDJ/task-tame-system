
import { Permission } from "@/types/permissions";
import { toast } from "@/hooks/use-toast";

export const requestPermission = async (permissionId: string): Promise<Permission['status']> => {
  console.log(`Solicitando permissão: ${permissionId}`);
  
  try {
    let newStatus: Permission['status'] = 'denied';

    switch (permissionId) {
      case 'notifications':
        // Verifica se estamos em um contexto seguro primeiro
        if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
          console.log('Notificações requerem HTTPS - redirecionando para HTTPS se possível');
          toast({
            title: "Contexto inseguro detectado",
            description: "Para notificações do sistema, acesse via HTTPS.",
            variant: "destructive"
          });
          return 'denied';
        }

        // Força a verificação da API de notificação
        if (!('Notification' in window)) {
          console.log('API de Notification não disponível');
          toast({
            title: "Notificações não suportadas",
            description: "Este navegador não suporta notificações do sistema.",
            variant: "destructive"
          });
          return 'denied';
        }

        console.log('API de Notification disponível, status atual:', Notification.permission);
        
        // Se já foi negada, orienta o usuário
        if (Notification.permission === 'denied') {
          toast({
            title: "Notificações bloqueadas",
            description: "Vá nas configurações do navegador e permita notificações para este site, depois recarregue a página.",
            variant: "destructive"
          });
          return 'denied';
        }

        // Se já está concedida, confirma
        if (Notification.permission === 'granted') {
          toast({
            title: "Notificações ativadas!",
            description: "Você receberá notificações do sistema.",
          });
          
          // Testa com uma notificação imediata
          setTimeout(() => {
            try {
              new Notification('TDAHFOCUS - Teste', {
                body: 'As notificações estão funcionando!',
                icon: '/favicon.ico',
                tag: 'test-notification'
              });
            } catch (error) {
              console.error('Erro ao criar notificação de teste:', error);
            }
          }, 1000);
          
          return 'granted';
        }

        // Solicita permissão se está como 'default'
        if (Notification.permission === 'default') {
          console.log('Solicitando permissão de notificação...');
          
          try {
            const permission = await Notification.requestPermission();
            console.log('Resultado da solicitação:', permission);
            
            if (permission === 'granted') {
              toast({
                title: "Notificações ativadas!",
                description: "Agora você receberá notificações do sistema para seus lembretes.",
              });
              
              // Testa com uma notificação
              setTimeout(() => {
                try {
                  new Notification('TDAHFOCUS', {
                    body: 'Notificações ativadas com sucesso! Você receberá lembretes aqui.',
                    icon: '/favicon.ico',
                    tag: 'welcome-notification'
                  });
                } catch (error) {
                  console.error('Erro ao criar notificação de boas-vindas:', error);
                }
              }, 1000);
              
              newStatus = 'granted';
            } else if (permission === 'denied') {
              toast({
                title: "Notificações negadas",
                description: "Você negou as notificações. Para ativar, vá nas configurações do navegador.",
                variant: "destructive"
              });
              newStatus = 'denied';
            } else {
              // Caso 'default' persista
              toast({
                title: "Permissão pendente",
                description: "A permissão de notificação ainda está pendente. Tente novamente.",
                variant: "destructive"
              });
              newStatus = 'prompt';
            }
          } catch (error) {
            console.error('Erro ao solicitar permissão:', error);
            toast({
              title: "Erro ao solicitar permissão",
              description: "Não foi possível solicitar permissão de notificação. Tente recarregar a página.",
              variant: "destructive"
            });
            newStatus = 'denied';
          }
        }
        break;

      case 'storage':
        try {
          localStorage.setItem('permission-test', 'test');
          localStorage.removeItem('permission-test');
          newStatus = 'granted';
          toast({
            title: "Armazenamento disponível!",
            description: "Seus dados serão salvos localmente.",
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
  
  for (const permission of permissions) {
    if (permission.status !== 'granted' && permission.isRequired) {
      console.log(`Processando permissão: ${permission.id}`);
      const newStatus = await requestPermission(permission.id);
      onPermissionUpdate(permission.id, newStatus);
      // Pequena pausa entre solicitações
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};
