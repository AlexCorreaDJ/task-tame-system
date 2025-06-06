import { Permission } from "@/types/permissions";
import { toast } from "@/hooks/use-toast";

const isAndroidApp = () => {
  const userAgent = navigator.userAgent;
  const isAndroid = /Android/i.test(userAgent);
  const isCapacitor = !!(window as any).Capacitor;
  const isWebView = /wv|WebView/i.test(userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  
  return isAndroid && (isCapacitor || isWebView || isStandalone);
};

// Função específica para solicitar permissão no Android
const requestAndroidNotificationPermission = async (): Promise<Permission['status']> => {
  console.log('📱 Solicitando permissão de notificação no Android...');
  
  try {
    // Para Android, força a solicitação mesmo se o status for 'default'
    const permission = await Notification.requestPermission();
    console.log('📱 Resposta da solicitação Android:', permission);
    
    if (permission === 'granted') {
      // Testa imediatamente com uma notificação
      setTimeout(() => {
        try {
          const testNotification = new Notification('🎉 TDAHFOCUS - Permissão Concedida!', {
            body: 'Agora você receberá notificações na barra de notificações do Android! 📱🔔',
            icon: '/favicon.ico',
            tag: 'android-welcome',
            silent: false,
            requireInteraction: true
          });
          
          console.log('📱 Notificação de teste criada para Android');
          
          setTimeout(() => {
            testNotification.close();
          }, 6000);
        } catch (error) {
          console.error('❌ Erro ao criar notificação de teste:', error);
        }
      }, 1000);
      
      return 'granted';
    } else if (permission === 'denied') {
      return 'denied';
    } else {
      return 'prompt';
    }
  } catch (error) {
    console.error('❌ Erro ao solicitar permissão no Android:', error);
    return 'denied';
  }
};

export const requestPermission = async (permissionId: string): Promise<Permission['status']> => {
  console.log(`🔔 Solicitando permissão: ${permissionId}`);
  
  try {
    let newStatus: Permission['status'] = 'denied';

    switch (permissionId) {
      case 'notifications':
        const isApp = isAndroidApp();
        console.log('📱 É aplicativo Android:', isApp);
        
        // Verifica se a API está disponível
        if (!('Notification' in window)) {
          console.log('❌ API de Notification não disponível');
          toast({
            title: "❌ Notificações não suportadas",
            description: "Este dispositivo não suporta notificações do sistema.",
            variant: "destructive"
          });
          return 'denied';
        }

        console.log('✅ API de Notification disponível, status atual:', Notification.permission);
        
        // Para navegadores (não apps), verifica HTTPS
        if (!isApp) {
          const isSecure = location.protocol === 'https:' || 
                          location.hostname === 'localhost' || 
                          location.hostname === '127.0.0.1';
          
          if (!isSecure) {
            toast({
              title: "❌ Contexto inseguro",
              description: "Notificações requerem HTTPS no navegador. Use um app ou HTTPS.",
              variant: "destructive"
            });
            return 'denied';
          }
        }
        
        // Se já foi negada anteriormente, orienta o usuário
        if (Notification.permission === 'denied') {
          toast({
            title: "🔒 Notificações bloqueadas",
            description: isApp ? 
              "Vá em Configurações > Apps > TDAHFOCUS > Notificações > Permitir" :
              "Vá nas configurações do navegador > Notificações > Permitir para este site",
            variant: "destructive"
          });
          return 'denied';
        }

        // Se já está concedida, testa se realmente funciona
        if (Notification.permission === 'granted') {
          toast({
            title: "✅ Notificações já ativas!",
            description: "Testando se as notificações aparecem na barra do Android...",
          });
          
          // Testa com uma notificação imediata para Android
          setTimeout(() => {
            try {
              const testNotification = new Notification('🎯 TDAHFOCUS - Teste', {
                body: 'Se você vê esta notificação na barra do Android, está funcionando! 📱✨',
                icon: '/favicon.ico',
                tag: 'android-test',
                silent: false,
                requireInteraction: true
              });
              
              setTimeout(() => {
                testNotification.close();
              }, 5000);
            } catch (error) {
              console.error('❌ Erro ao criar notificação de teste:', error);
            }
          }, 1000);
          
          return 'granted';
        }

        // Solicita permissão (especialmente importante para Android)
        if (Notification.permission === 'default') {
          console.log('📱 Forçando solicitação de permissão para Android...');
          
          if (isApp) {
            newStatus = await requestAndroidNotificationPermission();
          } else {
            try {
              const permission = await Notification.requestPermission();
              console.log('🌐 Resultado da solicitação no navegador:', permission);
              
              if (permission === 'granted') {
                toast({
                  title: "✅ Notificações ativadas!",
                  description: "Agora você receberá lembretes para suas tarefas.",
                });
                newStatus = 'granted';
              } else if (permission === 'denied') {
                toast({
                  title: "❌ Notificações negadas",
                  description: "Você negou as notificações. Ative nas configurações do navegador.",
                  variant: "destructive"
                });
                newStatus = 'denied';
              } else {
                newStatus = 'prompt';
              }
            } catch (error) {
              console.error('❌ Erro ao solicitar permissão no navegador:', error);
              newStatus = 'denied';
            }
          }
          
          // Se conseguiu a permissão, mostra feedback específico para Android
          if (newStatus === 'granted' && isApp) {
            toast({
              title: "🎉 Sucesso no Android!",
              description: "Notificações ativadas! Você verá os lembretes na barra de notificações do seu Android! 📱🔔",
            });
          } else if (newStatus === 'denied' && isApp) {
            toast({
              title: "⚠️ Permissão necessária",
              description: "Para receber notificações, vá em: Configurações > Apps > TDAHFOCUS > Notificações > Permitir",
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
  console.log('🔔 Solicitando todas as permissões para Android...');
  
  toast({
    title: "📱 Configurando para Android",
    description: "Vamos solicitar as permissões necessárias para o funcionamento do app no Android.",
  });
  
  for (const permission of permissions) {
    if (permission.status !== 'granted' && permission.isRequired) {
      console.log(`🔄 Processando permissão: ${permission.id}`);
      const newStatus = await requestPermission(permission.id);
      onPermissionUpdate(permission.id, newStatus);
      // Pausa entre solicitações para Android
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Verifica se todas as permissões obrigatórias foram concedidas
  const allGranted = permissions
    .filter(p => p.isRequired)
    .every(p => p.status === 'granted');
    
  if (allGranted) {
    toast({
      title: "🎉 App configurado para Android!",
      description: "Todas as permissões foram concedidas! Seu app está pronto para uso no Android. 📱✨",
    });
  } else {
    toast({
      title: "⚠️ Algumas permissões pendentes",
      description: "Para funcionar completamente no Android, conceda todas as permissões em Configurações > Apps > TDAHFOCUS.",
      variant: "destructive"
    });
  }
};
