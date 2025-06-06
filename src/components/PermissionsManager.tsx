
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, RefreshCw, Smartphone } from "lucide-react";
import { Permission } from "@/types/permissions";
import { defaultPermissions } from "@/data/permissionsData";
import { checkAllPermissions } from "@/utils/permissionChecker";
import { requestPermission, requestAllPermissions } from "@/utils/permissionRequester";
import { PermissionItem } from "./PermissionItem";
import { useFirstTimeSetup } from "@/hooks/useFirstTimeSetup";
import { isNativeAndroidApp } from "@/utils/androidNotifications";

export const PermissionsManager = () => {
  const [permissions, setPermissions] = useState<Permission[]>(defaultPermissions);
  const [allPermissionsChecked, setAllPermissionsChecked] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { 
    isFirstTime, 
    isSetupComplete, 
    isRequestingPermissions, 
    requestAllPermissionsOnFirstTime,
    resetFirstTimeSetup
  } = useFirstTimeSetup();

  useEffect(() => {
    initializePermissions();
    
    // Se é primeira vez, solicita permissões automaticamente
    if (isFirstTime && !isRequestingPermissions) {
      // Aguarda um pouco para a interface carregar
      setTimeout(() => {
        requestAllPermissionsOnFirstTime();
      }, 1500);
    }
    
    // Verifica permissões a cada 3 segundos para detectar mudanças manuais
    const interval = setInterval(() => {
      checkPermissionsQuietly();
    }, 3000);
    
    // Verifica quando a página volta ao foco
    const handleFocus = () => {
      setTimeout(() => {
        checkPermissionsQuietly();
      }, 1000);
    };
    
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        setTimeout(() => {
          checkPermissionsQuietly();
        }, 1000);
      }
    });

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isFirstTime, isRequestingPermissions]);

  const initializePermissions = async () => {
    console.log('Inicializando verificação de permissões...');
    const updatedPermissions = await checkAllPermissions(permissions);
    setPermissions(updatedPermissions);
    setAllPermissionsChecked(true);
  };

  const checkPermissionsQuietly = async () => {
    try {
      const updatedPermissions = await checkAllPermissions(permissions);
      setPermissions(updatedPermissions);
    } catch (error) {
      console.log('Erro na verificação silenciosa:', error);
    }
  };

  const handleRefreshPermissions = async () => {
    setIsRefreshing(true);
    console.log('Atualizando status das permissões...');
    
    try {
      const updatedPermissions = await checkAllPermissions(permissions);
      setPermissions(updatedPermissions);
      
      // Verifica se alguma permissão foi concedida
      const newlyGranted = updatedPermissions.filter((perm, index) => 
        permissions[index].status !== 'granted' && perm.status === 'granted'
      );
      
      if (newlyGranted.length > 0) {
        console.log('Permissões detectadas como concedidas:', newlyGranted.map(p => p.name));
      }
    } catch (error) {
      console.error('Erro ao atualizar permissões:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePermissionRequest = async (permissionId: string) => {
    const newStatus = await requestPermission(permissionId);
    updatePermissionStatus(permissionId, newStatus);
  };

  const updatePermissionStatus = (permissionId: string, status: Permission['status']) => {
    setPermissions(prev => prev.map(p => 
      p.id === permissionId ? { ...p, status } : p
    ));
  };

  const handleRequestAllPermissions = async () => {
    await requestAllPermissions(permissions, updatePermissionStatus);
  };

  const requiredPermissionsGranted = permissions
    .filter(p => p.isRequired)
    .every(p => p.status === 'granted');

  // Se está solicitando permissões automaticamente na primeira vez
  if (isRequestingPermissions) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-green-50 border-blue-200 shadow-lg">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
              <Smartphone className="h-8 w-8 text-blue-600 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-700 mb-2">
                🎯 Configurando seu TDAHFOCUS...
              </h3>
              <p className="text-blue-600 text-sm">
                Solicitando permissões para melhor experiência!
              </p>
              {isNativeAndroidApp() && (
                <p className="text-xs text-green-600 mt-2">
                  💡 Aparecerá uma janela do Android para permitir notificações
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Se já foi configurado com sucesso
  if (isSetupComplete && requiredPermissionsGranted) {
    return (
      <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200 shadow-lg">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="p-4 bg-green-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-700 mb-2">
                🎉 App configurado com sucesso!
              </h3>
              <p className="text-green-600 text-sm">
                Todas as permissões foram concedidas! Seu TDAHFOCUS está pronto para usar! 🚀
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={resetFirstTimeSetup}
              className="text-xs"
            >
              Reconfigurar permissões
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!allPermissionsChecked) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm border-blue-200">
        <CardContent className="p-4 md:p-6">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto text-blue-600 mb-2" />
            <p className="text-gray-600 text-sm md:text-base">Verificando permissões...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-blue-200">
      <CardHeader className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-base md:text-lg text-blue-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 md:h-5 md:w-5" />
            Permissões do Aplicativo
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefreshPermissions}
            disabled={isRefreshing}
            className="text-xs"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
        <p className="text-xs md:text-sm text-gray-600">
          Para o melhor funcionamento do app, precisamos das seguintes permissões:
        </p>
        <p className="text-xs text-blue-600 mt-1">
          💡 Se você concedeu permissões manualmente, clique em "Atualizar" para detectá-las
        </p>
      </CardHeader>
      <CardContent className="space-y-3 md:space-y-4 p-4 md:p-6 pt-0">
        {permissions.map((permission) => (
          <PermissionItem
            key={permission.id}
            permission={permission}
            onRequest={handlePermissionRequest}
          />
        ))}
        
        {!requiredPermissionsGranted && (
          <div className="pt-3 md:pt-4 border-t">
            <Button 
              onClick={handleRequestAllPermissions}
              className="w-full bg-green-600 hover:bg-green-700 text-sm h-10 px-4"
            >
              Conceder Todas as Permissões
            </Button>
          </div>
        )}
        
        {requiredPermissionsGranted && (
          <div className="pt-3 md:pt-4 border-t">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4 md:h-5 md:w-5" />
              <span className="font-medium text-sm md:text-base">Todas as permissões obrigatórias foram concedidas!</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
