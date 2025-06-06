
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle } from "lucide-react";
import { Permission } from "@/types/permissions";
import { defaultPermissions } from "@/data/permissionsData";
import { checkAllPermissions } from "@/utils/permissionChecker";
import { requestPermission, requestAllPermissions } from "@/utils/permissionRequester";
import { PermissionItem } from "./PermissionItem";

export const PermissionsManager = () => {
  const [permissions, setPermissions] = useState<Permission[]>(defaultPermissions);
  const [allPermissionsChecked, setAllPermissionsChecked] = useState(false);

  useEffect(() => {
    initializePermissions();
  }, []);

  const initializePermissions = async () => {
    const updatedPermissions = await checkAllPermissions(permissions);
    setPermissions(updatedPermissions);
    setAllPermissionsChecked(true);
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
        <CardTitle className="text-base md:text-lg text-blue-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 md:h-5 md:w-5" />
          Permissões do Aplicativo
        </CardTitle>
        <p className="text-xs md:text-sm text-gray-600">
          Para o melhor funcionamento do app, precisamos das seguintes permissões:
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
