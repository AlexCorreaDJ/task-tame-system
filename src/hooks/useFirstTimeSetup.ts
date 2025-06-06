
import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { toast } from '@/hooks/use-toast';
import { requestAndroidNotificationPermission, isNativeAndroidApp } from '@/utils/androidNotifications';

export const useFirstTimeSetup = () => {
  const [isFirstTime, setIsFirstTime] = useLocalStorage('focusflow-first-time', true);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isRequestingPermissions, setIsRequestingPermissions] = useState(false);
  const [hasAttemptedSetup, setHasAttemptedSetup] = useState(false);

  const requestAllPermissionsOnFirstTime = async () => {
    if (!isFirstTime || isRequestingPermissions || hasAttemptedSetup) return;
    
    console.log('🎯 Primeiro acesso detectado! Solicitando permissões automaticamente...');
    setIsRequestingPermissions(true);
    setHasAttemptedSetup(true);

    try {
      // Toast de boas-vindas
      toast({
        title: "🎉 Bem-vindo ao TDAHFOCUS!",
        description: "Vamos configurar as permissões para melhor experiência!",
      });

      // Aguarda um pouco para o usuário ver a mensagem
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Solicita permissão de notificações
      console.log('📱 Solicitando permissão de notificações automaticamente...');
      const notificationGranted = await requestAndroidNotificationPermission();

      // Testa localStorage
      let storageGranted = false;
      try {
        localStorage.setItem('focusflow-setup-test', 'test');
        localStorage.removeItem('focusflow-setup-test');
        storageGranted = true;
      } catch (error) {
        console.error('❌ Erro no localStorage:', error);
      }

      // Testa Wake Lock se disponível
      let wakeLockGranted = false;
      if ('wakeLock' in navigator) {
        try {
          const wakeLock = await (navigator as any).wakeLock.request('screen');
          await wakeLock.release();
          wakeLockGranted = true;
        } catch (error) {
          console.log('⚠️ Wake Lock não disponível:', error);
        }
      }

      // Marca como não sendo mais o primeiro acesso SEMPRE após tentar
      setIsFirstTime(false);

      // Feedback do resultado
      if (notificationGranted && storageGranted) {
        console.log('✅ Configuração completa com sucesso!');
        setIsSetupComplete(true);
        
        if (isNativeAndroidApp()) {
          toast({
            title: "🎉 App configurado com sucesso!",
            description: "Notificações nativas ativadas! Você receberá lembretes na barra do Android! 📱🔔✨",
          });
        } else {
          toast({
            title: "✅ Configuração completa!",
            description: "Todas as permissões foram concedidas! Seu app está pronto! 🚀",
          });
        }
      } else {
        console.log('⚠️ Algumas permissões não foram concedidas');
        
        if (isNativeAndroidApp()) {
          toast({
            title: "⚠️ Configuração parcial",
            description: "Para funcionar completamente, vá em: Configurações > Apps > TDAHFOCUS > Permissões",
            variant: "destructive"
          });
        } else {
          toast({
            title: "⚠️ Permissões pendentes",
            description: "Algumas permissões precisam ser configuradas manualmente.",
            variant: "destructive"
          });
        }
      }

    } catch (error) {
      console.error('❌ Erro na configuração inicial:', error);
      // Marca como não sendo mais o primeiro acesso mesmo com erro
      setIsFirstTime(false);
      
      toast({
        title: "❌ Erro na configuração",
        description: "Houve um problema. Você pode configurar manualmente depois.",
        variant: "destructive"
      });
    } finally {
      setIsRequestingPermissions(false);
    }
  };

  const resetFirstTimeSetup = () => {
    setIsFirstTime(true);
    setIsSetupComplete(false);
    setHasAttemptedSetup(false);
  };

  return {
    isFirstTime,
    isSetupComplete,
    isRequestingPermissions,
    requestAllPermissionsOnFirstTime,
    resetFirstTimeSetup
  };
};
