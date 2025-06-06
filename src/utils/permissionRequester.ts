
import { Permission } from "@/types/permissions";
import { toast } from "@/hooks/use-toast";

export const requestPermission = async (permissionId: string): Promise<Permission['status']> => {
  console.log(`Solicitando permissão: ${permissionId}`);
  
  try {
    let newStatus: Permission['status'] = 'denied';

    switch (permissionId) {
      case 'notifications':
        // Verifica se o navegador suporta notificações
        if (!('Notification' in window)) {
          console.log('Notification API não disponível neste navegador');
          toast({
            title: "Notificações não suportadas",
            description: "Este navegador não suporta notificações push.",
            variant: "destructive"
          });
          return 'denied';
        }

        // Verifica se estamos em contexto seguro
        if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
          console.log('Notificações requerem HTTPS');
          toast({
            title: "Contexto inseguro",
            description: "Notificações requerem conexão HTTPS.",
            variant: "destructive"
          });
          return 'denied';
        }

        console.log('Estado atual da notificação:', Notification.permission);
        
        if (Notification.permission === 'default') {
          console.log('Solicitando permissão de notificação...');
          try {
            const permission = await Notification.requestPermission();
            console.log('Resultado da solicitação:', permission);
            newStatus = permission as Permission['status'];
            
            if (permission === 'granted') {
              toast({
                title: "Permissão concedida!",
                description: "Agora você receberá notificações de lembretes.",
              });
              
              // Testa enviando uma notificação
              setTimeout(() => {
                try {
                  new Notification('TDAHFOCUS', {
                    body: 'Notificações ativadas com sucesso!',
                    icon: '/favicon.ico'
                  });
                } catch (error) {
                  console.error('Erro ao criar notificação de teste:', error);
                }
              }, 1000);
            } else if (permission === 'denied') {
              toast({
                title: "Permissão negada",
                description: "Você pode ativar notificações nas configurações do navegador.",
                variant: "destructive"
              });
            }
          } catch (error) {
            console.error('Erro ao solicitar permissão:', error);
            toast({
              title: "Erro ao solicitar permissão",
              description: "Não foi possível solicitar permissão de notificação.",
              variant: "destructive"
            });
            return 'denied';
          }
        } else {
          newStatus = Notification.permission as Permission['status'];
          if (newStatus === 'granted') {
            toast({
              title: "Notificações já ativadas!",
              description: "As notificações já estão funcionando.",
            });
          } else if (newStatus === 'denied') {
            toast({
              title: "Permissão negada anteriormente",
              description: "Ative as notificações nas configurações do navegador.",
              variant: "destructive"
            });
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
            // Testa se consegue solicitar o wake lock
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
