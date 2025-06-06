
import { Permission } from "@/types/permissions";
import { toast } from "@/hooks/use-toast";

export const requestPermission = async (permissionId: string): Promise<Permission['status']> => {
  console.log(`Solicitando permissão: ${permissionId}`);
  
  try {
    let newStatus: Permission['status'] = 'denied';

    switch (permissionId) {
      case 'notifications':
        // Verifica se o navegador suporta notificações de forma mais ampla
        if (!('Notification' in window) && !('webkitNotifications' in window)) {
          console.log('Notification API não disponível neste navegador');
          toast({
            title: "Lembretes alternativos ativados",
            description: "Usaremos lembretes visuais no próprio app ao invés de notificações do sistema.",
          });
          // Considera como concedida para continuar funcionando
          return 'granted';
        }

        // Tenta usar a API padrão primeiro
        let NotificationAPI = window.Notification;
        
        // Fallback para webkit se necessário
        if (!NotificationAPI && (window as any).webkitNotifications) {
          NotificationAPI = (window as any).webkitNotifications;
        }

        if (!NotificationAPI) {
          console.log('Nenhuma API de notificação disponível');
          toast({
            title: "Lembretes no app ativados",
            description: "Seus lembretes aparecerão diretamente no aplicativo.",
          });
          return 'granted';
        }

        console.log('Estado atual da notificação:', NotificationAPI.permission);
        
        if (NotificationAPI.permission === 'default') {
          console.log('Solicitando permissão de notificação...');
          try {
            const permission = await NotificationAPI.requestPermission();
            console.log('Resultado da solicitação:', permission);
            newStatus = permission as Permission['status'];
            
            if (permission === 'granted') {
              toast({
                title: "Notificações ativadas!",
                description: "Agora você receberá lembretes do sistema.",
              });
              
              // Testa enviando uma notificação local
              setTimeout(() => {
                try {
                  new NotificationAPI('TDAHFOCUS', {
                    body: 'Notificações ativadas com sucesso!',
                    icon: '/favicon.ico'
                  });
                } catch (error) {
                  console.error('Erro ao criar notificação de teste:', error);
                }
              }, 1000);
            } else if (permission === 'denied') {
              toast({
                title: "Lembretes no app ativados",
                description: "Seus lembretes aparecerão dentro do aplicativo. Para notificações do sistema, ative nas configurações do navegador.",
              });
              // Considera como concedida para funcionalidade alternativa
              newStatus = 'granted';
            }
          } catch (error) {
            console.error('Erro ao solicitar permissão:', error);
            toast({
              title: "Lembretes ativados",
              description: "Usaremos lembretes visuais no app. Para notificações do sistema, ative manualmente nas configurações.",
            });
            return 'granted';
          }
        } else {
          newStatus = NotificationAPI.permission as Permission['status'];
          if (newStatus === 'granted') {
            toast({
              title: "Notificações já ativadas!",
              description: "As notificações do sistema já estão funcionando.",
            });
          } else if (newStatus === 'denied') {
            toast({
              title: "Lembretes no app ativados",
              description: "Seus lembretes aparecerão dentro do aplicativo.",
            });
            // Considera como concedida para funcionalidade alternativa
            newStatus = 'granted';
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
