
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, HardDrive, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Permission {
  id: string;
  name: string;
  description: string;
  icon: any;
  status: 'granted' | 'denied' | 'prompt' | 'unknown';
  isRequired: boolean;
}

export const PermissionsManager = () => {
  const [permissions, setPermissions] = useState<Permission[]>([
    {
      id: 'notifications',
      name: 'Notificações',
      description: 'Receber lembretes e alertas de tarefas',
      icon: Bell,
      status: 'unknown',
      isRequired: true
    },
    {
      id: 'storage',
      name: 'Armazenamento Local',
      description: 'Salvar dados localmente no dispositivo',
      icon: HardDrive,
      status: 'unknown',
      isRequired: true
    },
    {
      id: 'wakeLock',
      name: 'Manter Tela Ativa',
      description: 'Manter a tela ativa durante sessões de foco',
      icon: Clock,
      status: 'unknown',
      isRequired: false
    }
  ]);

  const [allPermissionsChecked, setAllPermissionsChecked] = useState(false);

  useEffect(() => {
    checkAllPermissions();
  }, []);

  const checkAllPermissions = async () => {
    const updatedPermissions = await Promise.all(
      permissions.map(async (permission) => {
        const status = await checkPermission(permission.id);
        return { ...permission, status };
      })
    );
    
    setPermissions(updatedPermissions);
    setAllPermissionsChecked(true);
  };

  const checkPermission = async (permissionId: string): Promise<Permission['status']> => {
    try {
      switch (permissionId) {
        case 'notifications':
          if ('Notification' in window) {
            const permission = Notification.permission;
            return permission as Permission['status'];
          }
          return 'denied';

        case 'storage':
          if ('localStorage' in window) {
            try {
              localStorage.setItem('permission-test', 'test');
              localStorage.removeItem('permission-test');
              return 'granted';
            } catch {
              return 'denied';
            }
          }
          return 'denied';

        case 'wakeLock':
          if ('wakeLock' in navigator) {
            return 'granted';
          }
          return 'denied';

        default:
          return 'unknown';
      }
    } catch (error) {
      console.error(`Erro ao verificar permissão ${permissionId}:`, error);
      return 'denied';
    }
  };

  const requestPermission = async (permissionId: string) => {
    try {
      let newStatus: Permission['status'] = 'denied';

      switch (permissionId) {
        case 'notifications':
          if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            newStatus = permission as Permission['status'];
            
            if (permission === 'granted') {
              toast({
                title: "Permissão concedida!",
                description: "Agora você receberá notificações de lembretes.",
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
          } catch {
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
              // Testa se a API está disponível
              newStatus = 'granted';
              toast({
                title: "Controle de tela disponível!",
                description: "O app pode manter a tela ativa durante sessões de foco.",
              });
            } catch {
              newStatus = 'denied';
            }
          }
          break;
      }

      // Atualiza o status da permissão
      setPermissions(prev => prev.map(p => 
        p.id === permissionId ? { ...p, status: newStatus } : p
      ));

    } catch (error) {
      console.error(`Erro ao solicitar permissão ${permissionId}:`, error);
      toast({
        title: "Erro",
        description: "Não foi possível solicitar a permissão.",
        variant: "destructive"
      });
    }
  };

  const requestAllPermissions = async () => {
    for (const permission of permissions) {
      if (permission.status !== 'granted' && permission.isRequired) {
        await requestPermission(permission.id);
        // Pequena pausa entre solicitações
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  };

  const getStatusIcon = (status: Permission['status']) => {
    switch (status) {
      case 'granted':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'denied':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'prompt':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: Permission['status']) => {
    switch (status) {
      case 'granted':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'denied':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'prompt':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: Permission['status']) => {
    switch (status) {
      case 'granted':
        return 'Concedida';
      case 'denied':
        return 'Negada';
      case 'prompt':
        return 'Pendente';
      default:
        return 'Desconhecida';
    }
  };

  const requiredPermissionsGranted = permissions
    .filter(p => p.isRequired)
    .every(p => p.status === 'granted');

  if (!allPermissionsChecked) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm border-blue-200">
        <CardContent className="p-6">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto text-blue-600 mb-2" />
            <p className="text-gray-600">Verificando permissões...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-blue-200">
      <CardHeader>
        <CardTitle className="text-lg text-blue-700 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Permissões do Aplicativo
        </CardTitle>
        <p className="text-sm text-gray-600">
          Para o melhor funcionamento do app, precisamos das seguintes permissões:
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {permissions.map((permission) => {
          const IconComponent = permission.icon;
          return (
            <div key={permission.id} className="flex items-center gap-3 p-4 border rounded-lg bg-white">
              <IconComponent className="h-6 w-6 text-blue-600" />
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-gray-800">{permission.name}</h3>
                  {permission.isRequired && (
                    <Badge variant="outline" className="bg-orange-100 text-orange-700 text-xs">
                      Obrigatória
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">{permission.description}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={getStatusColor(permission.status)}>
                  {getStatusIcon(permission.status)}
                  <span className="ml-1">{getStatusText(permission.status)}</span>
                </Badge>
                
                {permission.status !== 'granted' && (
                  <Button
                    size="sm"
                    onClick={() => requestPermission(permission.id)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Permitir
                  </Button>
                )}
              </div>
            </div>
          );
        })}
        
        {!requiredPermissionsGranted && (
          <div className="pt-4 border-t">
            <Button 
              onClick={requestAllPermissions}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Conceder Todas as Permissões Obrigatórias
            </Button>
          </div>
        )}
        
        {requiredPermissionsGranted && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Todas as permissões obrigatórias foram concedidas!</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
